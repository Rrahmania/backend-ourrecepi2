import bcrypt from 'bcryptjs';
import { User } from '../db.js';
import { generateToken } from '../middleware/auth.js';
import { addToken } from '../middleware/tokenBlacklist.js';
import { Op } from 'sequelize';

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Lengkapi semua field' });
    }

    // Cek apakah user sudah ada
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { name }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Email atau nama pengguna sudah terdaftar',
        field: existingUser.email === email ? 'email' : 'name',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(newUser.id);

    res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registrasi', error: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    // Accept either email or name for login
    const { identifier, password, email, name } = req.body;
    const idValue = identifier || email || name;

    // Validasi input
    if (!idValue || !password) {
      return res.status(400).json({ message: 'Lengkapi semua field' });
    }

    // Cari user by email OR name
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: idValue }, { name: idValue }],
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Nama/email atau password salah' });
    }

    // Cek password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Nama/email atau password salah' });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error login', error: error.message });
  }
};

// Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error mengambil data user', error: error.message });
  }
};

// Logout
export const logout = (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      addToken(token);
    }
    return res.status(200).json({ message: 'Logout berhasil' });
  } catch (error) {
    return res.status(500).json({ message: 'Error saat logout', error: error.message });
  }
};
