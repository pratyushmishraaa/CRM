import mongoose from 'mongoose';
import Lead     from '../leads/lead.model.js';
import Deal     from '../deals/deal.model.js';
import Activity from '../activities/activity.model.js';
import { ok }   from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const getStats = asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const isRep    = req.user.role === 'sales';
  const userId   = req.user._id;

  const now          = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const last6Months  = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const leadFilter = { tenantId, ...(isRep ? { assignedTo: userId } : {}) };
  const dealFilter = { tenantId, ...(isRep ? { owner: userId } : {}) };
  const leadMatch  = { tenantId, ...(isRep ? { assignedTo: new mongoose.Types.ObjectId(userId) } : {}) };
  const dealMatch  = { tenantId, ...(isRep ? { owner: new mongoose.Types.ObjectId(userId) } : {}) };

  const [
    totalLeads, newLeadsThisMonth, leadsByStage,
    totalDeals, openDeals, closedWonDeals,
    totalRevenue, revenueByMonth, dealsByStage,
    activitiesThisWeek, topLeads,
    trialLeads, renewalDeals, mrrTotal,
  ] = await Promise.all([
    Lead.countDocuments(leadFilter),
    Lead.countDocuments({ ...leadFilter, createdAt: { $gte: startOfMonth } }),
    Lead.aggregate([
      { $match: leadMatch },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ]),
    Deal.countDocuments(dealFilter),
    Deal.countDocuments({ ...dealFilter, stage: { $nin: ['closed_won', 'closed_lost'] } }),
    Deal.countDocuments({ ...dealFilter, stage: 'closed_won', updatedAt: { $gte: startOfMonth } }),
    Deal.aggregate([
      { $match: { ...dealMatch, stage: 'closed_won' } },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]),
    Deal.aggregate([
      { $match: { tenantId, stage: 'closed_won', actualCloseDate: { $gte: last6Months } } },
      { $group: { _id: { year: { $year: '$actualCloseDate' }, month: { $month: '$actualCloseDate' } }, revenue: { $sum: '$value' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Deal.aggregate([
      { $match: dealMatch },
      { $group: { _id: '$stage', count: { $sum: 1 }, value: { $sum: '$value' } } },
    ]),
    Activity.countDocuments({
      tenantId,
      ...(isRep ? { createdBy: userId } : {}),
      createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    }),
    Lead.find({ ...leadFilter, aiScore: { $ne: null } })
      .sort('-aiScore').limit(5)
      .select('firstName lastName company aiScore aiScoreReason stage'),
    Lead.countDocuments({ tenantId, trialStarted: true }),
    Deal.countDocuments({
      tenantId, dealType: 'renewal',
      expectedCloseDate: {
        $gte: startOfMonth,
        $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      },
    }),
    Deal.aggregate([
      { $match: { tenantId, stage: 'closed_won', mrr: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$mrr' } } },
    ]),
  ]);

  ok(res, {
    summary: {
      totalLeads, newLeadsThisMonth, totalDeals, openDeals, closedWonDeals,
      totalRevenue: totalRevenue[0]?.total || 0,
      activitiesThisWeek,
    },
    software: {
      trialLeads,
      renewalDeals,
      totalMRR: mrrTotal[0]?.total || 0,
    },
    charts: { leadsByStage, dealsByStage, revenueByMonth },
    topLeads,
  });
});
