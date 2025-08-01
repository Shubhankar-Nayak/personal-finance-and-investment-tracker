import { Response, Request } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserDocument } from '../models/User';
import { Transaction } from '../models/Transaction';
import { Budget } from '../models/Budget';
import { Investment } from '../models/Investment';
import PDFDocument from 'pdfkit';
import path from 'path';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '30d' });
};

export const registerUser = async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, otp, hash } = req.body;

  try {
    const [hashedOtp, expiresAt] = hash.split('.');
    if (Date.now() > parseInt(expiresAt)) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    const data = `${email}.${otp}.${expiresAt}`;
    const newHash = crypto.createHmac('sha256', process.env.OTP_SECRET || 'secure-secret').update(data).digest('hex');

    if (newHash !== hashedOtp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const createdUser = await User.create({ name, email, password });

    const user = createdUser.toObject() as UserDocument & { _id: string };


    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasPassword: !!user.password,
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
    const user = await User.findOne({ email }).select('+password');
    
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
        hasPassword: !!user.password,
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
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?.id).select('+password');
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const clearUserData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    await Transaction.deleteMany({ userId: userId });
    await Budget.deleteMany({ userId: userId });
    await Investment.deleteMany({ userId: userId });

    res.status(200).json({ message: 'All user data cleared successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to clear data' });
  }
};

export const exportUserData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    const transactions = await Transaction.find({ userId: userId }).sort({ date: 1 });
    const budgets = await Budget.find({ userId: userId }).sort({ startDate: 1 });
    const investments = await Investment.find({ userId: userId }).sort({ date: 1 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="user-data.pdf"');

    const doc = new PDFDocument();
    doc.pipe(res);

    const fontPath = path.resolve(__dirname, '../font/Courier_Prime/CourierPrime-Regular.ttf');
    doc.registerFont("CourierPrime", fontPath);

    doc.font("CourierPrime").fontSize(18).text('User Data Export', { align: 'center' });
    doc.moveDown();

    // Transactions
    doc.fontSize(14).text('Transactions', { underline: true });

    const getMonthYear = (date: Date) =>
      `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;

    const groupedTransactions: { [key: string]: typeof transactions } = {};
    transactions.forEach((tx: any) => {
      const key = getMonthYear(new Date(tx.date));
      if (!groupedTransactions[key]) groupedTransactions[key] = [];
      groupedTransactions[key].push(tx);
    });


    Object.entries(groupedTransactions).forEach(([month, txs]) => {
      doc.fontSize(12).text(`${month}`, { underline: true });
      txs.forEach((tx: any) => {
        const date = new Date(tx.date).toDateString();
        doc.fontSize(12).text(`- ${date} | ${tx.description} | ₹${tx.amount} | ${tx.type}`);
      });
      doc.moveDown();
    });

    doc.addPage();

    // Budgets
    doc.fontSize(14).text('Budgets', { underline: true });

    const groupedBudgets: { [key: string]: typeof budgets } = {};
    budgets.forEach((b: any) => {
      const key = b.startDate ? getMonthYear(new Date(b.startDate)) : 'Unknown';
      if (!groupedBudgets[key]) groupedBudgets[key] = [];
      groupedBudgets[key].push(b);
    });

    Object.entries(groupedBudgets).forEach(([month, bs]) => {
      doc.fontSize(12).text(`${month}`, { underline: true });
      bs.forEach((b: any) => {
        const start = b.startDate ? new Date(b.startDate).toDateString() : 'N/A';
        const end = b.endDate ? new Date(b.endDate).toDateString() : 'N/A';
        doc.text(`- ${b.category} | Limit: ₹${b.amount} | Period: ${start} - ${end}`);
      });
      doc.moveDown();
    });


    doc.addPage();

    // Investments
    doc.fontSize(14).text('Investments', { underline: true });
    
    const groupedInvestments: { [key: string]: typeof investments } = {};
    investments.forEach((inv: any) => {
      const key = inv.date ? getMonthYear(new Date(inv.date)) : 'Unknown';
      if (!groupedInvestments[key]) groupedInvestments[key] = [];
      groupedInvestments[key].push(inv);
    });

    Object.entries(groupedInvestments).forEach(([month, invs]) => {
      invs.forEach((inv: any) => {
        const date = inv.date ? new Date(inv.date).toDateString() : 'Unknown Date';
        doc.fontSize(12).text(`- ${inv.name} | Quantity: ${inv.quantity} | Purchase Price: ₹${inv.purchasePrice} | Current Price: ₹${inv.currentPrice} | Type: ${inv.type} | Purchase Date: ${inv.purchaseDate}`);
      });
      doc.moveDown();
    });

    doc.end();
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: 'Failed to export data' });
  }
};

const otpStore = new Map(); 

export const sendOtpToEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min expiry
  const data = `${email}.${otp}.${expiresAt}`;

  const hash = crypto
    .createHmac('sha256', process.env.OTP_SECRET || 'secure-secret')
    .update(data)
    .digest('hex');

  const fullHash = `${hash}.${expiresAt}`;

  // Send OTP using nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'OTP for Registration',
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({ message: 'OTP sent successfully', hash: fullHash });
};