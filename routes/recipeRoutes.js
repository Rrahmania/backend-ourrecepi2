import express from 'express';
import {
  getAllRecipes,
  getRecipeById,
  getRecipesByCategory,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getUserRecipes,
} from '../controllers/recipeController.js';
import { authMiddleware } from '../middleware/requireAuth.js';

const router = express.Router();

// Public routes
router.get('/', getAllRecipes);
router.get('/category/:category', getRecipesByCategory);
router.get('/:id', getRecipeById);

// Protected routes
router.post('/', authMiddleware, createRecipe);
router.put('/:id', authMiddleware, updateRecipe);
router.delete('/:id', authMiddleware, deleteRecipe);
router.get('/user/my-recipes', authMiddleware, getUserRecipes);

export default router;
