import { Budget } from '../models/Budget';

export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addBudget = async (req, res) => {
  try {
    const newBudget = await Budget.create({ ...req.body, userId: req.user._id });
    res.status(201).json(newBudget);
  } catch (err) {
    res.status(400).json({ message: 'Invalid budget data' });
  }
};
