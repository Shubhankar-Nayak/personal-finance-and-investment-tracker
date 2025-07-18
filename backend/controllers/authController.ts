import { Response, Request } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; 
import { UserDocument } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Existing Google Login
export const googleLogin = async (req: AuthenticatedRequest, res: Response) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ message: 'Invalid Google token payload' });
    }

    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (!user) {
      user = await User.create({ email, name, googleId });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '30d' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

// New Email/Password Login
export const loginUser = async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if password exists (i.e., not a Google-only account)
  if (!user.password) {
    return res.status(400).json({
      message: 'This account was created with Google. Please use Google Login.',
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token,
  });
};
