import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserDocument = Document & {
  name: string;
  email: string;
  password: string;
  googleId?: string;
  matchPassword: (password: string) => Promise<boolean>;
};

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google users
  googleId: { type: String }, // Present if signed up via Google
}, {
  timestamps: true,
});

// Match entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) return false; // No password set (Google login)
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const User = mongoose.model<UserDocument>('User', userSchema);

