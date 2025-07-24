import express from 'express';
import {
  getBudgets,
  addBudget,
  updateBudget,
  deleteBudget
} from '../controllers/budgetController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getBudgets)
  .post(protect, addBudget);

router
  .route('/:id')
  .put(protect, updateBudget)
  .delete(protect, deleteBudget);    

export default router;
