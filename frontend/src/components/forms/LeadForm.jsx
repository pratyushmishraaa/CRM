import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutate } from '../../hooks/useApi';
import { LEAD_STAGES, LEAD_RATINGS, LEAD_SOURCES, PLAN_NAMES, COMPANY_SIZES, DECISION_TIMELINES } from '../../utils/constants';

const TABS = [
  { id: 'contact',  label: 'Contact Info' },
  { id: 'qualify',  label: 'Qualification' },
  { id: 'saas',     label: 'SaaS Details' },
];

export default function LeadForm({ lead, onSuccess }) {
  const isEdit = !!lead;
  const [tab, setTab] = useState('contact');

  const { register, handleSubmit } = useForm({
    defaultValues: lead || { stage: 'NEW', rating: 'unrated', source: 'website', emailOptIn: true },
  });

  const create = useMutate('leads', 'post', { successMessage: 'Lead created' });
  const update = useMutate('leads', 'patch', { successMessage: 'Lead updated' });

  const onSubmit = (data) => {
    // Strip empty strings so backend doesn't receive blank fields
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    if (isEdit) update.mutateAsync({ id: lead._id, data: clean }).then(onSuccess);
    else        create.mutateAsync({ data: clean }).then(onSuccess);
  };

  const pending = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Contact Info ─────────────────────────────────────────────── */}
      {tab === 'contact' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name *</label>
              <input {...register('firstName', { required: true })} className="input" />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input {...register('lastName', { required: true })} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Work Email</label>
            <input type="email" {...register('email')} className="input" placeholder="name@company.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Phone</label>
              <input type="tel" {...register('phone')} className="input" />
            </div>
            <div>
              <label className="label">Mobile</label>
              <input type="tel" {...register('mobilePhone')} className="input" />
            </div>
          </div>
          <div>
            <label className="label">LinkedIn URL</label>
            <input type="url" {...register('linkedIn')} className="input" placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Job Title</label>
              <input {...register('jobTitle')} className="input" />
            </div>
            <div>
              <label className="label">Department</label>
              <input {...register('department')} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Company</label>
              <input {...register('company')} className="input" />
            </div>
            <div>
              <label className="label">Industry</label>
              <input {...register('industry')} className="input" placeholder="e.g. SaaS, FinTech" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Company Size</label>
              <select {...register('companySize')} className="input">
                <option value="">Select...</option>
                {COMPANY_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Company Website</label>
              <input type="url" {...register('website')} className="input" placeholder="https://" />
            </div>
          </div>
        </div>
      )}

      {/* ── Qualification ─────────────────────────────────────────────── */}
      {tab === 'qualify' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Stage</label>
              <select {...register('stage')} className="input">
                {LEAD_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Rating</label>
              <select {...register('rating')} className="input">
                {LEAD_RATINGS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Lead Source</label>
              <select {...register('source')} className="input">
                {LEAD_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Campaign</label>
              <input {...register('campaign')} className="input" placeholder="e.g. Q1-2025-Outbound" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Estimated Deal Value ($)</label>
              <input type="number" min="0" {...register('estimatedValue', { valueAsNumber: true })} className="input" />
            </div>
            <div>
              <label className="label">Confirmed Budget ($)</label>
              <input type="number" min="0" {...register('budget', { valueAsNumber: true })} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Decision Timeline</label>
            <select {...register('decisionTimeline')} className="input">
              <option value="">Unknown</option>
              {DECISION_TIMELINES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" {...register('budgetConfirmed')} className="w-4 h-4 rounded text-blue-600" />
              Budget Confirmed
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" {...register('isDecisionMaker')} className="w-4 h-4 rounded text-blue-600" />
              Decision Maker
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" {...register('doNotContact')} className="w-4 h-4 rounded text-red-500" />
              Do Not Contact
            </label>
          </div>
          <div>
            <label className="label">Next Follow-up Date</label>
            <input type="date" {...register('nextFollowUpAt')} className="input" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea {...register('notes')} className="input" rows={3} placeholder="Key context, meeting notes, next steps..." />
          </div>
        </div>
      )}

      {/* ── SaaS Details ──────────────────────────────────────────────── */}
      {tab === 'saas' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Current Solution</label>
              <input {...register('currentSolution')} className="input" placeholder="e.g. Salesforce, HubSpot" />
            </div>
            <div>
              <label className="label">Team / Seats Needed</label>
              <input type="number" min="1" {...register('teamSize', { valueAsNumber: true })} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Interested Plan</label>
              <select {...register('interestedIn')} className="input">
                <option value="">Select plan...</option>
                {PLAN_NAMES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Trial End Date</label>
              <input type="date" {...register('trialEndDate')} className="input" />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" {...register('isTechnical')} className="w-4 h-4 rounded text-blue-600" />
              Technical Buyer
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" {...register('trialStarted')} className="w-4 h-4 rounded text-blue-600" />
              Free Trial Started
            </label>
          </div>
          <div>
            <label className="label">Use Case</label>
            <input {...register('useCase')} className="input" placeholder="What do they want to use the product for?" />
          </div>
          <div>
            <label className="label">Pain Points <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input {...register('painPoints')} className="input" placeholder="e.g. No API access, expensive pricing" />
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? 'Saving...' : isEdit ? 'Update Lead' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
}
