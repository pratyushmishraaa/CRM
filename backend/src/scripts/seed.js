/**
 * Database Seeder — SaaS CRM (Industry Standard)
 * Run: npm run seed
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../modules/users/user.model.js';
import Lead from '../modules/leads/lead.model.js';
import Deal from '../modules/deals/deal.model.js';
import Activity from '../modules/activities/activity.model.js';
import AuditLog from '../modules/audit/audit.model.js';
import Contact from '../modules/contacts/contact.model.js';
import Account from '../modules/contacts/account.model.js';

const T = 'acme-saas-demo';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB');

    await Promise.all([
      User.deleteMany({ tenantId: T }), Lead.deleteMany({ tenantId: T }),
      Deal.deleteMany({ tenantId: T }), Activity.deleteMany({ tenantId: T }),
      AuditLog.deleteMany({ tenantId: T }), Contact.deleteMany({ tenantId: T }),
      Account.deleteMany({ tenantId: T }),
    ]);
    console.log('🗑️  Cleared existing data');

    const [admin, manager, ae1, ae2] = await User.create([
      { tenantId: T, firstName: 'Admin', lastName: 'User', email: 'admin@acme.com', password: 'password123', role: 'admin', isActive: true },
      { tenantId: T, firstName: 'Sarah', lastName: 'Chen', email: 'manager@acme.com', password: 'password123', role: 'manager', isActive: true },
      { tenantId: T, firstName: 'James', lastName: 'Wilson', email: 'james@acme.com', password: 'password123', role: 'sales', isActive: true },
      { tenantId: T, firstName: 'Priya', lastName: 'Sharma', email: 'priya@acme.com', password: 'password123', role: 'sales', isActive: true },
    ]);
    console.log('👤 Created 4 users');

    const accounts = await Account.create([
      { tenantId: T, name: 'TechCorp Solutions', type: 'prospect', industry: 'SaaS', segment: 'mid_market', website: 'https://techcorp.io', annualRevenue: 8000000, employeeCount: 120, currentSolution: 'Salesforce', healthScore: null, territory: 'US-West', createdBy: admin._id, owner: ae1._id, tags: ['saas', 'series-b'] },
      { tenantId: T, name: 'FinTech Innovations', type: 'customer', industry: 'FinTech', segment: 'enterprise', website: 'https://fintechinno.com', annualRevenue: 45000000, employeeCount: 350, contractValue: 48000, renewalDate: new Date(Date.now() + 45 * 86400000), healthScore: 82, npsScore: 42, supportTier: 'enterprise', territory: 'US-East', createdBy: admin._id, owner: manager._id, tags: ['enterprise', 'fintech'] },
      { tenantId: T, name: 'StartupIO', type: 'prospect', industry: 'E-commerce', segment: 'startup', employeeCount: 18, currentSolution: 'HubSpot', territory: 'US-West', createdBy: admin._id, owner: ae2._id },
      { tenantId: T, name: 'RetailPlus Corp', type: 'prospect', industry: 'Retail', segment: 'mid_market', employeeCount: 280, annualRevenue: 12000000, currentSolution: 'Pipedrive', territory: 'EMEA', createdBy: admin._id, owner: ae1._id },
      { tenantId: T, name: 'CloudBase Inc', type: 'customer', industry: 'Cloud Infrastructure', segment: 'enterprise', employeeCount: 800, contractValue: 96000, renewalDate: new Date(Date.now() + 120 * 86400000), healthScore: 91, npsScore: 68, supportTier: 'premium', territory: 'US-West', createdBy: admin._id, owner: manager._id },
    ]);
    console.log(`🏢 Created ${accounts.length} accounts`);

    const leads = await Lead.create([
      { tenantId: T, firstName: 'Alice', lastName: 'Johnson', email: 'alice@techcorp.io', phone: '+1-415-555-0101', company: 'TechCorp Solutions', jobTitle: 'CTO', department: 'Engineering', industry: 'SaaS', companySize: '51-200', source: 'product_hunt', stage: 'QUALIFIED', rating: 'hot', estimatedValue: 24000, budget: 30000, budgetConfirmed: true, decisionTimeline: '3_months', currentSolution: 'Salesforce', painPoints: ['No API access', 'Expensive per-seat pricing', 'Poor reporting'], useCase: 'Replace Salesforce for engineering-led sales motion', teamSize: 45, isTechnical: true, isDecisionMaker: true, trialStarted: true, trialEndDate: new Date(Date.now() + 7 * 86400000), interestedIn: ['Enterprise Plan'], aiScore: 87, aiScoreReason: 'CTO at 120-person SaaS, on active trial, replacing Salesforce, confirmed budget.', aiScoreUpdatedAt: new Date(), account: accounts[0]._id, assignedTo: ae1._id, createdBy: admin._id, tags: ['hot', 'enterprise', 'trial'] },
      { tenantId: T, firstName: 'Bob', lastName: 'Martinez', email: 'bob@startupio.com', phone: '+1-650-555-0202', company: 'StartupIO', jobTitle: 'CEO & Co-founder', companySize: '11-50', source: 'free_trial', stage: 'CONTACTED', rating: 'warm', estimatedValue: 6000, decisionTimeline: '1_month', currentSolution: 'HubSpot', painPoints: ['Too expensive', 'Complex setup', 'No developer API'], teamSize: 8, isTechnical: false, isDecisionMaker: true, trialStarted: true, interestedIn: ['Growth Plan'], aiScore: 62, aiScoreReason: 'CEO of early-stage startup, price-sensitive, on trial.', aiScoreUpdatedAt: new Date(), account: accounts[2]._id, assignedTo: ae2._id, createdBy: admin._id },
      { tenantId: T, firstName: 'Carol', lastName: 'Davis', email: 'carol@retailplus.com', phone: '+44-20-5555-0303', company: 'RetailPlus Corp', jobTitle: 'VP of Sales Operations', department: 'Sales', companySize: '201-500', source: 'webinar', stage: 'QUALIFIED', rating: 'hot', estimatedValue: 42000, budget: 50000, budgetConfirmed: true, decisionTimeline: '3_months', currentSolution: 'Pipedrive', painPoints: ['No team analytics', 'Poor forecasting', 'No territory management'], teamSize: 80, isTechnical: false, isDecisionMaker: false, interestedIn: ['Business Plan', 'SSO'], aiScore: 78, aiScoreReason: 'VP Sales Ops at 280-person company, attended webinar, confirmed budget.', aiScoreUpdatedAt: new Date(), account: accounts[3]._id, assignedTo: ae1._id, createdBy: admin._id, tags: ['enterprise', 'emea'] },
      { tenantId: T, firstName: 'David', lastName: 'Chen', email: 'david@fintechinno.com', phone: '+1-212-555-0404', company: 'FinTech Innovations', jobTitle: 'Head of Revenue Operations', department: 'Revenue', companySize: '201-500', source: 'referral', stage: 'CONVERTED', rating: 'hot', estimatedValue: 60000, budget: 60000, budgetConfirmed: true, decisionTimeline: 'immediate', currentSolution: 'Zoho CRM', teamSize: 120, isTechnical: true, isDecisionMaker: true, convertedToDeal: true, convertedAt: new Date(Date.now() - 30 * 86400000), interestedIn: ['Enterprise Plan', 'API Access', 'Custom Integrations'], aiScore: 94, aiScoreReason: 'Head of RevOps at large FinTech, referred by existing customer, converted to deal.', aiScoreUpdatedAt: new Date(), account: accounts[1]._id, assignedTo: manager._id, createdBy: admin._id, tags: ['converted', 'enterprise'] },
      { tenantId: T, firstName: 'Emma', lastName: 'Wilson', email: 'emma@devtools.io', phone: '+1-512-555-0505', company: 'DevTools Inc', jobTitle: 'Engineering Manager', companySize: '11-50', source: 'github', stage: 'NEW', rating: 'warm', estimatedValue: 12000, decisionTimeline: '6_months', isTechnical: true, isDecisionMaker: false, interestedIn: ['Pro Plan'], aiScore: 55, aiScoreReason: 'Engineering Manager, technical user, early stage, no budget confirmed.', aiScoreUpdatedAt: new Date(), assignedTo: ae2._id, createdBy: admin._id },
      { tenantId: T, firstName: 'Frank', lastName: 'Lee', email: 'frank@cloudbase.io', phone: '+1-206-555-0606', company: 'CloudBase Inc', jobTitle: 'Director of IT', department: 'IT', companySize: '501-1000', source: 'cold_outbound', stage: 'NURTURING', rating: 'cold', estimatedValue: 18000, decisionTimeline: '12_months', currentSolution: 'Salesforce', teamSize: 30, isTechnical: true, isDecisionMaker: false, aiScore: 38, aiScoreReason: 'Director of IT, not decision maker, long timeline, already has Salesforce.', aiScoreUpdatedAt: new Date(), account: accounts[4]._id, assignedTo: ae1._id, createdBy: admin._id },
      { tenantId: T, firstName: 'Grace', lastName: 'Kim', email: 'grace@scaleup.com', phone: '+1-415-555-0707', company: 'ScaleUp Analytics', jobTitle: 'Chief Revenue Officer', companySize: '51-200', source: 'content', stage: 'CONTACTED', rating: 'warm', estimatedValue: 30000, decisionTimeline: '3_months', currentSolution: 'Pipedrive', isTechnical: false, isDecisionMaker: true, interestedIn: ['Business Plan'], aiScore: 71, aiScoreReason: 'CRO at analytics company, decision maker, replacing Pipedrive.', aiScoreUpdatedAt: new Date(), assignedTo: ae2._id, createdBy: admin._id, tags: ['crm-replacement'] },
    ]);
    console.log(`🎯 Created ${leads.length} leads`);

    const contacts = await Contact.create([
      { tenantId: T, firstName: 'Alice', lastName: 'Johnson', email: 'alice@techcorp.io', phone: '+1-415-555-0101', jobTitle: 'CTO', department: 'Engineering', seniority: 'c_level', buyingRole: 'decision_maker', isDecisionMaker: true, linkedIn: 'https://linkedin.com/in/alicejohnson', techStack: ['React', 'Node.js', 'AWS', 'Kubernetes'], productUser: false, account: accounts[0]._id, createdBy: admin._id, owner: ae1._id },
      { tenantId: T, firstName: 'Marcus', lastName: 'Thompson', email: 'marcus@techcorp.io', jobTitle: 'VP of Engineering', department: 'Engineering', seniority: 'vp', buyingRole: 'champion', isDecisionMaker: false, techStack: ['Python', 'Go', 'GCP'], productUser: true, account: accounts[0]._id, createdBy: admin._id, owner: ae1._id },
      { tenantId: T, firstName: 'David', lastName: 'Chen', email: 'david@fintechinno.com', phone: '+1-212-555-0404', jobTitle: 'Head of Revenue Operations', department: 'Revenue', seniority: 'director', buyingRole: 'decision_maker', isDecisionMaker: true, linkedIn: 'https://linkedin.com/in/davidchen', account: accounts[1]._id, createdBy: admin._id, owner: manager._id },
      { tenantId: T, firstName: 'Lisa', lastName: 'Park', email: 'lisa@fintechinno.com', jobTitle: 'Sales Operations Manager', department: 'Sales', seniority: 'manager', buyingRole: 'champion', isDecisionMaker: false, productUser: true, account: accounts[1]._id, createdBy: admin._id, owner: manager._id },
      { tenantId: T, firstName: 'Carol', lastName: 'Davis', email: 'carol@retailplus.com', phone: '+44-20-5555-0303', jobTitle: 'VP of Sales Operations', department: 'Sales', seniority: 'vp', buyingRole: 'influencer', isDecisionMaker: false, account: accounts[3]._id, createdBy: admin._id, owner: ae1._id },
    ]);
    console.log(`👥 Created ${contacts.length} contacts`);

    const deals = await Deal.create([
      {
        tenantId: T, title: 'TechCorp — Enterprise License (45 seats)', lead: leads[0]._id, account: accounts[0]._id, primaryContact: contacts[0]._id,
        stage: 'demo', forecastCategory: 'best_case', probability: 60, value: 24000, currency: 'USD',
        dealType: 'new_business', planName: 'Enterprise', billingCycle: 'annual', seats: 45, mrr: 2000, arr: 24000,
        competitorReplaced: 'Salesforce', competitors: ['HubSpot'],
        expectedCloseDate: new Date(Date.now() + 30 * 86400000),
        nextStep: 'Send security questionnaire, schedule technical review with Marcus',
        owner: ae1._id, createdBy: admin._id,
        stageHistory: [
          { stage: 'prospecting', enteredAt: new Date(Date.now() - 45 * 86400000), exitedAt: new Date(Date.now() - 35 * 86400000), daysInStage: 10 },
          { stage: 'qualification', enteredAt: new Date(Date.now() - 35 * 86400000), exitedAt: new Date(Date.now() - 20 * 86400000), daysInStage: 15 },
          { stage: 'demo', enteredAt: new Date(Date.now() - 20 * 86400000), daysInStage: 20 },
        ],
      },
      {
        tenantId: T, title: 'FinTech Innovations — Annual Renewal + Expansion', lead: leads[3]._id, account: accounts[1]._id, primaryContact: contacts[2]._id,
        stage: 'negotiation', forecastCategory: 'commit', probability: 85, value: 60000, currency: 'USD',
        dealType: 'renewal', planName: 'Enterprise', billingCycle: 'annual', seats: 120, mrr: 5000, arr: 60000,
        contractSigned: false, expectedCloseDate: new Date(Date.now() + 12 * 86400000),
        nextStep: 'Legal review of updated MSA, confirm pricing with David',
        owner: manager._id, createdBy: admin._id,
        stageHistory: [
          { stage: 'prospecting', enteredAt: new Date(Date.now() - 60 * 86400000), exitedAt: new Date(Date.now() - 50 * 86400000), daysInStage: 10 },
          { stage: 'qualification', enteredAt: new Date(Date.now() - 50 * 86400000), exitedAt: new Date(Date.now() - 30 * 86400000), daysInStage: 20 },
          { stage: 'proposal', enteredAt: new Date(Date.now() - 30 * 86400000), exitedAt: new Date(Date.now() - 10 * 86400000), daysInStage: 20 },
          { stage: 'negotiation', enteredAt: new Date(Date.now() - 10 * 86400000), daysInStage: 10 },
        ],
      },
      {
        tenantId: T, title: 'RetailPlus — Business Plan (80 seats)', lead: leads[2]._id, account: accounts[3]._id, primaryContact: contacts[4]._id,
        stage: 'proposal', forecastCategory: 'pipeline', probability: 45, value: 42000, currency: 'USD',
        dealType: 'new_business', planName: 'Business', billingCycle: 'annual', seats: 80, mrr: 3500, arr: 42000,
        competitorReplaced: 'Pipedrive', competitors: ['Salesforce', 'HubSpot'],
        expectedCloseDate: new Date(Date.now() + 45 * 86400000),
        nextStep: 'Follow up on proposal, schedule exec alignment call',
        requiresIntegration: true, integrationDetails: 'Salesforce data migration, Slack, SSO/SAML',
        owner: ae1._id, createdBy: admin._id,
      },
      {
        tenantId: T, title: 'StartupIO — Growth Plan', lead: leads[1]._id, account: accounts[2]._id,
        stage: 'qualification', forecastCategory: 'pipeline', probability: 30, value: 6000, currency: 'USD',
        dealType: 'new_business', planName: 'Growth', billingCycle: 'monthly', seats: 8, mrr: 500, arr: 6000,
        expectedCloseDate: new Date(Date.now() + 20 * 86400000),
        nextStep: 'Confirm budget with Bob, send pricing comparison vs HubSpot',
        owner: ae2._id, createdBy: admin._id,
      },
      {
        tenantId: T, title: 'CloudBase — Pro Upsell (30 seats)', account: accounts[4]._id,
        stage: 'closed_won', forecastCategory: 'closed', probability: 100, value: 18000, currency: 'USD',
        dealType: 'upsell', planName: 'Pro', billingCycle: 'annual', seats: 30, mrr: 1500, arr: 18000,
        contractSigned: true, contractDate: new Date(Date.now() - 15 * 86400000),
        actualCloseDate: new Date(Date.now() - 15 * 86400000),
        owner: manager._id, createdBy: admin._id,
      },
    ]);
    console.log(`💼 Created ${deals.length} deals`);

    await Activity.create([
      { tenantId: T, type: 'demo', title: 'Product demo — TechCorp (Alice + Marcus)', status: 'completed', priority: 'high', duration: 60, relatedTo: { model: 'Deal', id: deals[0]._id }, createdBy: ae1._id, outcome: 'Very positive. Alice loved the API. Marcus wants to test Kubernetes integration. Moving to technical review.', nextStep: 'Send security questionnaire by EOD Friday', sentiment: 'positive', sentimentScore: 88, aiSummary: 'Strong demo. CTO impressed with API capabilities. Engineering team wants to validate Kubernetes integration before sign-off.' },
      { tenantId: T, type: 'call', title: 'Renewal negotiation call — FinTech (David Chen)', status: 'completed', priority: 'urgent', duration: 45, callDirection: 'outbound', callDisposition: 'connected', relatedTo: { model: 'Deal', id: deals[1]._id }, createdBy: manager._id, outcome: 'David agreed to 2-year renewal at current pricing + 20 seat expansion. Legal review needed for updated MSA.', nextStep: 'Send updated MSA to legal team by Monday', sentiment: 'positive', sentimentScore: 82, transcript: 'Sarah: David, thanks for joining. We wanted to discuss the renewal terms. David: We are very happy with the product. The team loves it. Main concern is the 15% price increase. Sarah: We can offer a 2-year lock-in at current pricing plus 20 additional seats. David: That works for us. Let me get legal to review the MSA.', aiSummary: 'Customer satisfied with product. Agreed to 2-year renewal at current pricing with 20 seat expansion. Legal review pending.' },
      { tenantId: T, type: 'email', title: 'Proposal sent — RetailPlus Business Plan', status: 'completed', emailSubject: 'RetailPlus × Acme CRM — Business Plan Proposal', emailOpened: true, relatedTo: { model: 'Deal', id: deals[2]._id }, createdBy: ae1._id, outcome: 'Proposal sent with ROI calculator and Pipedrive migration guide. Carol confirmed receipt.', nextStep: 'Follow up in 3 days if no response' },
      { tenantId: T, type: 'call', title: 'Discovery call — StartupIO (Bob Martinez)', status: 'completed', duration: 30, callDirection: 'outbound', callDisposition: 'connected', relatedTo: { model: 'Lead', id: leads[1]._id }, createdBy: ae2._id, outcome: 'Bob is interested but price-sensitive. Currently paying $800/mo for HubSpot. Wants to see ROI before committing.', nextStep: 'Send pricing comparison vs HubSpot, schedule product walkthrough', sentiment: 'neutral', sentimentScore: 55, aiSummary: 'CEO interested but price-sensitive. Needs ROI justification vs current HubSpot spend.' },
      { tenantId: T, type: 'meeting', title: 'QBR — CloudBase Inc', status: 'completed', duration: 90, location: 'Zoom — https://zoom.us/j/123456', relatedTo: { model: 'Account', id: accounts[4]._id }, createdBy: manager._id, outcome: 'Excellent QBR. NPS improved from 52 to 68. Identified 3 expansion opportunities in IT and DevOps teams.', nextStep: 'Schedule follow-up with IT Director for DevOps team expansion', sentiment: 'positive', sentimentScore: 91 },
      { tenantId: T, type: 'task', title: 'Send security questionnaire to TechCorp', status: 'scheduled', priority: 'high', dueDate: new Date(Date.now() + 2 * 86400000), relatedTo: { model: 'Deal', id: deals[0]._id }, createdBy: ae1._id, description: 'Alice requested our SOC2 report and security questionnaire before technical review.' },
      { tenantId: T, type: 'linkedin', title: 'LinkedIn outreach — Grace Kim (ScaleUp Analytics)', status: 'completed', relatedTo: { model: 'Lead', id: leads[6]._id }, createdBy: ae2._id, outcome: 'Grace responded positively. Interested in a 30-min discovery call next week.', nextStep: 'Book discovery call for next Tuesday' },
      { tenantId: T, type: 'proposal_sent', title: 'Proposal sent — FinTech Renewal', status: 'completed', relatedTo: { model: 'Deal', id: deals[1]._id }, createdBy: manager._id, description: 'Sent 2-year renewal proposal with expansion pricing for 120 → 140 seats.' },
    ]);
    console.log('📋 Created 8 activities');

    await AuditLog.create([
      { tenantId: T, userId: admin._id, action: 'auth.register', resource: 'User', resourceId: admin._id, ipAddress: '127.0.0.1' },
      { tenantId: T, userId: ae1._id, action: 'lead.created', resource: 'Lead', resourceId: leads[0]._id },
      { tenantId: T, userId: manager._id, action: 'deal.created', resource: 'Deal', resourceId: deals[1]._id },
      { tenantId: T, userId: ae1._id, action: 'deal.stage_changed', resource: 'Deal', resourceId: deals[0]._id, metadata: { from: 'qualification', to: 'demo' } },
    ]);

    console.log('\n✅ Seed complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Login credentials:');
    console.log('   Admin:   admin@acme.com   / password123');
    console.log('   Manager: manager@acme.com / password123');
    console.log('   AE 1:    james@acme.com   / password123');
    console.log('   AE 2:    priya@acme.com   / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
