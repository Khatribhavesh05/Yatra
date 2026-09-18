import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../api/auditLogs';
import { QUERY_KEYS } from '../utils/constants';
import { formatDateTime } from '../utils/formatters';
import PageHeader from '../components/common/PageHeader';
import { SearchInput } from '../components/common/FilterControls';
import { EmptyState, ErrorState } from '../components/common/FeedbackStates';

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QUERY_KEYS.AUDIT_LOGS, 200, 0],
    queryFn: () => getAuditLogs(200, 0),
  });

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Audit Logs"
        message="Could not retrieve administrative system activity log."
        onRetry={refetch}
      />
    );
  }

  const logs = data ?? [];

  const filteredLogs = logs.filter(
    (log: any) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.object_type && log.object_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administrative Security & Audit Log"
        subtitle="Immutable state operations record tracking officer logins, role changes, and alerts."
        badgeText="IMMUTABLE AUDIT"
      />

      {/* Toolbar */}
      <div className="yatra-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Filter by action or object..."
          className="w-full sm:w-80"
        />

        <div className="text-xs font-semibold text-slate-500">
          Logged Entries: <span className="font-bold text-slate-900">{filteredLogs.length}</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="yatra-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor ID</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Object</th>
                <th className="py-3 px-4">Target ID</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4 bg-slate-50/50" />
                  </tr>
                ))
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 text-[11px] font-mono whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                      {log.actor_id ? log.actor_id.slice(0, 10) + '...' : 'System'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-teal-800 border border-slate-200 rounded font-mono font-bold text-[11px] uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.object_type}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {log.object_id ? log.object_id.slice(0, 10) + '...' : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.reason || ''}>
                      {log.reason || 'Standard operational log'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8">
                    <EmptyState
                      title="No Audit Logs Found"
                      description="No administrative activity matches your current filter."
                      icon="history_toggle_off"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
