import mongoose from 'mongoose';

/**
 * Lead Stages — industry standard for B2B SaaS.
 * Leads are PROSPECTS that get qualified into Deals.
 * They don't "win" — they CONVERT to a Deal.
 */
export const LEAD_STAGES = [
  'NEW',          // Just entered the system
  'CONTACTED',    // First outreach made
  'QUALIFIED',    // Meets ICP criteria, budget confirmed
  'NURTURING',    // Not ready now, keep warm
  'CONVERTED',    // Converted to a Deal
  'DISQUALIFIED', // Does not meet criteria
];

export const LEAD_SOURCES = [
  'website',        // Organic website form
  'referral',       // Customer/partner referral
  'cold_outbound',  // SDR cold email/call
  'inbound_email',  // Replied to email campaign
  'social_media',   // LinkedIn, Twitter, etc.
  'paid_ads',       // Google Ads, LinkedIn Ads
  'product_hunt',   // Product Hunt listing
  'github',         // GitHub / developer community
  'webinar',        // Attended a webinar
  'free_trial',     // Signed up for free trial
  'api_signup',     // Developer API signup
  'event',          // Conference / trade show
  'partner',        // Channel / reseller partner
  'content',        // Blog / SEO / content marketing
  'other',
];

export const LEAD_RATINGS = ['hot', 'warm', 'cold', 'unrated'];

const leadSchema = new mongoose.Schema(
  {
    tenantId:   { type: String, required: true, index: true },

    // ── Contact Info ──────────────────────────────────────────────────────
    firstName:  { type: String, required: true, trim: true },
    lastName:   { type: String, required: true, trim: true },
    email:      { type: String, lowercase: true, trim: true },
    phone:      String,
    mobilePhone: String,
    linkedIn:   String,
    website:    String,

    // ── Company Info ──────────────────────────────────────────────────────
    company:    String,
    jobTitle:   String,
    department: String,
    industry:   String,
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+', null],
      default: null,
    },
    annualRevenue: Number, // prospect company revenue

    // ── Pipeline ──────────────────────────────────────────────────────────
    stage:  { type: String, enum: LEAD_STAGES, default: 'NEW' },
    rating: { type: String, enum: LEAD_RATINGS, default: 'unrated' },
    source: { type: String, enum: LEAD_SOURCES, default: 'other' },
    campaign: String, // UTM campaign or campaign name

    // ── Assignment ────────────────────────────────────────────────────────
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    account:    { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },

    // ── Qualification ─────────────────────────────────────────────────────
    estimatedValue:  { type: Number, default: 0 }, // potential deal value
    budget:          Number,   // confirmed budget
    budgetConfirmed: { type: Boolean, default: false },
    decisionTimeline: {
      type: String,
      enum: ['immediate', '1_month', '3_months', '6_months', '12_months', 'unknown', null],
      default: null,
    },

    // ── SaaS-specific ─────────────────────────────────────────────────────
    currentSolution: String,   // what they use today
    painPoints:      [String], // key problems they have
    useCase:         String,   // what they want to use the product for
    teamSize:        Number,   // number of users/seats needed
    trialStarted:    { type: Boolean, default: false },
    trialStartDate:  Date,
    trialEndDate:    Date,
    interestedIn:    [String], // plan/feature interest
    isTechnical:     { type: Boolean, default: false }, // technical buyer?
    isDecisionMaker: { type: Boolean, default: false },

    // ── Compliance ────────────────────────────────────────────────────────
    doNotContact:    { type: Boolean, default: false },
    emailOptIn:      { type: Boolean, default: true },

    // ── AI Scoring ────────────────────────────────────────────────────────
    aiScore:          { type: Number, min: 0, max: 100, default: null },
    aiScoreReason:    String,
    aiScoreUpdatedAt: Date,

    // ── Tracking ──────────────────────────────────────────────────────────
    convertedToDeal: { type: Boolean, default: false },
    convertedAt:     Date,
    convertedDeal:   { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
    lastContactedAt: Date,
    nextFollowUpAt:  Date,
    notes:  String,
    tags:   [String],
  },
  { timestamps: true }
);

leadSchema.index({ tenantId: 1, stage: 1 });
leadSchema.index({ tenantId: 1, email: 1 });
leadSchema.index({ tenantId: 1, assignedTo: 1 });
leadSchema.index({ tenantId: 1, rating: 1 });
leadSchema.index({ tenantId: 1, createdAt: -1 });

export default mongoose.model('Lead', leadSchema);
