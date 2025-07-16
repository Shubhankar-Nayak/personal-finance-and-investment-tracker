import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';

// Use the extended Request type
export const getTransactions = async (req: Request, res: Response) => {
  const userId = req.user._id; 
  try {
    const transactions = await Transaction.find({ userId });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
};

export const addTransaction = async (req: Request, res: Response) => {
  const userId = req.user._id; // No more error here
  try {
    const newTx = await Transaction.create({ ...req.body, userId });
    res.status(201).json(newTx);
  } catch (err) {
    res.status(500).json({ message: 'Error adding transaction' });
  }
};
