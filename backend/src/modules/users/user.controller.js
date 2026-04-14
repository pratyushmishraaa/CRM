import User from './user.model.js';
import { ok, created, paginated, error } from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { buildQuery, applySearch } from '../../utils/queryBuilder.js';
import { audit } from '../../middleware/audit.middleware.js';

export const getUsers = asyncHandler(async (req, res) => {
  const { skip, limit, sort, search, filters, page } = buildQuery(req.query);
  let query = User.find({ tenantId: req.tenantId, ...filters });
  query = applySearch(query, search, ['firstName', 'lastName', 'email']);
  const [users, total] = await Promise.all([
    query.sort(sort).skip(skip).limit(limit).select('-password -refreshTokens'),
    User.countDocuments({ tenantId: req.tenantId, ...filters }),
  ]);
  paginated(res, { users }, total, page, limit);
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, tenantId: req.tenantId }).select('-password -refreshTokens');
  if (!user) return error(res, 'User not found', 404);
  ok(res, { user });
});

export const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  const existing = await User.findOne({ email, tenantId: req.tenantId });
  if (existing) return error(res, 'Email already in use', 409);

  const user = await User.create({ tenantId: req.tenantId, firstName, lastName, email, password, role });
  await audit({ user: req.user, tenantId: req.tenantId, action: 'user.created', resource: 'User', resourceId: user._id, req });
  created(res, { user }, 'User created');
});

export const updateUser = asyncHandler(async (req, res) => {
  const allowed = ['firstName', 'lastName', 'phone', 'avatar', 'role', 'isActive'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    updates,
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');
  if (!user) return error(res, 'User not found', 404);
  await audit({ user: req.user, tenantId: req.tenantId, action: 'user.updated', resource: 'User', resourceId: user._id, metadata: updates, req });
  ok(res, { user }, 'User updated');
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) return error(res, 'Cannot delete yourself', 400);
  const user = await User.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
  if (!user) return error(res, 'User not found', 404);
  await audit({ user: req.user, tenantId: req.tenantId, action: 'user.deleted', resource: 'User', resourceId: user._id, req });
  ok(res, {}, 'User deleted');
});
