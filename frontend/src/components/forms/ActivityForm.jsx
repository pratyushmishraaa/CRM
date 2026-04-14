import { useForm } from 'react-hook-form';
import { useMutate } from '../../hooks/useApi';
import { ACTIVITY_TYPES } from '../../utils/constants';

export default function ActivityForm({ activity, onSuccess }) {
  const isEdit = !!activity;

  const { register, handleSubmit, watch } = useForm({
    defaultValues: activity || {
      type: 'call', status: 'completed', priority: 'medium',
      relatedTo: { model: 'Lead' },
    },
  });

  const create = useMutate('activities', 'post', { successMessage: 'Activity logged' });
  const update = useMutate('activities', 'patch', { successMessage: 'Activity updated' });

  const onSubmit = (data) => {
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    if (isEdit) update.mutateAsync({ id: activity._id, data: clean }).then(onSuccess);
    else        create.mutateAsync({ data: clean }).then(onSuccess);
  };

  const pending = create.isPending || update.isPending;
  const type = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="label">Title *</label>
        <input {...register('title', { required: true })} className="input" placeholder="e.g. Discovery call with Alice Johnson" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Activity Type</label>
          <select {...register('type')} className="input">
            {ACTIVITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select {...register('status')} className="input">
            <option value="completed">Completed</option>
            <option value="scheduled">Scheduled</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Priority</label>
          <select {...register('priority')} className="input">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label className="label">Duration (minutes)</label>
          <input type="number" min="1" {...register('duration', { valueAsNumber: true })} className="input" placeholder="30" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Scheduled At</label>
          <input type="datetime-local" {...register('scheduledAt')} className="input" />
        </div>
        <div>
          <label className="label">Due Date <span className="text-gray-400 font-normal">(tasks)</span></label>
          <input type="date" {...register('dueDate')} className="input" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Related To</label>
          <select {...register('relatedTo.model')} className="input">
            <option value="Lead">Lead</option>
            <option value="Deal">Deal</option>
            <option value="Contact">Contact</option>
            <option value="Account">Account</option>
          </select>
        </div>
        <div>
          <label className="label">Record ID</label>
          <input {...register('relatedTo.id')} className="input" placeholder="MongoDB ObjectId" />
        </div>
      </div>

      {/* Call-specific */}
      {type === 'call' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Call Direction</label>
            <select {...register('callDirection')} className="input">
              <option value="">Select...</option>
              <option value="outbound">Outbound</option>
              <option value="inbound">Inbound</option>
            </select>
          </div>
          <div>
            <label className="label">Call Disposition</label>
            <select {...register('callDisposition')} className="input">
              <option value="">Select...</option>
              <option value="connected">Connected</option>
              <option value="left_voicemail">Left Voicemail</option>
              <option value="no_answer">No Answer</option>
              <option value="busy">Busy</option>
              <option value="wrong_number">Wrong Number</option>
            </select>
          </div>
        </div>
      )}

      {/* Email-specific */}
      {type === 'email' && (
        <div>
          <label className="label">Email Subject</label>
          <input {...register('emailSubject')} className="input" />
        </div>
      )}

      {/* Meeting-specific */}
      {type === 'meeting' && (
        <div>
          <label className="label">Location / Meeting Link</label>
          <input {...register('location')} className="input" placeholder="e.g. Zoom link, office address" />
        </div>
      )}

      <div>
        <label className="label">Outcome / Summary</label>
        <textarea {...register('outcome')} className="input" rows={2} placeholder="What happened? Key takeaways..." />
      </div>
      <div>
        <label className="label">Next Step</label>
        <input {...register('nextStep')} className="input" placeholder="e.g. Send proposal by Monday" />
      </div>

      {(type === 'call' || type === 'meeting' || type === 'demo') && (
        <div>
          <label className="label">
            Transcript <span className="text-gray-400 font-normal">(optional — triggers AI sentiment analysis)</span>
          </label>
          <textarea {...register('transcript')} className="input" rows={4} placeholder="Paste transcript..." />
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? 'Saving...' : isEdit ? 'Update Activity' : 'Log Activity'}
        </button>
      </div>
    </form>
  );
}
