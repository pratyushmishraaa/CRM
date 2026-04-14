import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useList, useMutate } from '../hooks/useApi';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ActivityForm from '../components/forms/ActivityForm';
import { ACTIVITY_TYPES } from '../utils/constants';
import { format } from 'date-fns';

const SENTIMENT_COLORS = {
  positive: 'bg-green-100 text-green-700',
  neutral:  'bg-gray-100 text-gray-600',
  negative: 'bg-red-100 text-red-700',
};

const STATUS_COLORS = {
  completed:  'bg-green-100 text-green-700',
  scheduled:  'bg-blue-100 text-blue-700',
  cancelled:  'bg-gray-100 text-gray-500',
  no_show:    'bg-red-100 text-red-600',
};

const TYPE_COLORS = Object.fromEntries(ACTIVITY_TYPES.map((t) => [t.value, t.color]));

export default function Activities() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editActivity, setEditActivity] = useState(null);

  const { data, isLoading } = useList('activities', { page, limit: 15, type: typeFilter, status: statusFilter });
  const del = useMutate('activities', 'delete', { successMessage: 'Activity deleted' });

  const columns = [
    {
      key: 'type', label: 'Type',
      render: (r) => {
        const t = ACTIVITY_TYPES.find((a) => a.value === r.type);
        return <Badge label={t?.label || r.type} colorClass={TYPE_COLORS[r.type] || 'bg-gray-100 text-gray-700'} />;
      },
    },
    {
      key: 'title', label: 'Activity',
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900">{r.title}</p>
          {r.nextStep && <p className="text-xs text-blue-600 mt-0.5">→ {r.nextStep}</p>}
        </div>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: (r) => <Badge label={r.status || 'completed'} colorClass={STATUS_COLORS[r.status] || ''} />,
    },
    {
      key: 'sentiment', label: 'Sentiment',
      render: (r) => r.sentiment
        ? <Badge label={r.sentiment} colorClass={SENTIMENT_COLORS[r.sentiment] || ''} />
        : <span className="text-gray-300 text-xs">—</span>,
    },
    { key: 'duration', label: 'Duration', render: (r) => r.duration ? `${r.duration} min` : '—' },
    { key: 'createdBy', label: 'By', render: (r) => r.createdBy ? `${r.createdBy.firstName} ${r.createdBy.lastName}` : '—' },
    {
      key: 'createdAt', label: 'Date',
      render: (r) => format(new Date(r.createdAt), 'MMM d, yyyy'),
    },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => { setEditActivity(r); setShowForm(true); }} className="text-blue-600 hover:underline text-xs">Edit</button>
          <button onClick={() => del.mutate({ id: r._id })} className="text-red-500 hover:underline text-xs">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          <select className="input w-40" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            {ACTIVITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select className="input w-36" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="scheduled">Scheduled</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
        <button onClick={() => { setEditActivity(null); setShowForm(true); }} className="btn-primary">
          <Plus size={15} /> Log Activity
        </button>
      </div>

      <Table columns={columns} data={data?.data?.activities || []} total={data?.meta?.total || 0}
        page={page} limit={15} onPageChange={setPage} isLoading={isLoading} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}
        title={editActivity ? 'Edit Activity' : 'Log Activity'} size="lg">
        <ActivityForm activity={editActivity} onSuccess={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
