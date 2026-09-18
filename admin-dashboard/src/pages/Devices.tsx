import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDevices, createDevice } from '../api/devices';
import { DeviceStatuses } from '../types/enums';
import { formatRelativeTime, formatDate } from '../utils/formatters';
import { QUERY_KEYS } from '../utils/constants';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import { EmptyState, ErrorState } from '../components/common/FeedbackStates';

export default function Devices() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    device_code: '',
    vehicle_id: '',
    firmware_version: '',
  });

  const { data: devices = [], isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.DEVICES],
    queryFn: () => getDevices(200, 0),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createDevice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEVICES] });
      setModalOpen(false);
      setFormData({ device_code: '', vehicle_id: '', firmware_version: '' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Telematics Devices"
        message="Could not load registered telemetry hardware units."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Telematics & Hardware Registry"
        subtitle="Physical onboard telemetry units, GPS gateways, and cell modems."
        badgeText="HARDWARE REGISTRY"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="yatra-btn-primary"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Register Telematics Unit
          </button>
        }
      />

      {/* Devices Table */}
      <div className="yatra-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Device Code / Serial</th>
                <th className="py-3 px-4">Associated Vehicle ID</th>
                <th className="py-3 px-4">Firmware Build</th>
                <th className="py-3 px-4">Hardware Status</th>
                <th className="py-3 px-4">Last Telemetry Ping</th>
                <th className="py-3 px-4 text-right">Provisioned Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="py-4 px-4 bg-slate-50/50" />
                  </tr>
                ))
              ) : devices.length > 0 ? (
                devices.map((device) => (
                  <tr key={device.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {device.device_code}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {device.vehicle_id ? device.vehicle_id.slice(0, 16) + '...' : 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {device.firmware_version || 'v1.0.0'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={device.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {device.last_seen_at ? formatRelativeTime(device.last_seen_at) : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 text-[11px]">
                      {formatDate(device.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8">
                    <EmptyState
                      title="No Hardware Devices Registered"
                      description="Click 'Register Telematics Unit' to link new hardware units to Yatra."
                      icon="memory"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Device Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Register Telematics Hardware
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Device Code / Serial Number
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.device_code}
                    onChange={(e) => setFormData({ ...formData, device_code: e.target.value.toUpperCase() })}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono uppercase focus:outline-none focus:border-teal-600"
                    placeholder="e.g. TC-8X91-A"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Associated Vehicle UUID
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-teal-600"
                    placeholder="00000000-0000-0000-0000-000000000000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Firmware Build Tag
                  </label>
                  <input
                    type="text"
                    value={formData.firmware_version}
                    onChange={(e) => setFormData({ ...formData, firmware_version: e.target.value })}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-teal-600"
                    placeholder="e.g. v1.2.4"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="yatra-btn-primary text-xs"
                >
                  {createMutation.isPending ? 'Registering...' : 'Register Hardware'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
