import express from 'express';
import {
  getBudgets,
  addBudget,
} from '../controllers/budgetController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getBudgets)
  .post(protect, addBudget);

export default router;
