import jwt from 'jsonwebtoken';
import User from '../modules/users/user.model.js';
import { error } from '../utils/apiResponse.js';

/**
 * Verifies JWT access token and attaches req.user + req.tenantId.
 * tenantId is the organization scope for multi-tenancy enforcement.
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return error(res, 'No token provided', 401);
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Select industryType so it's available on req.user everywhere
    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    if (!user || !user.isActive) return error(res, 'User not found or inactive', 401);

    req.user = user;
    req.tenantId = user.tenantId;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return error(res, 'Access token expired', 401);
    return error(res, 'Invalid token', 401);
  }
};

/**
 * Role-based access control.
 * Usage: authorize('admin', 'manager')
 */
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return error(res, `Role '${req.user.role}' is not authorized`, 403);
  }
  next();
};
