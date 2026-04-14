// ── Lead Stages ───────────────────────────────────────────────────────────────
export const LEAD_STAGES = [
  { value: 'NEW',          label: 'New',          color: 'bg-blue-100 text-blue-800' },
  { value: 'CONTACTED',    label: 'Contacted',    color: 'bg-yellow-100 text-yellow-800' },
  { value: 'QUALIFIED',    label: 'Qualified',    color: 'bg-indigo-100 text-indigo-800' },
  { value: 'NURTURING',    label: 'Nurturing',    color: 'bg-cyan-100 text-cyan-800' },
  { value: 'CONVERTED',    label: 'Converted',    color: 'bg-green-100 text-green-800' },
  { value: 'DISQUALIFIED', label: 'Disqualified', color: 'bg-red-100 text-red-800' },
];

// ── Lead Ratings ──────────────────────────────────────────────────────────────
export const LEAD_RATINGS = [
  { value: 'hot',     label: '🔥 Hot',    color: 'bg-red-100 text-red-700' },
  { value: 'warm',    label: '🌤 Warm',   color: 'bg-orange-100 text-orange-700' },
  { value: 'cold',    label: '❄️ Cold',   color: 'bg-blue-100 text-blue-700' },
  { value: 'unrated', label: 'Unrated',   color: 'bg-gray-100 text-gray-600' },
];

// ── Deal Stages ───────────────────────────────────────────────────────────────
export const DEAL_STAGES = [
  { value: 'prospecting',   label: 'Prospecting',   color: 'bg-gray-100 text-gray-700' },
  { value: 'qualification', label: 'Qualification', color: 'bg-blue-100 text-blue-700' },
  { value: 'demo',          label: 'Demo',          color: 'bg-indigo-100 text-indigo-700' },
  { value: 'proposal',      label: 'Proposal',      color: 'bg-yellow-100 text-yellow-700' },
  { value: 'negotiation',   label: 'Negotiation',   color: 'bg-orange-100 text-orange-700' },
  { value: 'closed_won',    label: 'Closed Won',    color: 'bg-green-100 text-green-700' },
  { value: 'closed_lost',   label: 'Closed Lost',   color: 'bg-red-100 text-red-700' },
];

// ── Forecast Categories ───────────────────────────────────────────────────────
export const FORECAST_CATEGORIES = [
  { value: 'pipeline',   label: 'Pipeline',   color: 'bg-gray-100 text-gray-700' },
  { value: 'best_case',  label: 'Best Case',  color: 'bg-blue-100 text-blue-700' },
  { value: 'commit',     label: 'Commit',     color: 'bg-green-100 text-green-700' },
  { value: 'closed',     label: 'Closed',     color: 'bg-emerald-100 text-emerald-700' },
  { value: 'omitted',    label: 'Omitted',    color: 'bg-gray-100 text-gray-500' },
];

// ── Lead Sources ──────────────────────────────────────────────────────────────
export const LEAD_SOURCES = [
  { value: 'website',       label: 'Website / Organic' },
  { value: 'referral',      label: 'Customer Referral' },
  { value: 'cold_outbound', label: 'Cold Outbound (SDR)' },
  { value: 'inbound_email', label: 'Inbound Email' },
  { value: 'social_media',  label: 'Social Media' },
  { value: 'paid_ads',      label: 'Paid Advertising' },
  { value: 'product_hunt',  label: 'Product Hunt' },
  { value: 'github',        label: 'GitHub / Developer' },
  { value: 'webinar',       label: 'Webinar / Event' },
  { value: 'free_trial',    label: 'Free Trial Signup' },
  { value: 'api_signup',    label: 'API / Developer Signup' },
  { value: 'event',         label: 'Conference / Trade Show' },
  { value: 'partner',       label: 'Partner / Channel' },
  { value: 'content',       label: 'Content / SEO' },
  { value: 'other',         label: 'Other' },
];

