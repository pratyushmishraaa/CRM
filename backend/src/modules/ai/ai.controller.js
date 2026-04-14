import Lead from '../leads/lead.model.js';
import Activity from '../activities/activity.model.js';
import { ok, error } from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import * as aiService from './ai.service.js';

// POST /api/v1/ai/email-generator
export const generateEmail = asyncHandler(async (req, res) => {
  const { leadId, context, tone } = req.body;
  if (!leadId) return error(res, 'leadId is required', 400);
  const lead = await Lead.findOne({ _id: leadId, tenantId: req.tenantId });
  if (!lead) return error(res, 'Lead not found', 404);
  const email = await aiService.generateEmail({ lead, context, tone });
  ok(res, { email });
});

// POST /api/v1/ai/reply-suggestions
export const getReplySuggestions = asyncHandler(async (req, res) => {
  const { incomingEmail, leadId } = req.body;
  if (!incomingEmail) return error(res, 'incomingEmail is required', 400);
  let leadContext = '';
  if (leadId) {
    const lead = await Lead.findOne({ _id: leadId, tenantId: req.tenantId });
    if (lead) leadContext = `Lead: ${lead.firstName} ${lead.lastName}, ${lead.company}, Stage: ${lead.stage}`;
  }
  const suggestions = await aiService.generateReplySuggestions({ incomingEmail, leadContext });
  ok(res, { suggestions });
});

// POST /api/v1/ai/analyze-transcript
export const analyzeTranscript = asyncHandler(async (req, res) => {
  const { transcript, activityId } = req.body;
  if (!transcript) return error(res, 'transcript is required', 400);
  const analysis = await aiService.analyzeTranscript(transcript);
  // If activityId provided, persist the result
  if (activityId) {
    await Activity.findOneAndUpdate(
      { _id: activityId, tenantId: req.tenantId },
      { sentiment: analysis.sentiment, sentimentScore: analysis.score, aiSummary: analysis.summary }
    );
  }
  ok(res, { analysis });
});

// POST /api/v1/ai/score-lead/:leadId
export const scoreLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.leadId, tenantId: req.tenantId });
  if (!lead) return error(res, 'Lead not found', 404);
  const result = await aiService.scoreLead(lead);
  await Lead.findByIdAndUpdate(lead._id, {
    aiScore: result.score,
    aiScoreReason: result.reason,
    aiScoreUpdatedAt: new Date(),
  });
  ok(res, { score: result.score, reason: result.reason, priority: result.priority });
});
