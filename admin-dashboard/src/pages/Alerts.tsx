import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAlerts, acknowledgeAlert } from '../api/alerts';
import { AlertTypeLabels, AlertSeverities, AlertStatuses } from '../types/enums';
import { formatRelativeTime } from '../utils/formatters';
import { QUERY_KEYS } from '../utils/constants';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

const severityColors: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-blue-500 text-white',
  info: 'bg-slate-500 text-white',
};

const statusColors: Record<string, string> = {
  active: 'bg-urja-danger/10 text-urja-danger border border-red-500/30',
  acknowledged: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30',
  resolved: 'bg-emerald-500/20 text-urja-success border border-urja-success/20',
  expired: 'bg-slate-500/20 text-urja-text-secondary border border-slate-500/30',
};

export default function Alerts() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [acknowledgeModalOpen, setAcknowledgeModalOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.ALERTS, statusFilter !== 'ALL' ? statusFilter : undefined],
    queryFn: () => getAlerts(statusFilter !== 'ALL' ? statusFilter : undefined, 200, 0),
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (data: { id: string; note: string }) => acknowledgeAlert(data.id, { resolution_note: data.note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS });
      closeAcknowledgeModal();
    },
  });

  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter !== 'ALL' && alert.severity !== severityFilter) return false;
    if (typeFilter !== 'ALL' && alert.alert_type !== typeFilter) return false;
    return true;
  });

  const activeCount = alerts.filter((a) => a.status === AlertStatuses.ACTIVE).length;

  const openAcknowledgeModal = (id: string) => {
    setSelectedAlertId(id);
    setAcknowledgeModalOpen(true);
  };

  const closeAcknowledgeModal = () => {
    setSelectedAlertId(null);
    setResolutionNote('');
    setAcknowledgeModalOpen(false);
  };

  const handleAcknowledge = () => {
    if (selectedAlertId) {
      acknowledgeMutation.mutate({ id: selectedAlertId, note: resolutionNote });
    }
  };

  const statusTabs = ['ALL', AlertStatuses.ACTIVE, AlertStatuses.ACKNOWLEDGED, AlertStatuses.RESOLVED];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-urja-text">Alert Center</h1>
          {activeCount > 0 && (
            <span className="px-3 py-1 bg-urja-danger/10 text-urja-danger rounded-full text-sm font-medium border border-red-500/30 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {activeCount} Active
            </span>
          )}
        </div>
      </div>

      <div className="bg-urja-surface rounded-2xl border border-urja-border p-4 flex flex-wrap gap-4 items-center">
        <div className="flex rounded-lg overflow-hidden border border-urja-green-border">
          {statusTabs.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${
                statusFilter === status ? 'bg-slate-700 text-urja-text' : 'bg-urja-pale text-urja-text-secondary hover:bg-slate-700/50 hover:text-urja-text'
              }`}
            >
              {status === 'ALL' ? 'All' : status}
            </button>
          ))}
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-urja-pale border border-urja-green-border text-urja-text rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">All Severities</option>
          <option value={AlertSeverities.CRITICAL}>Critical</option>
          <option value={AlertSeverities.HIGH}>High</option>
          <option value={AlertSeverities.MEDIUM}>Medium</option>
          <option value={AlertSeverities.LOW}>Low</option>
          <option value={AlertSeverities.INFO}>Info</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-urja-pale border border-urja-green-border text-urja-text rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">All Alert Types</option>
          {Object.entries(AlertTypeLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-urja-pale border-b border-urja-green-border/50 text-urja-text-secondary text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-medium">Severity</th>
                <th className="p-4 font-medium">Alert Type</th>
                <th className="p-4 font-medium">Vehicle</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">First Seen</th>
                <th className="p-4 font-medium">Last Seen</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-urja-text-secondary">
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-urja-text-muted">Loading alerts...</td></tr>
              ) : filteredAlerts.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-urja-text-muted">No alerts found matching filters.</td></tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-urja-pale/30 transition-colors">
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${severityColors[alert.severity] || 'bg-slate-600 text-white'}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-urja-text">{AlertTypeLabels[alert.alert_type] || alert.alert_type}</td>
                    <td className="p-4 text-urja-text-secondary font-mono text-xs" title={alert.vehicle_id}>
                      {alert.vehicle_id.substring(0, 8)}...
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[alert.status] || 'bg-urja-pale text-urja-text-secondary'}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="p-4 text-urja-text-secondary">{formatRelativeTime(alert.first_seen)}</td>
                    <td className="p-4 text-urja-text-secondary">{formatRelativeTime(alert.last_seen)}</td>
                    <td className="p-4">
                      {alert.status === AlertStatuses.ACTIVE && (
                        <button
                          onClick={() => openAcknowledgeModal(alert.id)}
                          className="px-3 py-1.5 bg-urja-success/10 text-urja-success hover:bg-emerald-500/20 rounded-lg text-xs font-medium transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {acknowledgeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-urja-border">
              <h2 className="text-xl font-semibold text-urja-text flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-yellow-500" />
                Acknowledge Alert
              </h2>
              <button onClick={closeAcknowledgeModal} className="text-urja-text-secondary hover:text-urja-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-urja-text-secondary mb-1">Resolution Note (Optional)</label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full bg-urja-pale border border-urja-green-border rounded-2xl px-4 py-3 text-urja-text placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                  placeholder="Enter details about how this alert will be handled..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-urja-border bg-urja-surface/50">
              <button
                onClick={closeAcknowledgeModal}
                className="px-4 py-2 text-sm font-medium text-urja-text-secondary hover:text-urja-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAcknowledge}
                disabled={acknowledgeMutation.isPending}
                className="px-4 py-2 bg-urja-primary hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {acknowledgeMutation.isPending ? 'Acknowledging...' : 'Confirm Acknowledge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
