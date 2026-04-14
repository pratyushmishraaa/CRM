import mongoose from 'mongoose';

/**
 * Activity = any interaction or task in the sales process.
 * Standard B2B SaaS activity types only.
 */
const activitySchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },

    // ── Core ──────────────────────────────────────────────────────────────
    type: {
      type: String,
      enum: [
        'call',          // Phone call
        'email',         // Email sent/received
        'meeting',       // In-person or video meeting
        'demo',          // Product demonstration
        'linkedin',      // LinkedIn message/connection
        'note',          // Internal note
        'task',          // To-do / follow-up task
        'proposal_sent', // Proposal/quote sent
        'contract_sent', // Contract sent for signature
        'trial_started', // Free trial activated
        'stage_change',  // Pipeline stage changed
      ],
      required: true,
    },
    title:       { type: String, required: true },
    description: String,
    outcome:     String, // what happened / result
    nextStep:    String, // what to do next

    // ── Status ────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
      default: 'completed',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },

    // ── Timing ────────────────────────────────────────────────────────────
    scheduledAt: Date,
    completedAt: Date,
    dueDate:     Date,   // for tasks
    duration:    Number, // minutes (for calls/meetings)

    // ── Relationships ─────────────────────────────────────────────────────
    relatedTo: {
      model: { type: String, enum: ['Lead', 'Deal', 'Contact', 'Account'], required: true },
      id:    { type: mongoose.Schema.Types.ObjectId, required: true },
    },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // ── Call-specific ─────────────────────────────────────────────────────
    callDirection: { type: String, enum: ['inbound', 'outbound', null], default: null },
    callDisposition: {
      type: String,
      enum: ['connected', 'left_voicemail', 'no_answer', 'busy', 'wrong_number', null],
      default: null,
    },

    // ── Email-specific ────────────────────────────────────────────────────
    emailSubject: String,
    emailOpened:  { type: Boolean, default: false },
    emailClicked: { type: Boolean, default: false },

    // ── Meeting-specific ──────────────────────────────────────────────────
    location:   String,
    attendees:  [String], // email addresses of attendees

    // ── AI Analysis ───────────────────────────────────────────────────────
    transcript:     String,
    sentiment:      { type: String, enum: ['positive', 'neutral', 'negative', null], default: null },
    sentimentScore: Number,
    aiSummary:      String,
  },
  { timestamps: true }
);

activitySchema.index({ tenantId: 1, 'relatedTo.id': 1 });
activitySchema.index({ tenantId: 1, createdBy: 1 });
activitySchema.index({ tenantId: 1, scheduledAt: 1 });
activitySchema.index({ tenantId: 1, status: 1 });

export default mongoose.model('Activity', activitySchema);
