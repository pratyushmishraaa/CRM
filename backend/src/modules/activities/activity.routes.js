import { Router } from 'express';
import { getActivities, createActivity, updateActivity, deleteActivity, getTimeline } from './activity.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { enforceTenant } from '../../middleware/tenant.middleware.js';

const router = Router();
router.use(protect, enforceTenant);

router.get('/', getActivities);
router.post('/', createActivity);
router.get('/timeline/:leadId', getTimeline);
router.patch('/:id', updateActivity);
router.delete('/:id', deleteActivity);

export default router;
