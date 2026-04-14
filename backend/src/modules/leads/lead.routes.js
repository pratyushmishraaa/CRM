/**
 * @swagger
 * tags:
 *   name: Leads
 *   description: Lead management with pipeline stages
 */
import { Router } from 'express';
import { getLeads, getLead, createLead, updateLead, deleteLead, scheduleFollowUp } from './lead.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { enforceTenant } from '../../middleware/tenant.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createLeadSchema, updateLeadSchema } from '../../validators/lead.validator.js';

const router = Router();
router.use(protect, enforceTenant);

/**
 * @swagger
 * /leads:
 *   get:
 *     summary: Get all leads (paginated, filterable, sortable)
 *     tags: [Leads]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: stage
 *         schema: { type: string, enum: [NEW, CONTACTED, QUALIFIED, WON, LOST] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated leads list }
 */
router.get('/', getLeads);
router.post('/', validate(createLeadSchema), createLead);
router.get('/:id', getLead);
router.patch('/:id', validate(updateLeadSchema), updateLead);
router.delete('/:id', authorize('admin', 'manager'), deleteLead);
router.post('/:id/follow-up', scheduleFollowUp);

export default router;
