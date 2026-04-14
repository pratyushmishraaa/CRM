import { error } from '../utils/apiResponse.js';

/**
 * Ensures every request has a tenantId in scope.
 * This is the core of multi-tenancy — all DB queries MUST filter by tenantId.
 * Called after protect() so req.tenantId is already set from the JWT.
 */
export const enforceTenant = (req, res, next) => {
  if (!req.tenantId) {
    return error(res, 'Tenant context missing', 400);
  }
  next();
};
