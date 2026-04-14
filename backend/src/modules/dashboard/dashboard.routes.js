import { Router } from 'express';
import { getStats } from './dashboard.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { enforceTenant } from '../../middleware/tenant.middleware.js';

const router = Router();
router.get('/', protect, enforceTenant, getStats);
export default router;
