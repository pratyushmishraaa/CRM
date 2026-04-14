import Activity from './activity.model.js';
import { ok, created, paginated, error } from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { audit } from '../../middleware/audit.middleware.js';
import * as aiService from '../ai/ai.service.js';

export const getActivities = asyncHandler(async (req, res) => {
  const { relatedModel, relatedId, page = 1, limit = 15 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const filter = { tenantId: req.tenantId };
  if (relatedModel && relatedId) {
    filter['relatedTo.model'] = relatedModel;
    filter['relatedTo.id'] = relatedId;
  }
  const [activities, total] = await Promise.all([
    Activity.find(filter)
      .populate('createdBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Activity.countDocuments(filter),
  ]);
  paginated(res, { activities }, total, page, limit);
});

export const createActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.create({
    ...req.body,
    tenantId: req.tenantId,
    createdBy: req.user._id,
  });

  // Run sentiment analysis inline (no queue needed)
  if (activity.transcript) {
    try {
      const analysis = await aiService.analyzeTranscript(activity.transcript);
      await Activity.findByIdAndUpdate(activity._id, {
        sentiment:      analysis.sentiment,
        sentimentScore: analysis.score,
        aiSummary:      analysis.summary,
      });
    } catch {}
  }

  await audit({ user: req.user, tenantId: req.tenantId, action: 'activity.created', resource: 'Activity', resourceId: activity._id, req });
  created(res, { activity }, 'Activity logged');
});

export const updateActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!activity) return error(res, 'Activity not found', 404);
  ok(res, { activity }, 'Activity updated');
});

export const deleteActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
  if (!activity) return error(res, 'Activity not found', 404);
  ok(res, {}, 'Activity deleted');
});

export const getTimeline = asyncHandler(async (req, res) => {
  const activities = await Activity.find({
    tenantId: req.tenantId,
    'relatedTo.id': req.params.leadId,
  })
    .populate('createdBy', 'firstName lastName')
    .sort('-createdAt');
  ok(res, { activities });
});
