import { verifyToken } from './auth.js';
import { isBlacklisted } from './tokenBlacklist.js';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer token

    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    // Check blacklist first
    if (isBlacklisted(token)) {
      return res.status(401).json({ message: 'Token sudah di-logout' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Token tidak valid atau expired' });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error autentikasi', error: error.message });
  }
};
