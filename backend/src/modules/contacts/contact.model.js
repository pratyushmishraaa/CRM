import mongoose from 'mongoose';

/**
 * Contact = a person at a company.
 * In B2B SaaS, a deal involves multiple contacts (buying committee).
 * Each contact has a role in the buying process.
 */
const contactSchema = new mongoose.Schema(
  {
    tenantId:   { type: String, required: true, index: true },

    // ── Personal Info ─────────────────────────────────────────────────────
    firstName:  { type: String, required: true, trim: true },
    lastName:   { type: String, required: true, trim: true },
    email:      { type: String, lowercase: true, trim: true },
    phone:      String,
    mobilePhone: String,
    linkedIn:   String,

    // ── Professional Info ─────────────────────────────────────────────────
    jobTitle:   String,
    department: String,
    seniority: {
      type: String,
      enum: ['c_level', 'vp', 'director', 'manager', 'individual_contributor', 'other', null],
      default: null,
    },

    // ── Role in Buying Process ────────────────────────────────────────────
    buyingRole: {
      type: String,
      enum: ['decision_maker', 'champion', 'influencer', 'end_user', 'blocker', 'evaluator', 'other'],
      default: 'other',
    },
    isDecisionMaker: { type: Boolean, default: false },

    // ── Relationships ─────────────────────────────────────────────────────
    account:   { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    reportsTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }, // manager
    owner:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // ── Status ────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['active', 'inactive', 'bounced'],
      default: 'active',
    },
    doNotContact: { type: Boolean, default: false },
    emailOptIn:   { type: Boolean, default: true },
    preferredContact: {
      type: String,
      enum: ['email', 'phone', 'linkedin', 'any'],
      default: 'email',
    },

    // ── SaaS-specific ─────────────────────────────────────────────────────
    techStack:   [String], // technologies they use
    productUser: { type: Boolean, default: false }, // are they a user of your product?

    // ── Tracking ──────────────────────────────────────────────────────────
    lastActivityDate: Date,
    source:  String,
    notes:   String,
    tags:    [String],
  },
  { timestamps: true }
);

contactSchema.index({ tenantId: 1, email: 1 });
contactSchema.index({ tenantId: 1, account: 1 });
contactSchema.index({ tenantId: 1, buyingRole: 1 });

export default mongoose.model('Contact', contactSchema);
