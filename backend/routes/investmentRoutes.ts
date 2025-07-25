import express from 'express';
import {
  getInvestments,
  addInvestment,
  updateInvestment,
  deleteInvestment
} from '../controllers/investmentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getInvestments)
  .post(protect, addInvestment);

router
  .route('/:id')
  .put(protect, updateInvestment)
  .delete(protect, deleteInvestment);  

export default router;
