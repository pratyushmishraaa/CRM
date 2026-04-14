/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */
import { Router } from 'express';
import { register, login, refresh, logout, getMe } from './auth.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.middleware.js';
import { registerSchema, loginSchema } from '../../validators/auth.validator.js';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new organization + admin user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, tenantName]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               tenantName: { type: string }
 *     responses:
 *       201: { description: Registration successful }
 *       409: { description: Email already exists }
 */
router.post('/register', authLimiter, validate(registerSchema), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     security: []
 */
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
