import { Favorite, Recipe, User } from '../db.js';

// Get user's favorites
export const getUserFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: Recipe,
          as: 'recipe',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name', 'avatar'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: 'Berhasil mengambil favorit',
      favorites,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error mengambil favorit', error: error.message });
  }
};

// Add to favorites
export const addFavorite = async (req, res) => {
  try {
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).json({ message: 'recipeId harus diisi' });
    }

    // Cek apakah resep ada
    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }

    // Cek apakah sudah di-favorite
    const existingFavorite = await Favorite.findOne({
      where: { userId: req.userId, recipeId },
    });

    if (existingFavorite) {
      return res.status(409).json({ message: 'Resep sudah ditambahkan ke favorit' });
    }

    const favorite = await Favorite.create({
      userId: req.userId,
      recipeId,
    });

    res.status(201).json({
      message: 'Resep berhasil ditambahkan ke favorit',
      favorite,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error menambah favorit', error: error.message });
  }
};

// Remove from favorites
export const removeFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;

    const favorite = await Favorite.findOne({
      where: { userId: req.userId, recipeId },
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorit tidak ditemukan' });
    }

    await favorite.destroy();

    res.status(200).json({
      message: 'Resep berhasil dihapus dari favorit',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error menghapus favorit', error: error.message });
  }
};

// Check if recipe is favorite
export const isFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;

    const favorite = await Favorite.findOne({
      where: { userId: req.userId, recipeId },
    });

    res.status(200).json({
      isFavorite: !!favorite,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error mengecek favorit', error: error.message });
  }
};
