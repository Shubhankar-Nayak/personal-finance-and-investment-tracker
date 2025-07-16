import { Investment } from '../models/Investment';

export const getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id });
    res.json(investments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addInvestment = async (req, res) => {
  try {
    const newInvestment = await Investment.create({ ...req.body, userId: req.user._id });
    res.status(201).json(newInvestment);
  } catch (err) {
    res.status(400).json({ message: 'Invalid investment data' });
  }
};
