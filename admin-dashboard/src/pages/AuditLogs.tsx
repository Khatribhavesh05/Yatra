import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { getAuditLogs } from '../api/auditLogs';
import { QUERY_KEYS } from '../utils/constants';
import { formatDateTime } from '../utils/formatters';

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.AUDIT_LOGS, 200, 0],
    queryFn: () => getAuditLogs(200, 0),
  });

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-urja-text-secondary">Loading audit logs...</div>;
  }

  if (error) {
    return <div className="flex h-64 items-center justify-center text-urja-danger">Failed to load audit logs</div>;
  }

  const logs = data ?? [];
  
  const filteredLogs = logs.filter((log: any) => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-urja-text">Audit Logs</h1>
          <p className="text-sm text-urja-text-secondary mt-1">System-wide activity log (read-only)</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-urja-text-muted" />
          <input
            type="text"
            placeholder="Filter by action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 bg-urja-surface border border-urja-green-border rounded-lg py-2 pl-9 pr-4 text-sm text-urja-text placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-urja-primary/50"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-urja-border bg-urja-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-urja-text-secondary">
            <thead className="bg-urja-pale text-urja-text-secondary">
              <tr>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Timestamp</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Actor</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Action</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Object Type</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Object ID</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Reason</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-urja-border">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-urja-text-muted">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-urja-pale/20 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-urja-text-secondary whitespace-nowrap">
                      {log.actor_id ? `${log.actor_id.substring(0, 8)}...` : 'System'}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="bg-urja-pale rounded px-2 py-0.5 text-xs font-mono text-urja-primary">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-urja-text">
                      {log.object_type}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-urja-text-secondary whitespace-nowrap">
                      {log.object_id ? `${log.object_id.substring(0, 8)}...` : '—'}
                    </td>
                    <td className="px-6 py-3 max-w-xs truncate" title={log.reason || ''}>
                      {log.reason || '—'}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-urja-text-muted whitespace-nowrap">
                      {log.ip_address || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
