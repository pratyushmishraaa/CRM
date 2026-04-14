import { Router } from 'express';
import { getDeals, getDeal, createDeal, updateDeal, deleteDeal, getPipeline } from './deal.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { enforceTenant } from '../../middleware/tenant.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createDealSchema, updateDealSchema } from '../../validators/deal.validator.js';

const router = Router();
router.use(protect, enforceTenant);

router.get('/pipeline', getPipeline);
router.get('/', getDeals);
router.post('/', validate(createDealSchema), createDeal);
router.get('/:id', getDeal);
router.patch('/:id', validate(updateDealSchema), updateDeal);
router.delete('/:id', authorize('admin', 'manager'), deleteDeal);

export default router;
