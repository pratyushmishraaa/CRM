import * as leadService from './lead.service.js';
import { ok, created, paginated, error } from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { audit } from '../../middleware/audit.middleware.js';

export const getLeads = asyncHandler(async (req, res) => {
  const { leads, total, page, limit } = await leadService.getLeads(
    req.tenantId, req.query, req.user.role, req.user._id
  );
  paginated(res, { leads }, total, page, limit);
});

export const getLead = asyncHandler(async (req, res) => {
  const { default: Lead } = await import('./lead.model.js');
  const lead = await Lead.findOne({ _id: req.params.id, tenantId: req.tenantId })
    .populate('assignedTo', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName');
  if (!lead) return error(res, 'Lead not found', 404);
  ok(res, { lead });
});

export const createLead = asyncHandler(async (req, res) => {
  const lead = await leadService.createLead(req.tenantId, req.body, req.user._id);
  await audit({ user: req.user, tenantId: req.tenantId, action: 'lead.created', resource: 'Lead', resourceId: lead._id, req });
  created(res, { lead }, 'Lead created');
});

export const updateLead = asyncHandler(async (req, res) => {
  const lead = await leadService.updateLead(req.tenantId, req.params.id, req.body);
  if (!lead) return error(res, 'Lead not found', 404);
  await audit({ user: req.user, tenantId: req.tenantId, action: 'lead.updated', resource: 'Lead', resourceId: lead._id, metadata: req.body, req });
  ok(res, { lead }, 'Lead updated');
});

export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await leadService.deleteLead(req.tenantId, req.params.id);
  if (!lead) return error(res, 'Lead not found', 404);
  await audit({ user: req.user, tenantId: req.tenantId, action: 'lead.deleted', resource: 'Lead', resourceId: lead._id, req });
  ok(res, {}, 'Lead deleted');
});

export const scheduleFollowUp = asyncHandler(async (req, res) => {
  const { followUpDate } = req.body;
  if (!followUpDate) return error(res, 'followUpDate is required', 400);
  await leadService.scheduleFollowUp(req.tenantId, req.params.id, followUpDate, req.user._id);
  ok(res, {}, 'Follow-up scheduled');
});
