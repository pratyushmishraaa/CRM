import { useForm } from 'react-hook-form';
import { useMutate } from '../../hooks/useApi';
import { ACCOUNT_SEGMENTS } from '../../utils/constants';

const ACCOUNT_TYPES   = ['prospect', 'customer', 'churned', 'partner', 'competitor', 'vendor'];
const SUPPORT_TIERS   = ['basic', 'standard', 'premium', 'enterprise'];
const FUNDING_STAGES  = ['Bootstrapped', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Public', 'PE-backed'];

export default function AccountForm({ account, onSuccess }) {
  const isEdit = !!account;

  const { register, handleSubmit } = useForm({
    defaultValues: account || { type: 'prospect', status: 'active' },
  });

  const create = useMutate('accounts', 'post', { successMessage: 'Account created' });
  const update = useMutate('accounts', 'patch', { successMessage: 'Account updated' });

  const onSubmit = (data) => {
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    if (isEdit) update.mutateAsync({ id: account._id, data: clean }).then(onSuccess);
    else        create.mutateAsync({ data: clean }).then(onSuccess);
  };

  const pending = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Company Name *</label>
          <input {...register('name', { required: true })} className="input" />
        </div>
        <div>
          <label className="label">Account Type</label>
          <select {...register('type')} className="input">
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Industry</label>
          <input {...register('industry')} className="input" placeholder="e.g. SaaS, FinTech" />
        </div>
        <div>
          <label className="label">Segment</label>
          <select {...register('segment')} className="input">
            <option value="">Select...</option>
            {ACCOUNT_SEGMENTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Website</label>
          <input type="url" {...register('website')} className="input" placeholder="https://" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input type="tel" {...register('phone')} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" {...register('email')} className="input" />
      </div>

      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Company Metrics</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Annual Revenue ($)</label>
            <input type="number" min="0" {...register('annualRevenue', { valueAsNumber: true })} className="input" />
          </div>
          <div>
            <label className="label">Employee Count</label>
            <input type="number" min="0" {...register('employeeCount', { valueAsNumber: true })} className="input" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="label">Funding Stage</label>
            <select {...register('fundingStage')} className="input">
              <option value="">Select...</option>
              {FUNDING_STAGES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Territory</label>
            <input {...register('territory')} className="input" placeholder="e.g. APAC, EMEA, US-West" />
          </div>
        </div>
      </div>

      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer Success</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Contract Value ($)</label>
            <input type="number" min="0" {...register('contractValue', { valueAsNumber: true })} className="input" />
          </div>
          <div>
            <label className="label">Renewal Date</label>
            <input type="date" {...register('renewalDate')} className="input" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="label">Health Score (0–100)</label>
            <input type="number" min="0" max="100" {...register('healthScore', { valueAsNumber: true })} className="input" />
          </div>
          <div>
            <label className="label">NPS Score</label>
            <input type="number" min="-100" max="100" {...register('npsScore', { valueAsNumber: true })} className="input" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="label">Support Tier</label>
            <select {...register('supportTier')} className="input">
              <option value="">Select...</option>
              {SUPPORT_TIERS.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Current Solution</label>
            <input {...register('currentSolution')} className="input" placeholder="e.g. Salesforce" />
          </div>
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea {...register('notes')} className="input" rows={2} />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? 'Saving...' : isEdit ? 'Update Account' : 'Create Account'}
        </button>
      </div>
    </form>
  );
}
