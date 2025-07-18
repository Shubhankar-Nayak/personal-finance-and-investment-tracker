import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import cors from 'cors';

import transactionRoutes from './routes/transactionRoutes';
import investmentRoutes from './routes/investmentRoutes';
import budgetRoutes from './routes/budgetRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }))


const PORT = process.env.PORT || 5000;

app.use('/api/transactions', transactionRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
