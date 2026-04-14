import express    from 'express';
import cors       from 'cors';
import helmet     from 'helmet';
import morgan     from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi  from 'swagger-ui-express';

import { swaggerSpec }  from './config/swagger.js';
import logger           from './utils/logger.js';
import errorHandler     from './middleware/errorHandler.middleware.js';
import { apiLimiter }   from './middleware/rateLimiter.middleware.js';

// ── Route modules ─────────────────────────────────────────────────────────────
import authRoutes      from './modules/auth/auth.routes.js';
import userRoutes      from './modules/users/user.routes.js';
import leadRoutes      from './modules/leads/lead.routes.js';
import dealRoutes      from './modules/deals/deal.routes.js';
import activityRoutes  from './modules/activities/activity.routes.js';
import aiRoutes        from './modules/ai/ai.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import auditRoutes     from './modules/audit/audit.routes.js';
import contactRoutes   from './modules/contacts/contact.routes.js';

const app = express();

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ── Request parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── HTTP request logging ──────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── API documentation ─────────────────────────────────────────────────────────
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'CRM SaaS — API Docs',
}));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Versioned API routes ──────────────────────────────────────────────────────
app.use('/api/v1/auth',       authRoutes);
app.use('/api/v1/users',      userRoutes);
app.use('/api/v1/leads',      leadRoutes);
app.use('/api/v1/deals',      dealRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/ai',         aiRoutes);
app.use('/api/v1/dashboard',  dashboardRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1',            contactRoutes); // mounts /contacts and /accounts

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

export default app;
