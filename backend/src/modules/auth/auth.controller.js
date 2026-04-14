import jwt from 'jsonwebtoken';
import User from '../users/user.model.js';
import { ok, created, error } from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { audit } from '../../middleware/audit.middleware.js';
import {
  generateAccessToken, generateRefreshToken,
  setRefreshCookie, clearRefreshCookie,
  saveRefreshToken, removeRefreshToken,
} from './token.service.js';

const userPayload = (u) => ({
  id: u._id,
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  role: u.role,
  tenantId: u.tenantId,
});

// POST /api/v1/auth/register
export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, tenantName } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return error(res, 'Email already registered', 409);

  const tenantId = tenantName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

  const user = await User.create({
    tenantId, firstName, lastName, email, password, role: 'admin',
  });

  const accessToken = generateAccessToken(user._id, user.role, tenantId);
  const refreshToken = generateRefreshToken(user._id);
  saveRefreshToken(user._id, refreshToken).catch(() => {});
  setRefreshCookie(res, refreshToken);
  audit({ user, tenantId, action: 'auth.register', resource: 'User', resourceId: user._id, req }).catch(() => {});

  created(res, { accessToken, user: userPayload(user) }, 'Registration successful');
});

// POST /api/v1/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return error(res, 'Invalid email or password', 401);
  }
  if (!user.isActive) return error(res, 'Account deactivated', 403);

  user.lastLogin = new Date();
  await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

  const accessToken = generateAccessToken(user._id, user.role, user.tenantId);
  const refreshToken = generateRefreshToken(user._id);
  saveRefreshToken(user._id, refreshToken).catch(() => {});
  setRefreshCookie(res, refreshToken);
  audit({ user, tenantId: user.tenantId, action: 'auth.login', resource: 'User', resourceId: user._id, req }).catch(() => {});

  ok(res, { accessToken, user: userPayload(user) }, 'Login successful');
});

// POST /api/v1/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return error(res, 'No refresh token', 401);

  let decoded;
  try { decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET); }
  catch { return error(res, 'Invalid or expired refresh token', 401); }

  const user = await User.findById(decoded.id);
  if (!user) return error(res, 'User not found', 401);

  removeRefreshToken(user._id, token).catch(() => {});
  const newRefresh = generateRefreshToken(user._id);
  saveRefreshToken(user._id, newRefresh).catch(() => {});
  setRefreshCookie(res, newRefresh);

  const accessToken = generateAccessToken(user._id, user.role, user.tenantId);
  ok(res, { accessToken }, 'Token refreshed');
});

// POST /api/v1/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      removeRefreshToken(decoded.id, token).catch(() => {});
    } catch {}
  }
  clearRefreshCookie(res);
  ok(res, {}, 'Logged out');
});

// GET /api/v1/auth/me
export const getMe = asyncHandler(async (req, res) => {
  ok(res, { user: req.user });
});
