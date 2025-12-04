import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5010;

// Support both DATABASE_URL (managed services) and individual DB vars
let DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD;

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL for managed services (Railway, Render, etc.)
  // Format: postgresql://user:password@host:port/dbname
  const url = new URL(process.env.DATABASE_URL);
  DB_HOST = url.hostname;
  DB_PORT = parseInt(url.port, 10) || 5432;
  DB_NAME = url.pathname.substring(1); // Remove leading /
  DB_USER = url.username;
  DB_PASSWORD = url.password;
} else {
  // Fall back to individual env vars
  DB_HOST = process.env.DB_HOST || 'localhost';
  DB_PORT = parseInt(process.env.DB_PORT, 10) || 5432;
  DB_NAME = process.env.DB_NAME || 'resep_database';
  DB_USER = process.env.DB_USER || 'postgres';
  DB_PASSWORD = process.env.DB_PASSWORD || 'admin123';
}

const JWT_SECRET = process.env.JWT_SECRET || 'justanomaly016025034123133';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export { PORT, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, JWT_EXPIRE, FRONTEND_URL };
