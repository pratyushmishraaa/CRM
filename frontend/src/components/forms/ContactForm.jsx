import { useForm } from 'react-hook-form';
import { useMutate } from '../../hooks/useApi';
import { BUYING_ROLES, SENIORITY_LEVELS } from '../../utils/constants';

export default function ContactForm({ contact, onSuccess }) {
  const isEdit = !!contact;

  const { register, handleSubmit } = useForm({
    defaultValues: contact || { buyingRole: 'other', status: 'active', preferredContact: 'email' },
  });

  const create = useMutate('contacts', 'post', { successMessage: 'Contact created' });
  const update = useMutate('contacts', 'patch', { successMessage: 'Contact updated' });

  const onSubmit = (data) => {
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    if (isEdit) update.mutateAsync({ id: contact._id, data: clean }).then(onSuccess);
    else        create.mutateAsync({ data: clean }).then(onSuccess);
  };

  const pending = create.isPending || update.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
          <label className="label">Seniority Level</label>
          <select {...register('seniority')} className="input">
            <option value="">Select...</option>
            {SENIORITY_LEVELS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Role in Buying Process</label>
          <select {...register('buyingRole')} className="input">
            {BUYING_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Preferred Contact Method</label>
        <select {...register('preferredContact')} className="input">
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="linkedin">LinkedIn</option>
          <option value="any">Any</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-4 pt-1">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" {...register('isDecisionMaker')} className="w-4 h-4 rounded text-blue-600" />
          Decision Maker
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" {...register('productUser')} className="w-4 h-4 rounded text-blue-600" />
          Product User
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" {...register('doNotContact')} className="w-4 h-4 rounded text-red-500" />
          Do Not Contact
        </label>
      </div>
      <div>
        <label className="label">Tech Stack <span className="text-gray-400 font-normal">(comma separated)</span></label>
        <input {...register('techStack')} className="input" placeholder="e.g. Salesforce, AWS, React" />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea {...register('notes')} className="input" rows={2} />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? 'Saving...' : isEdit ? 'Update Contact' : 'Create Contact'}
        </button>
      </div>
    </form>
  );
}
