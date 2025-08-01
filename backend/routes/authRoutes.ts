import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  sendOtpToEmail,
} from '../controllers/userController';
import { googleLogin } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Register new user
router.post('/register', registerUser);

// Login with email & password
router.post('/login', loginUser);

// Login with Google OAuth
router.post('/google', googleLogin);

// Get current logged-in user
router.get('/me', protect, getMe);

router.post('/send-otp', sendOtpToEmail);

export default router;
