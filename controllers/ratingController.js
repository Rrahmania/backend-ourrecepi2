import { Rating, Recipe, User } from '../db.js';

// Add or update a rating (one per user per recipe)
export const upsertRating = async (req, res) => {
  try {
    const { recipeId, score, comment } = req.body;
    const userId = req.userId;

    if (!recipeId || !score) return res.status(400).json({ message: 'recipeId dan score harus diisi' });
    if (score < 1 || score > 5) return res.status(400).json({ message: 'score harus antara 1-5' });

    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) return res.status(404).json({ message: 'Resep tidak ditemukan' });

    const [rating, created] = await Rating.upsert({ userId, recipeId, score, comment }, { returning: true });

    return res.status(200).json({ message: created ? 'Rating dibuat' : 'Rating diperbarui', rating });
  } catch (error) {
    return res.status(500).json({ message: 'Error menyimpan rating', error: error.message });
  }
};

// Get ratings for a recipe and average
export const getRatingsByRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) return res.status(404).json({ message: 'Resep tidak ditemukan' });

    const ratings = await Rating.findAll({ where: { recipeId }, include: [{ model: User, as: 'user', attributes: ['id','name','avatar'] }], order: [['createdAt','DESC']] });
    const avg = ratings.length ? (ratings.reduce((s, r) => s + r.score, 0) / ratings.length) : 0;

    return res.status(200).json({ message: 'Ratings fetched', average: Number(avg.toFixed(2)), count: ratings.length, ratings });
  } catch (error) {
    return res.status(500).json({ message: 'Error mengambil rating', error: error.message });
  }
};

// Remove rating by current user for a recipe
export const removeRating = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.userId;

    const deleted = await Rating.destroy({ where: { userId, recipeId } });
    if (!deleted) return res.status(404).json({ message: 'Rating tidak ditemukan' });

    return res.status(200).json({ message: 'Rating dihapus' });
  } catch (error) {
    return res.status(500).json({ message: 'Error menghapus rating', error: error.message });
  }
};
