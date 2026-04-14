import mongoose from 'mongoose';

/**
 * Account = a Company / Organization.
 * The central entity in B2B SaaS CRM.
 * Contacts, Deals, and Activities all link to Accounts.
 */
const accountSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },

    // ── Core ──────────────────────────────────────────────────────────────
    name:     { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['prospect', 'customer', 'churned', 'partner', 'competitor', 'vendor'],
      default: 'prospect',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'at_risk', 'churned'],
      default: 'active',
    },

    // ── Classification ────────────────────────────────────────────────────
    industry: String,
    segment: {
      type: String,
      enum: ['enterprise', 'mid_market', 'smb', 'startup', null],
      default: null,
    },
    territory: String, // geographic or sales territory

    // ── Contact Info ──────────────────────────────────────────────────────
    website:  String,
    phone:    String,
    email:    String,
    address: {
      street: String, city: String, state: String, country: String, zip: String,
    },

    // ── Company Metrics ───────────────────────────────────────────────────
    annualRevenue:  Number,
    employeeCount:  Number,
    fundingStage:   String, // Seed, Series A, B, C, Public, etc.
    parentAccount:  { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }, // for subsidiaries

    // ── Relationship ──────────────────────────────────────────────────────
    owner:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    source:    String,

    // ── SaaS / Customer Success ───────────────────────────────────────────
    currentSolution:  String,  // what they use today (competitor)
    contractValue:    Number,  // current contract value
    contractStartDate: Date,
    renewalDate:      Date,
    healthScore:      { type: Number, min: 0, max: 100 }, // 0=at risk, 100=healthy
    npsScore:         Number,  // Net Promoter Score
    supportTier:      { type: String, enum: ['basic', 'standard', 'premium', 'enterprise', null], default: null },
    csm:              { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Customer Success Manager

    // ── Tracking ──────────────────────────────────────────────────────────
    lastActivityDate: Date,
    notes:  String,
    tags:   [String],
  },
  { timestamps: true }
);

accountSchema.index({ tenantId: 1, name: 1 });
accountSchema.index({ tenantId: 1, type: 1 });
accountSchema.index({ tenantId: 1, segment: 1 });
accountSchema.index({ tenantId: 1, renewalDate: 1 });

export default mongoose.model('Account', accountSchema);
