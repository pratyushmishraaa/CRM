import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../users/user.model.js';

export const generateAccessToken = (userId, role, tenantId) =>
  jwt.sign(
    { id: userId, role, tenantId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );

export const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });

export const setRefreshCookie = (res, token) =>
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

export const clearRefreshCookie = (res) =>
  res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict' });

export const saveRefreshToken = async (userId, token) => {
  const hashed = await bcrypt.hash(token, 10);
  await User.findByIdAndUpdate(userId, { $push: { refreshTokens: hashed } });
};

export const removeRefreshToken = async (userId, token) => {
  const user = await User.findById(userId).select('+refreshTokens');
  if (!user) return;
  const filtered = [];
  for (const stored of user.refreshTokens) {
    const match = await bcrypt.compare(token, stored);
    if (!match) filtered.push(stored);
  }
  user.refreshTokens = filtered;
  await user.save();
};
