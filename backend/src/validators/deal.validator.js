import Joi from 'joi';

const STAGES   = ['prospecting','qualification','demo','proposal','negotiation','closed_won','closed_lost'];
const FORECAST = ['pipeline','best_case','commit','closed','omitted'];

export const createDealSchema = Joi.object({
  title:       Joi.string().min(2).max(200).required(),
  description: Joi.string().max(5000).allow('', null).optional(),
  lead:           Joi.string().hex().length(24).allow('', null).optional(),
  account:        Joi.string().hex().length(24).allow('', null).optional(),
  primaryContact: Joi.string().hex().length(24).allow('', null).optional(),
  stage:            Joi.string().valid(...STAGES).optional(),
  forecastCategory: Joi.string().valid(...FORECAST).optional(),
  probability:      Joi.number().min(0).max(100).allow(null).optional(),
  expectedCloseDate: Joi.date().iso().allow('', null).optional(),
  actualCloseDate:   Joi.date().iso().allow('', null).optional(),
  lostReason:        Joi.string().allow('', null).optional(),
  lostToCompetitor:  Joi.string().allow('', null).optional(),
  nextStep:          Joi.string().allow('', null).optional(),
  value:        Joi.number().min(0).required(),
  currency:     Joi.string().max(3).allow('', null).optional(),
  mrr:          Joi.number().min(0).allow(null).optional(),
  arr:          Joi.number().min(0).allow(null).optional(),
  dealType:     Joi.string().valid('new_business','upsell','cross_sell','renewal','expansion').allow('', null).optional(),
  planName:     Joi.string().allow('', null).optional(),
  billingCycle: Joi.string().valid('monthly','annual','multi_year','one_time').allow('', null).optional(),
  seats:        Joi.number().min(1).allow(null).optional(),
  contractLength: Joi.number().min(1).allow(null).optional(),
  contractSigned:  Joi.boolean().optional(),
  contractDate:    Joi.date().iso().allow('', null).optional(),
  competitorReplaced:  Joi.string().allow('', null).optional(),
  competitors:         Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string().allow('', null)).optional(),
  requiresIntegration: Joi.boolean().optional(),
  integrationDetails:  Joi.string().allow('', null).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
}).options({ stripUnknown: true });

export const updateDealSchema = createDealSchema.fork(
  ['title', 'value'], (s) => s.optional()
);
