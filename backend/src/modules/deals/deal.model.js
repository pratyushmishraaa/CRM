import mongoose from 'mongoose';

/**
 * Deal Stages — standard B2B SaaS sales pipeline.
 * Maps to Salesforce/HubSpot standard stages.
 */
export const DEAL_STAGES = [
  'prospecting',   // Identifying opportunity
  'qualification', // Confirming fit, budget, authority, need, timeline
  'demo',          // Product demonstration
  'proposal',      // Proposal/quote sent
  'negotiation',   // Terms being discussed
  'closed_won',    // Deal signed
  'closed_lost',   // Deal lost
];

/**
 * Forecast Category — used for revenue forecasting.
 * Maps stages to forecast confidence levels.
 */
export const FORECAST_CATEGORIES = [
  'pipeline',   // Early stage, low confidence
  'best_case',  // Possible but not certain
  'commit',     // High confidence, expected to close
  'closed',     // Already closed
  'omitted',    // Excluded from forecast
];

const dealSchema = new mongoose.Schema(
  {
    tenantId:  { type: String, required: true, index: true },

    // ── Core ──────────────────────────────────────────────────────────────
    title:       { type: String, required: true, trim: true },
    description: String,

    // ── Relationships ─────────────────────────────────────────────────────
    lead:           { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    account:        { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    primaryContact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }, // decision maker
    owner:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // ── Pipeline ──────────────────────────────────────────────────────────
    stage:            { type: String, enum: DEAL_STAGES, default: 'prospecting' },
    forecastCategory: { type: String, enum: FORECAST_CATEGORIES, default: 'pipeline' },
    probability:      { type: Number, min: 0, max: 100, default: 10 },
    expectedCloseDate: Date,
    actualCloseDate:   Date,
    lostReason:        String,
    lostToCompetitor:  String,
    nextStep:          String, // what needs to happen next

    // ── Financials ────────────────────────────────────────────────────────
    value:        { type: Number, required: true, min: 0 }, // total contract value
    currency:     { type: String, default: 'USD' },
    mrr:          Number, // monthly recurring revenue
    arr:          Number, // annual recurring revenue (auto or manual)
    dealType: {
      type: String,
      enum: ['new_business', 'upsell', 'cross_sell', 'renewal', 'expansion'],
      default: 'new_business',
    },

    // ── SaaS / Subscription ───────────────────────────────────────────────
    planName:     String,   // Starter, Pro, Enterprise, Custom
    billingCycle: { type: String, enum: ['monthly', 'annual', 'multi_year', 'one_time'], default: 'annual' },
    seats:        Number,   // number of user seats
    contractLength: Number, // months
    contractSigned:  { type: Boolean, default: false },
    contractDate:    Date,

    // ── Competitive ───────────────────────────────────────────────────────
    competitorReplaced:  String,
    competitors:         [String], // all competitors in this deal
    requiresIntegration: { type: Boolean, default: false },
    integrationDetails:  String,

    // ── Stage History (audit trail) ───────────────────────────────────────
    stageHistory: [
      {
        stage:     String,
        enteredAt: Date,
        exitedAt:  Date,
        daysInStage: Number,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],

    tags: [String],
  },
  { timestamps: true }
);

// Auto-calculate weighted value
dealSchema.virtual('weightedValue').get(function () {
  return Math.round((this.value * this.probability) / 100);
});

// Auto-calculate ARR from MRR if not set
dealSchema.virtual('calculatedARR').get(function () {
  if (this.arr) return this.arr;
  if (this.mrr) return this.mrr * 12;
  return null;
});

dealSchema.index({ tenantId: 1, stage: 1 });
dealSchema.index({ tenantId: 1, owner: 1 });
dealSchema.index({ tenantId: 1, expectedCloseDate: 1 });
dealSchema.index({ tenantId: 1, dealType: 1 });
dealSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Deal', dealSchema);
