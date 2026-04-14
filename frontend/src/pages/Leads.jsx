import { useState } from 'react';
import { Plus, Search, Bot, Filter } from 'lucide-react';
import { useList, useMutate } from '../hooks/useApi';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import LeadForm from '../components/forms/LeadForm';
import AIEmailModal from '../components/ai/AIEmailModal';
import { LEAD_STAGES, LEAD_RATINGS, LEAD_SOURCES } from '../utils/constants';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';

export default function Leads() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [rating, setRating] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [aiLead, setAiLead] = useState(null);

  const { data, isLoading } = useList('leads', { page, limit: 15, search, stage, rating });
  const del = useMutate('leads', 'delete', { successMessage: 'Lead deleted' });
  const canDelete = user?.role !== 'sales';

  const columns = [
    {
      key: 'name', label: 'Name / Company',
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900">{r.firstName} {r.lastName}</p>
          <p className="text-xs text-gray-400">{r.company || '—'} {r.jobTitle ? `· ${r.jobTitle}` : ''}</p>
          <p className="text-xs text-gray-400">{r.email}</p>
        </div>
      ),
    },
    {
      key: 'stage', label: 'Stage',
      render: (r) => {
        const s = LEAD_STAGES.find((x) => x.value === r.stage);
        return s ? <Badge label={s.label} colorClass={s.color} /> : r.stage;
      },
    },
    {
      key: 'rating', label: 'Rating',
      render: (r) => {
        const rt = LEAD_RATINGS.find((x) => x.value === r.rating);
        return rt ? <Badge label={rt.label} colorClass={rt.color} /> : '—';
      },
    },
    {
      key: 'source', label: 'Source',
      render: (r) => {
        const s = LEAD_SOURCES.find((x) => x.value === r.source);
        return <span className="text-xs text-gray-600">{s?.label || r.source || '—'}</span>;
      },
    },
    {
      key: 'estimatedValue', label: 'Est. Value',
      render: (r) => r.estimatedValue ? `$${r.estimatedValue.toLocaleString()}` : '—',
    },
    {
      key: 'aiScore', label: 'AI Score',
      render: (r) => r.aiScore != null ? (
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${r.aiScore >= 70 ? 'bg-green-500' : r.aiScore >= 40 ? 'bg-yellow-500' : 'bg-red-400'}`} />
          <span className={`font-semibold text-sm ${r.aiScore >= 70 ? 'text-green-600' : r.aiScore >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
            {r.aiScore}
          </span>
        </div>
      ) : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: 'assignedTo', label: 'Owner',
      render: (r) => r.assignedTo ? `${r.assignedTo.firstName} ${r.assignedTo.lastName}` : '—',
    },
    {
      key: 'createdAt', label: 'Created',
      render: (r) => format(new Date(r.createdAt), 'MMM d, yyyy'),
    },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div className="flex gap-2 whitespace-nowrap">
          <button onClick={() => setAiLead(r)} className="text-purple-600 hover:underline text-xs flex items-center gap-1">
            <Bot size={12} /> AI Email
          </button>
          <button onClick={() => { setEditLead(r); setShowForm(true); }} className="text-blue-600 hover:underline text-xs">Edit</button>
          {canDelete && (
            <button onClick={() => del.mutate({ id: r._id })} className="text-red-500 hover:underline text-xs">Delete</button>
          )}
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
            <input className="input pl-9 w-52" placeholder="Search leads..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input w-40" value={stage} onChange={(e) => { setStage(e.target.value); setPage(1); }}>
            <option value="">All Stages</option>
            {LEAD_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="input w-32" value={rating} onChange={(e) => { setRating(e.target.value); setPage(1); }}>
            <option value="">All Ratings</option>
            {LEAD_RATINGS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <button onClick={() => { setEditLead(null); setShowForm(true); }} className="btn-primary">
          <Plus size={15} /> Add Lead
        </button>
      </div>

      <Table columns={columns} data={data?.data?.leads || []} total={data?.meta?.total || 0}
        page={page} limit={15} onPageChange={setPage} isLoading={isLoading} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}
        title={editLead ? 'Edit Lead' : 'New Lead'} size="lg">
        <LeadForm lead={editLead} onSuccess={() => setShowForm(false)} />
      </Modal>

      {aiLead && <AIEmailModal lead={aiLead} onClose={() => setAiLead(null)} />}
    </div>
  );
}