// ── Activity Types ────────────────────────────────────────────────────────────
export const ACTIVITY_TYPES = [
  { value: 'call',          label: 'Call',           color: 'bg-blue-100 text-blue-700' },
  { value: 'email',         label: 'Email',          color: 'bg-purple-100 text-purple-700' },
  { value: 'meeting',       label: 'Meeting',        color: 'bg-green-100 text-green-700' },
  { value: 'demo',          label: 'Demo',           color: 'bg-indigo-100 text-indigo-700' },
  { value: 'linkedin',      label: 'LinkedIn',       color: 'bg-sky-100 text-sky-700' },
  { value: 'note',          label: 'Note',           color: 'bg-gray-100 text-gray-700' },
  { value: 'task',          label: 'Task',           color: 'bg-orange-100 text-orange-700' },
  { value: 'proposal_sent', label: 'Proposal Sent',  color: 'bg-yellow-100 text-yellow-700' },
  { value: 'contract_sent', label: 'Contract Sent',  color: 'bg-emerald-100 text-emerald-700' },
  { value: 'trial_started', label: 'Trial Started',  color: 'bg-teal-100 text-teal-700' },
];

// ── Deal Types ────────────────────────────────────────────────────────────────
export const DEAL_TYPES = [
  { value: 'new_business', label: 'New Business' },
  { value: 'upsell',       label: 'Upsell' },
  { value: 'cross_sell',   label: 'Cross-sell' },
  { value: 'renewal',      label: 'Renewal' },
  { value: 'expansion',    label: 'Expansion' },
];

// ── Plan Names ────────────────────────────────────────────────────────────────
export const PLAN_NAMES = ['Free', 'Starter', 'Growth', 'Pro', 'Business', 'Enterprise', 'Custom'];

// ── Billing Cycles ────────────────────────────────────────────────────────────
export const BILLING_CYCLES = [
  { value: 'monthly',    label: 'Monthly' },
  { value: 'annual',     label: 'Annual' },
  { value: 'multi_year', label: 'Multi-year' },
  { value: 'one_time',   label: 'One-time' },
];

// ── Company Sizes ─────────────────────────────────────────────────────────────
export const COMPANY_SIZES = [
  { value: '1-10',    label: '1–10 employees' },
  { value: '11-50',   label: '11–50 employees' },
  { value: '51-200',  label: '51–200 employees' },
  { value: '201-500', label: '201–500 employees' },
  { value: '501-1000',label: '501–1,000 employees' },
  { value: '1000+',   label: '1,000+ employees' },
];

// ── Account Segments ──────────────────────────────────────────────────────────
export const ACCOUNT_SEGMENTS = [
  { value: 'enterprise',  label: 'Enterprise' },
  { value: 'mid_market',  label: 'Mid-Market' },
  { value: 'smb',         label: 'SMB' },
  { value: 'startup',     label: 'Startup' },
];

// ── Contact Buying Roles ──────────────────────────────────────────────────────
export const BUYING_ROLES = [
  { value: 'decision_maker',       label: 'Decision Maker' },
  { value: 'champion',             label: 'Champion' },
  { value: 'influencer',           label: 'Influencer' },
  { value: 'end_user',             label: 'End User' },
  { value: 'evaluator',            label: 'Technical Evaluator' },
  { value: 'blocker',              label: 'Blocker' },
  { value: 'other',                label: 'Other' },
];

// ── Seniority Levels ──────────────────────────────────────────────────────────
export const SENIORITY_LEVELS = [
  { value: 'c_level',               label: 'C-Level (CEO, CTO, CFO)' },
  { value: 'vp',                    label: 'VP / SVP' },
  { value: 'director',              label: 'Director' },
  { value: 'manager',               label: 'Manager' },
  { value: 'individual_contributor',label: 'Individual Contributor' },
  { value: 'other',                 label: 'Other' },
];

// ── Decision Timelines ────────────────────────────────────────────────────────
export const DECISION_TIMELINES = [
  { value: 'immediate', label: 'Immediate (< 2 weeks)' },
  { value: '1_month',   label: '1 Month' },
  { value: '3_months',  label: '3 Months' },
  { value: '6_months',  label: '6 Months' },
  { value: '12_months', label: '12 Months' },
  { value: 'unknown',   label: 'Unknown' },
];

// ── Roles ─────────────────────────────────────────────────────────────────────
export const ROLES = [
  { value: 'admin',   label: 'Admin' },
  { value: 'manager', label: 'Sales Manager' },
  { value: 'sales',   label: 'Sales Rep / AE' },
];

// ── Formatter ─────────────────────────────────────────────────────────────────
export const fmt = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n || 0);

export const fmtCompact = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};
