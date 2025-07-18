import { Response, Request } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserDocument } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '30d' });
};

export const registerUser = async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const createdUser = await User.create({ name, email, password });

    const user = createdUser.toObject() as UserDocument & { _id: string };


    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id.toString()),
    });
  } catch (err) {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

export const loginUser = async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;
  

  try {
    const foundUser = await User.findOne({ email });

    if (!foundUser) return res.status(401).json({ message: 'Invalid credentials' });

    const user = foundUser.toObject() as UserDocument & { _id: string };

    const isMatch = await user?.matchPassword(password);

    if (!user || !isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id.toString()),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};
