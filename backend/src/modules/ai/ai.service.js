/**
 * AI Service — rule-based implementation (no OpenAI dependency).
 * Produces useful outputs without any external API calls.
 */

// ── Email Generator ───────────────────────────────────────────────────────────
export const generateEmail = async ({ lead, context = '', tone = 'professional' }) => {
  const name = `${lead.firstName} ${lead.lastName}`;
  const company = lead.company || 'your company';
  const course = lead.interestedCourse || '';

  const toneMap = {
    professional: { greeting: 'I hope this message finds you well.', cta: 'Would you be available for a quick 15-minute call this week?' },
    casual:       { greeting: 'Hope you\'re doing great!', cta: 'Would love to chat — are you free for a quick call?' },
    urgent:       { greeting: 'I wanted to reach out before our offer expires.', cta: 'Let\'s connect today — slots are filling up fast.' },
  };
  const t = toneMap[tone] || toneMap.professional;

  if (course) {
    // EdTech email
    return `Subject: Your Interest in ${course} — Let's Talk!

Hi ${lead.firstName},

${t.greeting}

Thank you for showing interest in our ${course} program. Based on your profile, I believe this course is a perfect fit for your goals${lead.occupation ? ` as a ${lead.occupation}` : ''}.

Here's what you get:
• Industry-relevant curriculum designed for ${lead.educationLevel?.replace('_', ' ') || 'all levels'}
• Live sessions + recorded access
• Placement assistance & career support
• ${lead.learningMode ? `${lead.learningMode.charAt(0).toUpperCase() + lead.learningMode.slice(1)} learning mode available` : 'Flexible learning modes'}

${context ? `Additional note: ${context}` : ''}

${t.cta}

Best regards,
[Your Name]
[Institute Name]`;
  }

  // Software/SaaS email
  return `Subject: Helping ${company} ${lead.painPoints?.length ? 'Solve ' + lead.painPoints[0] : 'Scale Faster'}

Hi ${lead.firstName},

${t.greeting}

I noticed ${company} might be facing challenges that our platform directly addresses${lead.currentSolution ? ` — especially if you're currently using ${lead.currentSolution}` : ''}.

Our solution helps teams like yours:
• Save 5+ hours/week on manual processes
• Get real-time visibility across your pipeline
• Integrate with your existing tools in minutes
${lead.teamSize ? `• Perfect for teams of ${lead.teamSize}+ users` : ''}

${context ? `Context: ${context}` : ''}

${t.cta}

Best regards,
[Your Name]
[Company Name]`;
};

// ── Reply Suggestions ─────────────────────────────────────────────────────────
export const generateReplySuggestions = async ({ incomingEmail, leadContext }) => {
  return `1. [Enthusiastic]
Thanks for reaching out! I'm really excited about this opportunity and would love to move forward. Can we schedule a call tomorrow at 2 PM to discuss next steps?

2. [Professional]
Thank you for your message. I've reviewed the details and have a few questions before we proceed. Could we arrange a brief call this week to align on requirements and timelines?

3. [Follow-up]
Appreciate you getting back to me. To make sure I fully understand your needs, could you share a bit more about your current setup and what you're hoping to achieve? That will help me tailor the right solution for you.`;
};

// ── Transcript Sentiment Analysis ─────────────────────────────────────────────
export const analyzeTranscript = async (transcript) => {
  const text = transcript.toLowerCase();

  // Simple keyword-based sentiment
  const positiveWords = ['great', 'excellent', 'interested', 'yes', 'definitely', 'love', 'perfect', 'amazing', 'happy', 'excited', 'agree', 'good', 'sure', 'absolutely'];
  const negativeWords = ['no', 'not', 'never', 'expensive', 'problem', 'issue', 'concern', 'difficult', 'bad', 'wrong', 'cancel', 'refund', 'unhappy', 'disappointed'];

  const posCount = positiveWords.filter((w) => text.includes(w)).length;
  const negCount = negativeWords.filter((w) => text.includes(w)).length;

  let sentiment, score;
  if (posCount > negCount + 1) { sentiment = 'positive'; score = Math.min(65 + posCount * 5, 95); }
  else if (negCount > posCount + 1) { sentiment = 'negative'; score = Math.max(35 - negCount * 5, 10); }
  else { sentiment = 'neutral'; score = 50; }

  const sentences = transcript.split(/[.!?]/).filter((s) => s.trim().length > 10);
  const summary = sentences.slice(0, 2).join('. ').trim() + '.';

  return {
    sentiment,
    score,
    summary: summary || 'Conversation recorded. Review transcript for details.',
    keyPoints: [
      sentences[0]?.trim() || 'Initial discussion completed',
      sentences[1]?.trim() || 'Key topics covered',
      sentences[2]?.trim() || 'Follow-up actions identified',
    ],
    nextAction: sentiment === 'positive'
      ? 'Schedule follow-up meeting to close the deal'
      : sentiment === 'negative'
      ? 'Address concerns raised and send detailed proposal'
      : 'Send summary email and schedule next touchpoint',
  };
};

// ── Lead Scoring ──────────────────────────────────────────────────────────────
export const scoreLead = async (lead) => {
  let score = 30; // base score
  const reasons = [];

  // Source quality
  const sourceScores = { referral: 20, alumni_referral: 20, counselor_referral: 18, free_trial: 15, api_signup: 15, webinar: 12, website: 10, social_media: 8, youtube_ad: 8, career_fair: 10, school_visit: 8, cold_call: 5, other: 3 };
  score += sourceScores[lead.source] || 5;

  // Stage progression
  const stageScores = { NEW: 0, CONTACTED: 5, DEMO_SCHEDULED: 12, PROPOSAL_SENT: 18, NEGOTIATION: 22, WON: 30, LOST: -10 };
  score += stageScores[lead.stage] || 0;

  // Deal value
  if (lead.estimatedValue > 50000) { score += 15; reasons.push('high value deal'); }
  else if (lead.estimatedValue > 10000) { score += 8; reasons.push('mid value deal'); }

  // Software-specific
  if (lead.isTechnical) { score += 5; reasons.push('technical decision maker'); }
  if (lead.trialStarted) { score += 10; reasons.push('on active trial'); }
  if (lead.teamSize > 50) { score += 8; reasons.push('large team'); }

  // EdTech-specific
  if (lead.demoAttended) { score += 12; reasons.push('attended demo'); }
  if (!lead.scholarshipRequired) { score += 5; reasons.push('no scholarship needed'); }
  if (lead.learningMode === 'online') { score += 3; }
  if (lead.educationLevel === 'working_professional') { score += 8; reasons.push('working professional'); }

  // Recency
  const daysSinceCreated = Math.floor((Date.now() - new Date(lead.createdAt)) / 86400000);
  if (daysSinceCreated < 7) { score += 5; reasons.push('recent lead'); }
  else if (daysSinceCreated > 30) { score -= 5; }

  score = Math.min(Math.max(score, 0), 100);

  const priority = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  const reason = reasons.length
    ? `Score based on: ${reasons.slice(0, 3).join(', ')}.`
    : 'Score based on stage, source, and profile data.';

  return { score, reason, priority };
};
