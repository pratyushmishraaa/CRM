import { useState } from 'react';
import { useList } from '../hooks/useApi';
import Table from '../components/ui/Table';
import { format } from 'date-fns';

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useList('audit-logs', { page, limit: 50 });

  const columns = [
    { key: 'user', label: 'User', render: (r) => r.userId ? `${r.userId.firstName} ${r.userId.lastName}` : 'System' },
    { key: 'action', label: 'Action', render: (r) => <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{r.action}</code> },
    { key: 'resource', label: 'Resource' },
    { key: 'ipAddress', label: 'IP' },
    { key: 'createdAt', label: 'Time', render: (r) => format(new Date(r.createdAt), 'MMM d, HH:mm') },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Immutable record of all user actions in your organization.</p>
      <Table columns={columns} data={data?.data?.logs || []} total={data?.meta?.total || 0}
        page={page} limit={50} onPageChange={setPage} isLoading={isLoading} />
    </div>
  );
}
