import { Response } from 'express';
import { Transaction } from '../models/Transaction';
import { UserDocument } from '../models/User';

import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user._id;
  try {
    const transactions = await Transaction.find({ userId });
    res.json(transactions.map((t: any) => ({
      ...t.toObject(),
      id: t._id,
    })));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
};

export const addTransaction = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user._id;
  try {
    const newTx = await Transaction.create({ ...req.body, userId });
    res.status(201).json({
      ...newTx.toObject(),
      id: newTx._id,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error adding transaction' });
  }
};

export const updateTransaction = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user._id;
  const transactionId = req.params.id;

  try {
    const transaction = await Transaction.findOne({ _id: transactionId, userId });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const updated = await Transaction.findByIdAndUpdate(transactionId, req.body, {
      new: true,
    });

    res.json({
      ...updated.toObject(),
      id: updated._id,
    });

  } catch (err) {
    res.status(500).json({ message: 'Error updating transaction' });
  }
};

export const deleteTransaction = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user._id;
  const transactionId = req.params.id;

  try {
    const transaction = await Transaction.findOne({ _id: transactionId, userId });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await Transaction.findByIdAndDelete(transactionId);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting transaction' });
  }
};