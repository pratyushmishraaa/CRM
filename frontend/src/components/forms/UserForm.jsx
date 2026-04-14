import { useForm } from 'react-hook-form';
import { useMutate } from '../../hooks/useApi';
import { ROLES } from '../../utils/constants';

export default function UserForm({ user, onSuccess }) {
  const isEdit = !!user;
  const { register, handleSubmit } = useForm({ defaultValues: user || { role: 'sales' } });

  const create = useMutate('users', 'post', { successMessage: 'User created' });
  const update = useMutate('users', 'patch', { successMessage: 'User updated' });

  const onSubmit = async (data) => {
    if (isEdit) await update.mutateAsync({ id: user._id, data });
    else await create.mutateAsync({ data });
    onSuccess();
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
        <label className="label">Email *</label>
        <input type="email" {...register('email', { required: true })} className="input" />
      </div>
      {!isEdit && (
        <div>
          <label className="label">Password *</label>
          <input type="password" {...register('password', { required: !isEdit })} className="input" />
        </div>
      )}
      <div>
        <label className="label">Role</label>
        <select {...register('role')} className="input">
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
}
