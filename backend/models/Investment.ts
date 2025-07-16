const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['stock', 'crypto', 'mutual_fund'], required: true },
  quantity: { type: Number, required: true },
  purchasePrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  purchaseDate: { type: Date, required: true },
}, { timestamps: true });

export const Investment = mongoose.model('Investment', investmentSchema);