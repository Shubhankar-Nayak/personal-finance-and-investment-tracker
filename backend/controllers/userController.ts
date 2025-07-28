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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token: generateToken(user._id.toString()),
    });
  } catch (err) {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

export const loginUser = async (req: AuthenticatedRequest, res: Response) => {

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(String(user._id));
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
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

export const setPassword = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = req.user;

  if (user.password) {
    return res.status(400).json({ message: 'Password already set' });
  }

  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: 'Password set successfully' });
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const user = req.user;

  const { currentPassword, newPassword } = req.body;

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Incorrect current password' });
  }

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters' });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: 'Password updated successfully' });
};
