import sequelize, { Recipe, User, Favorite, Rating } from '../db.js';

// Get all recipes
export const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: 'Berhasil mengambil semua resep',
      recipes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error mengambil resep', error: error.message });
  }
};

// Get recipe by ID
export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }

    res.status(200).json({
      message: 'Berhasil mengambil resep',
      recipe,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error mengambil resep', error: error.message });
  }
};

// Get recipes by category
export const getRecipesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const recipes = await Recipe.findAll({
      where: { category },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: `Berhasil mengambil resep kategori ${category}`,
      recipes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error mengambil resep', error: error.message });
  }
};

// Create recipe (Protected)
export const createRecipe = async (req, res) => {
  try {
    const { title, description, category, ingredients, instructions, image, prepTime, cookTime, servings, difficulty } = req.body;

    // Validasi
    if (!title || !category || !ingredients || !instructions) {
      return res.status(400).json({ message: 'Lengkapi field: title, category, ingredients, instructions' });
    }

    const newRecipe = await Recipe.create({
      title,
      description,
      category,
      ingredients: Array.isArray(ingredients) ? ingredients : JSON.parse(ingredients),
      instructions,
      image,
      prepTime,
      cookTime,
      servings,
      difficulty,
      userId: req.userId,
    });

    res.status(201).json({
      message: 'Resep berhasil dibuat',
      recipe: newRecipe,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error membuat resep', error: error.message });
  }
};

// Update recipe (Protected)
export const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, ingredients, instructions, image, prepTime, cookTime, servings, difficulty } = req.body;

    const recipe = await Recipe.findByPk(id);

    if (!recipe) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }

    // Cek apakah user adalah pembuat resep
    if (recipe.userId !== req.userId) {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk mengubah resep ini' });
    }

    await recipe.update({
      title: title || recipe.title,
      description: description || recipe.description,
      category: category || recipe.category,
      ingredients: ingredients ? (Array.isArray(ingredients) ? ingredients : JSON.parse(ingredients)) : recipe.ingredients,
      instructions: instructions || recipe.instructions,
      image: image || recipe.image,
      prepTime: prepTime || recipe.prepTime,
      cookTime: cookTime || recipe.cookTime,
      servings: servings || recipe.servings,
      difficulty: difficulty || recipe.difficulty,
    });

    res.status(200).json({
      message: 'Resep berhasil diperbarui',
      recipe,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error mengubah resep', error: error.message });
  }
};

// Delete recipe (Protected)
export const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findByPk(id);

    if (!recipe) {
      return res.status(404).json({ message: 'Resep tidak ditemukan' });
    }

    // Cek apakah user adalah pembuat resep
    if (recipe.userId !== req.userId) {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk menghapus resep ini' });
    }

    // Hapus dalam transaksi: hapus favorites & ratings terkait, lalu hapus resep
    const t = await sequelize.transaction();
    try {
      await Favorite.destroy({ where: { recipeId: id }, transaction: t });
      await Rating.destroy({ where: { recipeId: id }, transaction: t });
      await recipe.destroy({ transaction: t });

      await t.commit();

      res.status(200).json({
        message: 'Resep berhasil dihapus',
      });
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (error) {
    res.status(500).json({ message: 'Error menghapus resep', error: error.message });
  }
};

// Get user's recipes
export const getUserRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: 'Berhasil mengambil resep Anda',
      recipes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error mengambil resep', error: error.message });
  }
};
