import { Response, Request } from 'express';
import { Investment } from '../models/Investment';
import { UserDocument } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

export const getInvestments = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const investments = await Investment.find({ userId: req.user._id });
    res.json(investments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addInvestment = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const newInvestment = await Investment.create({ ...req.body, userId: req.user._id });
    res.status(201).json(newInvestment);
  } catch (err) {
    res.status(400).json({ message: 'Invalid investment data' });
  }
};

export const updateInvestment = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user._id;
  const investmentId = req.params.id;

  try {
    const investment = await Investment.findOne({ _id: investmentId, userId });
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    const updated = await Investment.findByIdAndUpdate(investmentId, req.body, {
      new: true,
    });

    res.json({
      ...updated.toObject(),
      id: updated._id,
    });

  } catch (err) {
    res.status(500).json({ message: 'Error updating investment' });
  }
};

export const deleteInvestment = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user._id;
  const investmentId = req.params.id;

  try {
    const investment = await Investment.findOne({ _id: investmentId, userId });
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    await Investment.findByIdAndDelete(investmentId);
    res.json({ message: 'Investment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting investment' });
  }
};