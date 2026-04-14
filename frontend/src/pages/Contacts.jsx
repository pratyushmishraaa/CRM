import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useList, useMutate } from '../hooks/useApi';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ContactForm from '../components/forms/ContactForm';
import { BUYING_ROLES } from '../utils/constants';

export default function Contacts() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editContact, setEditContact] = useState(null);

  const { data, isLoading } = useList('contacts', { page, limit: 15, search, buyingRole: roleFilter });
  const del = useMutate('contacts', 'delete', { successMessage: 'Contact deleted' });

  const ROLE_COLORS = {
    decision_maker: 'bg-red-100 text-red-700',
    champion:       'bg-purple-100 text-purple-700',
    influencer:     'bg-blue-100 text-blue-700',
    end_user:       'bg-gray-100 text-gray-700',
    evaluator:      'bg-indigo-100 text-indigo-700',
    blocker:        'bg-orange-100 text-orange-700',
    other:          'bg-gray-100 text-gray-600',
  };

  const columns = [
    {
      key: 'name', label: 'Name',
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900">{r.firstName} {r.lastName}</p>
          <p className="text-xs text-gray-400">{r.jobTitle || '—'} {r.department ? `· ${r.department}` : ''}</p>
          <p className="text-xs text-gray-400">{r.email}</p>
        </div>
      ),
    },
    {
      key: 'buyingRole', label: 'Buying Role',
      render: (r) => {
        const role = BUYING_ROLES.find((x) => x.value === r.buyingRole);
        return <Badge label={role?.label || r.buyingRole || '—'} colorClass={ROLE_COLORS[r.buyingRole] || 'bg-gray-100 text-gray-700'} />;
      },
    },
    {
      key: 'isDecisionMaker', label: 'Decision Maker',
      render: (r) => r.isDecisionMaker
        ? <Badge label="✓ Yes" colorClass="bg-green-100 text-green-700" />
        : <span className="text-gray-300 text-xs">—</span>,
    },
    { key: 'account', label: 'Account', render: (r) => r.account?.name || '—' },
    {
      key: 'status', label: 'Status',
      render: (r) => {
        const colors = { active: 'bg-green-100 text-green-700', inactive: 'bg-gray-100 text-gray-500', bounced: 'bg-red-100 text-red-600' };
        return <Badge label={r.status || 'active'} colorClass={colors[r.status] || ''} />;
      },
    },
    {
      key: 'doNotContact', label: 'DNC',
      render: (r) => r.doNotContact ? <Badge label="DNC" colorClass="bg-red-100 text-red-700" /> : '—',
    },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => { setEditContact(r); setShowForm(true); }} className="text-blue-600 hover:underline text-xs">Edit</button>
          <button onClick={() => del.mutate({ id: r._id })} className="text-red-500 hover:underline text-xs">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9 w-52" placeholder="Search contacts..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input w-44" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            {BUYING_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <button onClick={() => { setEditContact(null); setShowForm(true); }} className="btn-primary">
          <Plus size={15} /> Add Contact
        </button>
      </div>

      <Table columns={columns} data={data?.data?.contacts || []} total={data?.meta?.total || 0}
        page={page} limit={15} onPageChange={setPage} isLoading={isLoading} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editContact ? 'Edit Contact' : 'New Contact'} size="lg">
        <ContactForm contact={editContact} onSuccess={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
