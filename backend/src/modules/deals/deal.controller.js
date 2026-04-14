import Deal from './deal.model.js';
import { ok, created, paginated, error } from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { buildQuery, applySearch } from '../../utils/queryBuilder.js';
import { audit } from '../../middleware/audit.middleware.js';

export const getDeals = asyncHandler(async (req, res) => {
  const { skip, limit, sort, search, filters, page } = buildQuery(req.query);
  const baseFilter = { tenantId: req.tenantId, ...filters };
  if (req.user.role === 'sales') baseFilter.owner = req.user._id;

  let query = Deal.find(baseFilter)
    .populate('lead', 'firstName lastName email')
    .populate('owner', 'firstName lastName');
  query = applySearch(query, search, ['title', 'description']);

  const [deals, total] = await Promise.all([
    query.sort(sort).skip(skip).limit(limit),
    Deal.countDocuments(baseFilter),
  ]);
  paginated(res, { deals }, total, page, limit);
});

export const getDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findOne({ _id: req.params.id, tenantId: req.tenantId })
    .populate('lead', 'firstName lastName email company')
    .populate('owner', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName');
  if (!deal) return error(res, 'Deal not found', 404);
  ok(res, { deal });
});

export const createDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.create({
    ...req.body,
    tenantId: req.tenantId,
    createdBy: req.user._id,
    owner: req.body.owner || req.user._id,
  });
  await audit({ user: req.user, tenantId: req.tenantId, action: 'deal.created', resource: 'Deal', resourceId: deal._id, req });
  created(res, { deal }, 'Deal created');
});

export const updateDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!deal) return error(res, 'Deal not found', 404);
  await audit({ user: req.user, tenantId: req.tenantId, action: 'deal.updated', resource: 'Deal', resourceId: deal._id, metadata: req.body, req });
  ok(res, { deal }, 'Deal updated');
});

export const deleteDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
  if (!deal) return error(res, 'Deal not found', 404);
  await audit({ user: req.user, tenantId: req.tenantId, action: 'deal.deleted', resource: 'Deal', resourceId: deal._id, req });
  ok(res, {}, 'Deal deleted');
});

export const getPipeline = asyncHandler(async (req, res) => {
  const matchFilter = { tenantId: req.tenantId };
  if (req.user.role === 'sales') matchFilter.owner = req.user._id;

  const pipeline = await Deal.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$stage',
        count: { $sum: 1 },
        totalValue: { $sum: '$value' },
        weightedValue: { $sum: { $multiply: ['$value', { $divide: ['$probability', 100] }] } },
        deals: { $push: { _id: '$_id', title: '$title', value: '$value', probability: '$probability', owner: '$owner' } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  ok(res, { pipeline });
});
