import { Router } from 'express';
import AuditLog from './audit.model.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { enforceTenant } from '../../middleware/tenant.middleware.js';
import { paginated } from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

const router = Router();
router.use(protect, enforceTenant, authorize('admin'));

router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, userId, action, resource } = req.query;
  const skip = (page - 1) * limit;
  const filter = { tenantId: req.tenantId };
  if (userId) filter.userId = userId;
  if (action) filter.action = new RegExp(action, 'i');
  if (resource) filter.resource = resource;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).populate('userId', 'firstName lastName email').sort('-createdAt').skip(skip).limit(Number(limit)),
    AuditLog.countDocuments(filter),
  ]);
  paginated(res, { logs }, total, page, limit);
}));

export default router;
