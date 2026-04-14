import { useState } from 'react';
import { Plus, Search, Building2 } from 'lucide-react';
import { useList, useMutate } from '../hooks/useApi';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import AccountForm from '../components/forms/AccountForm';
import { ACCOUNT_SEGMENTS, fmt } from '../utils/constants';
import { format } from 'date-fns';

const TYPE_COLORS = {
  prospect:   'bg-blue-100 text-blue-700',
  customer:   'bg-green-100 text-green-700',
  churned:    'bg-red-100 text-red-700',
  partner:    'bg-purple-100 text-purple-700',
  competitor: 'bg-orange-100 text-orange-700',
  vendor:     'bg-gray-100 text-gray-700',
};

export default function Accounts() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editAccount, setEditAccount] = useState(null);

  const { data, isLoading } = useList('accounts', { page, limit: 15, search, type: typeFilter, segment: segmentFilter });
  const del = useMutate('accounts', 'delete', { successMessage: 'Account deleted' });

  const columns = [
    {
      key: 'name', label: 'Company',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 size={14} className="text-gray-500" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{r.name}</p>
            <p className="text-xs text-gray-400">{r.industry || '—'} {r.territory ? `· ${r.territory}` : ''}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type', label: 'Type',
      render: (r) => <Badge label={r.type} colorClass={TYPE_COLORS[r.type] || 'bg-gray-100 text-gray-700'} />,
    },
    {
      key: 'segment', label: 'Segment',
      render: (r) => {
        const s = ACCOUNT_SEGMENTS.find((x) => x.value === r.segment);
        return s ? <Badge label={s.label} colorClass="bg-gray-100 text-gray-700" /> : '—';
      },
    },
    { key: 'annualRevenue', label: 'ARR', render: (r) => r.annualRevenue ? fmt(r.annualRevenue) : '—' },
    { key: 'employeeCount', label: 'Employees', render: (r) => r.employeeCount?.toLocaleString() || '—' },
    {
      key: 'healthScore', label: 'Health',
      render: (r) => r.healthScore != null ? (
        <div className="flex items-center gap-1.5">
          <div className="w-16 bg-gray-200 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${r.healthScore >= 70 ? 'bg-green-500' : r.healthScore >= 40 ? 'bg-yellow-500' : 'bg-red-400'}`}
              style={{ width: `${r.healthScore}%` }} />
          </div>
          <span className="text-xs text-gray-600">{r.healthScore}</span>
        </div>
      ) : '—',
    },
    {
      key: 'renewalDate', label: 'Renewal',
      render: (r) => {
        if (!r.renewalDate) return '—';
        const d = new Date(r.renewalDate);
        const daysLeft = Math.ceil((d - new Date()) / 86400000);
        return (
          <span className={`text-xs ${daysLeft <= 30 ? 'text-red-600 font-medium' : daysLeft <= 90 ? 'text-orange-600' : 'text-gray-600'}`}>
            {format(d, 'MMM d, yyyy')}
            {daysLeft <= 90 && ` (${daysLeft}d)`}
          </span>
        );
      },
    },
    { key: 'owner', label: 'Owner', render: (r) => r.owner ? `${r.owner.firstName} ${r.owner.lastName}` : '—' },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => { setEditAccount(r); setShowForm(true); }} className="text-blue-600 hover:underline text-xs">Edit</button>
          <button onClick={() => del.mutate({ id: r._id })} className="text-red-500 hover:underline text-xs">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9 w-52" placeholder="Search accounts..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input w-36" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            {['prospect','customer','churned','partner','competitor','vendor'].map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <select className="input w-36" value={segmentFilter} onChange={(e) => { setSegmentFilter(e.target.value); setPage(1); }}>
            <option value="">All Segments</option>
            {ACCOUNT_SEGMENTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <button onClick={() => { setEditAccount(null); setShowForm(true); }} className="btn-primary">
          <Plus size={15} /> Add Account
        </button>
      </div>

      <Table columns={columns} data={data?.data?.accounts || []} total={data?.meta?.total || 0}
        page={page} limit={15} onPageChange={setPage} isLoading={isLoading} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editAccount ? 'Edit Account' : 'New Account'} size="lg">
        <AccountForm account={editAccount} onSuccess={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
