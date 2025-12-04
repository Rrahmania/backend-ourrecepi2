import express from 'express';
import {
  getUserFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
} from '../controllers/favoriteController.js';
import { authMiddleware } from '../middleware/requireAuth.js';

const router = express.Router();

// Protected routes (semua memerlukan auth)
router.get('/', authMiddleware, getUserFavorites);
router.post('/', authMiddleware, addFavorite);
router.delete('/:recipeId', authMiddleware, removeFavorite);
router.get('/check/:recipeId', authMiddleware, isFavorite);

export default router;
