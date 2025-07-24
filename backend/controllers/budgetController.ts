import { Response, Request } from 'express';
import { Budget } from '../models/Budget';
import { UserDocument } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

export const getBudgets = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const budgets = await Budget.find({ userId: req.user._id });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addBudget = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user._id;
  try {
    const { category, amount, period, startDate, endDate } = req.body;

    const budget = await Budget.create({
      userId: req.user._id,
      category,
      amount,
      period,
      startDate,
      endDate
    });

    res.status(201).json({ ...budget.toObject(), id: budget._id });
  } catch (err) {
    res.status(400).json({ message: 'Invalid budget data' });
  }
};

export const updateBudget = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user._id;
  const budgetId = req.params.id;

  try {
    const budget = await Budget.findOne({ _id: budgetId, userId});
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const updated = await Budget.findByIdAndUpdate(budgetId, req.body, {
      new: true,
    });

    res.json({
      ...updated.toObject(),
      id: updated._id,
    });

  } catch (err) {
    res.status(500).json({ message: 'Error updating budget' });
  }
}

export const deleteBudget = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user._id;
  const budgetId = req.params.id;

  try {
    const budget = await Budget.findOne({ _id: budgetId, userId});
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await Budget.findByIdAndDelete(budgetId);
    res.json({ message: 'Budget deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting budget' });
  }
}