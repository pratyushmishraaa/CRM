import Joi from 'joi';

const STAGES  = ['NEW', 'CONTACTED', 'QUALIFIED', 'NURTURING', 'CONVERTED', 'DISQUALIFIED'];
const SOURCES = [
  'website', 'referral', 'cold_outbound', 'inbound_email', 'social_media', 'paid_ads',
  'product_hunt', 'github', 'webinar', 'free_trial', 'api_signup', 'event', 'partner', 'content', 'other',
];

export const createLeadSchema = Joi.object({
  firstName:  Joi.string().min(1).max(50).required(),
  lastName:   Joi.string().min(1).max(50).required(),
  email:      Joi.string().email().allow('', null).optional(),
  phone:      Joi.string().allow('', null).optional(),
  mobilePhone: Joi.string().allow('', null).optional(),
  linkedIn:   Joi.string().allow('', null).optional(),
  website:    Joi.string().allow('', null).optional(),
  company:    Joi.string().allow('', null).optional(),
  jobTitle:   Joi.string().allow('', null).optional(),
  department: Joi.string().allow('', null).optional(),
  industry:   Joi.string().allow('', null).optional(),
  companySize: Joi.string().valid('1-10','11-50','51-200','201-500','501-1000','1000+').allow('', null).optional(),
  annualRevenue: Joi.number().min(0).allow(null).optional(),
  stage:      Joi.string().valid(...STAGES).optional(),
  rating:     Joi.string().valid('hot','warm','cold','unrated').optional(),
  source:     Joi.string().valid(...SOURCES).allow('', null).optional(),
  campaign:   Joi.string().allow('', null).optional(),
  assignedTo: Joi.string().hex().length(24).allow('', null).optional(),
  account:    Joi.string().hex().length(24).allow('', null).optional(),
  estimatedValue: Joi.number().min(0).allow(null).optional(),
  budget:     Joi.number().min(0).allow(null).optional(),
  budgetConfirmed: Joi.boolean().optional(),
  decisionTimeline: Joi.string().valid('immediate','1_month','3_months','6_months','12_months','unknown').allow('', null).optional(),
  currentSolution: Joi.string().allow('', null).optional(),
  painPoints:  Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string().allow('', null)).optional(),
  useCase:     Joi.string().allow('', null).optional(),
  teamSize:    Joi.number().min(1).allow(null).optional(),
  trialStarted: Joi.boolean().optional(),
  trialStartDate: Joi.date().iso().allow(null, '').optional(),
  trialEndDate:   Joi.date().iso().allow(null, '').optional(),
  interestedIn: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string().allow('', null)).optional(),
  isTechnical:     Joi.boolean().optional(),
  isDecisionMaker: Joi.boolean().optional(),
  doNotContact:    Joi.boolean().optional(),
  emailOptIn:      Joi.boolean().optional(),
  nextFollowUpAt:  Joi.date().iso().allow(null, '').optional(),
  notes: Joi.string().max(5000).allow('', null).optional(),
  tags:  Joi.array().items(Joi.string()).optional(),
}).options({ stripUnknown: true });

export const updateLeadSchema = createLeadSchema.fork(
  ['firstName', 'lastName'], (s) => s.optional()
);
