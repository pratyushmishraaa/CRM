import Lead from './lead.model.js';
import { buildQuery, applySearch } from '../../utils/queryBuilder.js';

export const getLeads = async (tenantId, queryParams, userRole, userId) => {
  const { skip, limit, sort, search, filters, page } = buildQuery(queryParams);

  const baseFilter = { tenantId, ...filters };
  if (userRole === 'sales') baseFilter.assignedTo = userId;

  let query = Lead.find(baseFilter).populate('assignedTo', 'firstName lastName email');
  query = applySearch(query, search, ['firstName', 'lastName', 'email', 'company']);

  const [leads, total] = await Promise.all([
    query.sort(sort).skip(skip).limit(limit),
    Lead.countDocuments(baseFilter),
  ]);

  return { leads, total, page, limit };
};

export const createLead = async (tenantId, data, userId) => {
  const lead = await Lead.create({ ...data, tenantId, createdBy: userId });
  return lead;
};

export const updateLead = async (tenantId, leadId, data) => {
  const lead = await Lead.findOneAndUpdate(
    { _id: leadId, tenantId },
    data,
    { new: true, runValidators: true }
  ).populate('assignedTo', 'firstName lastName email');
  return lead;
};

export const deleteLead = async (tenantId, leadId) => {
  return Lead.findOneAndDelete({ _id: leadId, tenantId });
};

export const scheduleFollowUp = async (tenantId, leadId, followUpDate) => {
  const delay = new Date(followUpDate).getTime() - Date.now();
  if (delay <= 0) throw new Error('Follow-up date must be in the future');
  await Lead.findOneAndUpdate({ _id: leadId, tenantId }, { nextFollowUpAt: followUpDate });
};
