import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutate } from '../../hooks/useApi';
import { DEAL_STAGES, DEAL_TYPES, PLAN_NAMES, BILLING_CYCLES, FORECAST_CATEGORIES } from '../../utils/constants';

const TABS = [
  { id: 'basic',       label: 'Deal Info' },
  { id: 'saas',        label: 'SaaS Details' },
  { id: 'competitive', label: 'Competitive' },
];

export default function DealForm({ deal, onSuccess }) {
  const isEdit = !!deal;
  const [tab, setTab] = useState('basic');

  const { register, handleSubmit, watch } = useForm({
    defaultValues: deal
      ? { ...deal, expectedCloseDate: deal.expectedCloseDate?.split('T')[0] }
      : { stage: 'prospecting', forecastCategory: 'pipeline', probability: 10, currency: 'USD', dealType: 'new_business', billingCycle: 'annual' },
  });

  const create = useMutate('deals', 'post', { successMessage: 'Deal created' });
  const update = useMutate('deals', 'patch', { successMessage: 'Deal updated' });

  const onSubmit = (data) => {
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    if (isEdit) update.mutateAsync({ id: deal._id, data: clean }).then(onSuccess);
    else        create.mutateAsync({ data: clean }).then(onSuccess);
  };

  const pending = create.isPending || update.isPending;
  const mrr = watch('mrr');

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

      {/* ── Deal Info ─────────────────────────────────────────────────── */}
      {tab === 'basic' && (
        <div className="space-y-3">
          <div>
            <label className="label">Deal Name *</label>
            <input {...register('title', { required: true })} className="input" placeholder="e.g. Acme Corp — Enterprise License" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Deal Type</label>
              <select {...register('dealType')} className="input">
                {DEAL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Stage</label>
              <select {...register('stage')} className="input">
                {DEAL_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Forecast Category</label>
              <select {...register('forecastCategory')} className="input">
                {FORECAST_CATEGORIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Close Probability (%)</label>
              <input type="number" min="0" max="100" {...register('probability', { valueAsNumber: true })} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Total Contract Value ($) *</label>
              <input type="number" min="0" {...register('value', { required: true, valueAsNumber: true })} className="input" />
            </div>
            <div>
              <label className="label">Currency</label>
              <select {...register('currency')} className="input">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Expected Close Date</label>
            <input type="date" {...register('expectedCloseDate')} className="input" />
          </div>
          <div>
            <label className="label">Next Step</label>
            <input {...register('nextStep')} className="input" placeholder="e.g. Send contract by Friday" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} className="input" rows={2} />
          </div>
        </div>
      )}

      {/* ── SaaS Details ──────────────────────────────────────────────── */}
      {tab === 'saas' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Plan Name</label>
              <select {...register('planName')} className="input">
                <option value="">Select plan...</option>
                {PLAN_NAMES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Billing Cycle</label>
              <select {...register('billingCycle')} className="input">
                {BILLING_CYCLES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Seats / Users</label>
              <input type="number" min="1" {...register('seats', { valueAsNumber: true })} className="input" />
            </div>
            <div>
              <label className="label">Contract Length (months)</label>
              <input type="number" min="1" {...register('contractLength', { valueAsNumber: true })} className="input" placeholder="12" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">MRR ($)</label>
              <input type="number" min="0" {...register('mrr', { valueAsNumber: true })} className="input" />
            </div>
            <div>
              <label className="label">
                ARR ($) {mrr > 0 && <span className="text-gray-400 font-normal text-xs">(auto: ${(mrr * 12).toLocaleString()})</span>}
              </label>
              <input type="number" min="0" {...register('arr', { valueAsNumber: true })} className="input" placeholder="Auto from MRR × 12" />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" {...register('contractSigned')} className="w-4 h-4 rounded text-blue-600" />
              Contract Signed
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" {...register('requiresIntegration')} className="w-4 h-4 rounded text-blue-600" />
              Requires Integration
            </label>
          </div>
          <div>
            <label className="label">Integration Details</label>
            <input {...register('integrationDetails')} className="input" placeholder="e.g. Salesforce, Slack, SSO/SAML" />
          </div>
        </div>
      )}

      {/* ── Competitive ───────────────────────────────────────────────── */}
      {tab === 'competitive' && (
        <div className="space-y-3">
          <div>
            <label className="label">Competitor Being Replaced</label>
            <input {...register('competitorReplaced')} className="input" placeholder="e.g. Salesforce, HubSpot" />
          </div>
          <div>
            <label className="label">Other Competitors <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input {...register('competitors')} className="input" placeholder="e.g. Outreach, Gong" />
          </div>
          <div>
            <label className="label">Lost Reason <span className="text-gray-400 font-normal">(if closed lost)</span></label>
            <select {...register('lostReason')} className="input">
              <option value="">Select reason...</option>
              <option value="price">Price / Budget</option>
              <option value="competitor">Chose Competitor</option>
              <option value="no_decision">No Decision / Status Quo</option>
              <option value="timing">Bad Timing</option>
              <option value="missing_feature">Missing Feature</option>
              <option value="champion_left">Champion Left Company</option>
              <option value="security">Security / Compliance</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Lost To Competitor</label>
            <input {...register('lostToCompetitor')} className="input" placeholder="Which competitor won?" />
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? 'Saving...' : isEdit ? 'Update Deal' : 'Create Deal'}
        </button>
      </div>
    </form>
  );
}
