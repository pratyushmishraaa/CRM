import AuditLog from '../modules/audit/audit.model.js';
import logger from '../utils/logger.js';

/**
 * Creates an immutable audit log entry.
 * Call from controllers after significant actions.
 */
export const audit = async ({ user, tenantId, action, resource, resourceId, metadata = {}, req }) => {
  try {
    await AuditLog.create({
      tenantId,
      userId: user?._id,
      action,
      resource,
      resourceId,
      metadata,
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    });
  } catch (err) {
    logger.error(`Audit log failed: ${err.message}`);
  }
};
