/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-powered features (email generation, scoring, sentiment)
 */
import { Router } from 'express';
import { generateEmail, getReplySuggestions, analyzeTranscript, scoreLead } from './ai.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { enforceTenant } from '../../middleware/tenant.middleware.js';

const router = Router();
router.use(protect, enforceTenant);

/**
 * @swagger
 * /ai/email-generator:
 *   post:
 *     summary: Generate a personalized sales email for a lead
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [leadId]
 *             properties:
 *               leadId: { type: string }
 *               context: { type: string }
 *               tone: { type: string, enum: [professional, casual, urgent] }
 *     responses:
 *       200: { description: Generated email content }
 */
router.post('/email-generator', generateEmail);
router.post('/reply-suggestions', getReplySuggestions);
router.post('/analyze-transcript', analyzeTranscript);
router.post('/score-lead/:leadId', scoreLead);

export default router;
