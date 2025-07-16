import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Route (Get current user)
router.get('/me', protect, getMe);

export default router;
