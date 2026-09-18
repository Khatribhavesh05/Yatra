import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAlerts, acknowledgeAlert } from '../api/alerts';
import { getVehicles } from '../api/vehicles';
import { AlertTypeLabels, AlertSeverities, AlertStatuses } from '../types/enums';
import { formatRelativeTime } from '../utils/formatters';
import { QUERY_KEYS } from '../utils/constants';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import { FilterSelect } from '../components/common/FilterControls';
import { EmptyState, ErrorState } from '../components/common/FeedbackStates';

export default function Alerts() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [acknowledgeModalOpen, setAcknowledgeModalOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading, isError, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.ALERTS, statusFilter !== 'ALL' ? statusFilter : undefined],
    queryFn: () => getAlerts(statusFilter !== 'ALL' ? statusFilter : undefined, 200, 0),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: QUERY_KEYS.VEHICLES,
    queryFn: () => getVehicles(500, 0),
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

  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Incident Command Feed"
        message="Could not load active system alerts."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incident Command Center"
        subtitle="Real-time alert dispatch, battery threshold warnings, and officer incident acknowledgement."
        badgeText={`${activeCount} ACTIVE ALERTS`}
      />

      {/* Filter Toolbar */}
      <div className="yatra-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg overflow-hidden border border-slate-300">
            {statusTabs.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-2 text-xs font-bold uppercase transition-all ${
                  statusFilter === status
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {status === 'ALL' ? 'All Alerts' : status}
              </button>
            ))}
          </div>

          <FilterSelect
            value={severityFilter}
            onChange={setSeverityFilter}
            placeholder="All Severities"
            options={[
              { value: AlertSeverities.CRITICAL, label: 'Critical' },
              { value: AlertSeverities.HIGH, label: 'High' },
              { value: AlertSeverities.MEDIUM, label: 'Medium' },
              { value: AlertSeverities.LOW, label: 'Low' },
              { value: AlertSeverities.INFO, label: 'Info' },
            ]}
            className="w-40"
          />

          <FilterSelect
            value={typeFilter}
            onChange={setTypeFilter}
            placeholder="All Alert Types"
            options={Object.entries(AlertTypeLabels).map(([key, label]) => ({
              value: key,
              label,
            }))}
            className="w-48"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-900">{filteredAlerts.length}</span> alerts
        </div>
      </div>

      {/* Alerts Table */}
      <div className="yatra-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Alert Type</th>
                <th className="py-3 px-4">Vehicle Code</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">First Observed</th>
                <th className="py-3 px-4">Last Update</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4 bg-slate-50/50" />
                  </tr>
                ))
              ) : filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => {
                  const vehicle = vehicles.find((v) => v.id === alert.vehicle_id);
                  return (
                    <tr key={alert.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <StatusBadge status={alert.severity} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {AlertTypeLabels[alert.alert_type] || alert.alert_type}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {vehicle ? vehicle.vehicle_code : alert.vehicle_id.slice(0, 8)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={alert.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatRelativeTime(alert.first_seen)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatRelativeTime(alert.last_seen)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {alert.status === AlertStatuses.ACTIVE && (
                          <button
                            onClick={() => openAcknowledgeModal(alert.id)}
                            className="px-3 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 rounded text-xs font-bold transition-colors"
                          >
                            Acknowledge
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8">
                    <EmptyState
                      title="No Incident Alerts"
                      description="No alerts match the selected status or severity filters."
                      icon="notifications_off"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acknowledge Modal */}
      {acknowledgeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Officer Alert Acknowledgement
              </h3>
              <button
                onClick={closeAcknowledgeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                Confirming acknowledgement logs your officer ID and updates the alert status.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Resolution Note (Optional)
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-teal-600 min-h-[90px]"
                  placeholder="Describe operational dispatch or resolution notes..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={closeAcknowledgeModal}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAcknowledge}
                disabled={acknowledgeMutation.isPending}
                className="yatra-btn-primary text-xs"
              >
                {acknowledgeMutation.isPending ? 'Processing...' : 'Confirm Acknowledgement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
