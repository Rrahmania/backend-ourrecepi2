import express from 'express';
import { upsertRating, getRatingsByRecipe, removeRating } from '../controllers/ratingController.js';
import { authMiddleware } from '../middleware/requireAuth.js';

const router = express.Router();

// Protected: add or update rating
router.post('/', authMiddleware, upsertRating);

// Public: get ratings and average for a recipe
router.get('/:recipeId', getRatingsByRecipe);

// Protected: remove rating by current user
router.delete('/:recipeId', authMiddleware, removeRating);

export default router;
