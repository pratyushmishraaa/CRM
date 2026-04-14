import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useList, useMutate } from '../hooks/useApi';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import UserForm from '../components/forms/UserForm';
import { format } from 'date-fns';

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-700',
  manager: 'bg-blue-100 text-blue-700',
  sales: 'bg-green-100 text-green-700',
};

export default function Users() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const { data, isLoading } = useList('users', { page, limit: 10 });
  const del = useMutate('users', 'delete', { successMessage: 'User deleted' });

  const columns = [
    {
      key: 'name', label: 'Name',
      render: (r) => (
        <div>
          <p className="font-medium">{r.firstName} {r.lastName}</p>
          <p className="text-xs text-gray-400">{r.email}</p>
        </div>
      ),
    },
    { key: 'role', label: 'Role', render: (r) => <Badge label={r.role} colorClass={ROLE_COLORS[r.role] || ''} /> },
    {
      key: 'isActive', label: 'Status',
      render: (r) => <Badge label={r.isActive ? 'Active' : 'Inactive'} colorClass={r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} />,
    },
    { key: 'lastLogin', label: 'Last Login', render: (r) => r.lastLogin ? format(new Date(r.lastLogin), 'MMM d, yyyy') : 'Never' },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => { setEditUser(r); setShowForm(true); }} className="text-primary-600 hover:underline text-xs">Edit</button>
          <button onClick={() => del.mutate({ id: r._id })} className="text-red-500 hover:underline text-xs">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setEditUser(null); setShowForm(true); }} className="btn-primary">
          <Plus size={15} /> Add User
        </button>
      </div>
      <Table columns={columns} data={data?.data?.users || []} total={data?.meta?.total || 0}
        page={page} limit={10} onPageChange={setPage} isLoading={isLoading} />
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editUser ? 'Edit User' : 'New User'}>
        <UserForm user={editUser} onSuccess={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
