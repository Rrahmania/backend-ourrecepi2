import express from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/requireAuth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);

export default router;
