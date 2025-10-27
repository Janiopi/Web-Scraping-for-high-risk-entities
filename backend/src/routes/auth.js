import express from 'express';
import {
  login,
  register,
  getProfile,
  logout,
  getStats,
  verifyToken,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes

// POST /auth/login - Log in
router.post('/login', login);

// POST /auth/register - Register
router.post('/register', register);

// Protected Routes

// GET /auth/profile - Get profile of authenticated user
router.get('/profile', authenticate, getProfile);

// POST /auth/logout - Log out
router.post('/logout', authenticate, logout);

// GET /auth/stats - Get stats from db (admin only)
router.get('/stats', authenticate, getStats);

// GET /auth/verify - Verify token validity
router.get('/verify', authenticate, verifyToken);

export default router;
