import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  setPassword,
  changePassword,
  clearUserData,
  exportUserData
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Route (Get current user)
router.get('/me', getMe);

router.post('/set-password', protect, setPassword);
router.post('/change-password', protect, changePassword);

router.delete('/data', protect, clearUserData);

router.get('/export', protect, exportUserData);

export default router;
