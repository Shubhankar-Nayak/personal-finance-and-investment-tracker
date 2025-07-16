import express from 'express';
import {
  getInvestments,
  addInvestment,
} from '../controllers/investmentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getInvestments)
  .post(protect, addInvestment);

export default router;
