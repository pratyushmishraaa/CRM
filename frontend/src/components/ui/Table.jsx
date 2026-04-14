export default function Table({ columns, data = [], total = 0, page = 1, limit = 10, onPageChange, isLoading }) {
  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return (
      <div className="card animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded" />)}
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400 text-sm">No records found</td></tr>
            ) : (
              data.map((row, i) => (
                <tr key={row._id || i} className="hover:bg-gray-50 transition-colors">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-gray-700">
                      {c.render ? c.render(row) : row[c.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Prev</button>
            <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
