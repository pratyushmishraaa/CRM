import { useState } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useList } from '../hooks/useApi';
import api from '../lib/axios';
import { DEAL_STAGES, DEAL_TYPES, FORECAST_CATEGORIES, fmt } from '../utils/constants';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import DealForm from '../components/forms/DealForm';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Deals() {
  const [view, setView] = useState('kanban');
  const [showForm, setShowForm] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [stageFilter, setStageFilter] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data: pipeline, isLoading: pipelineLoading } = useQuery({
    queryKey: ['deals-pipeline'],
    queryFn: () => api.get('/deals/pipeline').then((r) => r.data.data.pipeline),
    enabled: view === 'kanban',
  });

  const { data: listData, isLoading: listLoading } = useList('deals', { page, limit: 15, stage: stageFilter }, { enabled: view === 'list' });

  const updateStage = useMutation({
    mutationFn: ({ id, stage }) => api.patch(`/deals/${id}`, { stage }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals-pipeline'] }); toast.success('Stage updated'); },
    onError: () => toast.error('Failed to update stage'),
  });

  const onSuccess = () => {
    setShowForm(false);
    qc.invalidateQueries({ queryKey: ['deals-pipeline'] });
    qc.invalidateQueries({ queryKey: ['deals'] });
  };

  // Pipeline summary
  const totalPipelineValue = pipeline?.reduce((sum, col) => sum + (col.totalValue || 0), 0) || 0;
  const weightedValue = pipeline?.reduce((sum, col) => sum + (col.weightedValue || 0), 0) || 0;

  const listColumns = [
    { key: 'title', label: 'Deal Name', render: (r) => <span className="font-medium text-gray-900">{r.title}</span> },
    {
      key: 'stage', label: 'Stage',
      render: (r) => { const s = DEAL_STAGES.find((x) => x.value === r.stage); return s ? <Badge label={s.label} colorClass={s.color} /> : r.stage; },
    },
    {
      key: 'forecastCategory', label: 'Forecast',
      render: (r) => { const f = FORECAST_CATEGORIES.find((x) => x.value === r.forecastCategory); return f ? <Badge label={f.label} colorClass={f.color} /> : '—'; },
    },
    { key: 'value', label: 'Value', render: (r) => fmt(r.value) },
    { key: 'probability', label: 'Prob.', render: (r) => `${r.probability}%` },
    { key: 'mrr', label: 'MRR', render: (r) => r.mrr ? fmt(r.mrr) : '—' },
    { key: 'expectedCloseDate', label: 'Close Date', render: (r) => r.expectedCloseDate ? format(new Date(r.expectedCloseDate), 'MMM d, yyyy') : '—' },
    { key: 'owner', label: 'Owner', render: (r) => r.owner ? `${r.owner.firstName} ${r.owner.lastName}` : '—' },
    {
      key: 'actions', label: '',
      render: (r) => (
        <button onClick={() => { setEditDeal(r); setShowForm(true); }} className="text-blue-600 hover:underline text-xs">Edit</button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setView('kanban')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              <LayoutGrid size={14} /> Kanban
            </button>
            <button onClick={() => setView('list')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              <List size={14} /> List
            </button>
          </div>
          {view === 'list' && (
            <select className="input w-40" value={stageFilter} onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}>
              <option value="">All Stages</option>
              {DEAL_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          )}
        </div>
        <button onClick={() => { setEditDeal(null); setShowForm(true); }} className="btn-primary">
          <Plus size={15} /> New Deal
        </button>
      </div>

      {/* Pipeline summary bar */}
      {view === 'kanban' && pipeline && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card py-3 px-4">
            <p className="text-xs text-gray-500">Total Pipeline</p>
            <p className="text-lg font-bold text-gray-900">{fmt(totalPipelineValue)}</p>
          </div>
          <div className="card py-3 px-4">
            <p className="text-xs text-gray-500">Weighted Pipeline</p>
            <p className="text-lg font-bold text-blue-600">{fmt(weightedValue)}</p>
          </div>
          <div className="card py-3 px-4">
            <p className="text-xs text-gray-500">Open Deals</p>
            <p className="text-lg font-bold text-gray-900">{pipeline.filter((p) => !['closed_won','closed_lost'].includes(p._id)).reduce((s, p) => s + p.count, 0)}</p>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {DEAL_STAGES.map((stage) => {
            const col = pipeline?.find((p) => p._id === stage.value);
            return (
              <div key={stage.value} className="flex-shrink-0 w-64">
                <div className="flex items-center justify-between mb-2">
                  <Badge label={stage.label} colorClass={stage.color} />
                  <span className="text-xs text-gray-400">{col?.count || 0}</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{fmt(col?.totalValue || 0)}</p>
                <div className="space-y-2 min-h-[80px]">
                  {col?.deals?.map((deal) => (
                    <div key={deal._id}
                      className="card p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-200"
                      onClick={() => { setEditDeal({ ...deal, stage: stage.value }); setShowForm(true); }}>
                      <p className="text-sm font-medium text-gray-800 truncate">{deal.title}</p>
                      <p className="text-xs text-gray-500 mt-1 font-semibold">{fmt(deal.value)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{deal.probability}% close</span>
                        <div className="flex gap-1">
                          {DEAL_STAGES.filter((s) => s.value !== stage.value && !['closed_won','closed_lost'].includes(s.value)).slice(0, 1).map((s) => (
                            <button key={s.value}
                              onClick={(e) => { e.stopPropagation(); updateStage.mutate({ id: deal._id, stage: s.value }); }}
                              className="text-xs text-gray-400 hover:text-blue-600 px-1 border border-gray-200 rounded"
                              title={`Move to ${s.label}`}>
                              → {s.label.slice(0, 5)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <Table columns={listColumns} data={listData?.data?.deals || []} total={listData?.meta?.total || 0}
          page={page} limit={15} onPageChange={setPage} isLoading={listLoading} />
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}
        title={editDeal ? 'Edit Deal' : 'New Deal'} size="lg">
        <DealForm deal={editDeal} onSuccess={onSuccess} />
      </Modal>
    </div>
  );
}
