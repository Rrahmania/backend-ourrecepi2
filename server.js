import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import { PORT, FRONTEND_URL } from './config.js';
import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: FRONTEND_URL, // Allow configured frontend URL
  credentials: true,
}));

// Diagnostic environment summary (do not print secrets)
console.log('🔧 Environment summary:', {
  PORT: process.env.PORT || PORT,
  FRONTEND_URL: FRONTEND_URL,
  has_DATABASE_URL: !!process.env.DATABASE_URL,
  has_DB_HOST: !!process.env.DB_HOST,
});

// Global error handlers to ensure errors appear in platform logs
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err && err.stack ? err.stack : err);
  // allow process to exit after logging
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('🔥 Unhandled Rejection:', reason);
  // allow process to exit after logging
  process.exit(1);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Wrap startup in async IIFE to properly await DB connection
(async () => {
  // Connect Database
  await connectDB();

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/recipes', recipeRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/ratings', ratingRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ message: 'Server running smoothly!' });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: 'Route tidak ditemukan' });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})(); // Close async IIFE
