import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDevices, createDevice } from '../api/devices';
import { DeviceStatuses } from '../types/enums';
import { formatRelativeTime, formatDate } from '../utils/formatters';
import { QUERY_KEYS } from '../utils/constants';
import { Cpu, Plus, Wifi, WifiOff, AlertTriangle, X } from 'lucide-react';

const statusColors: Record<string, string> = {
  [DeviceStatuses.ACTIVE]: 'bg-urja-success/10 text-urja-success border border-urja-success/20',
  [DeviceStatuses.INACTIVE]: 'bg-urja-pale text-urja-text-secondary border border-urja-green-border',
  [DeviceStatuses.MAINTENANCE]: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
};

export default function Devices() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    device_code: '',
    vehicle_id: '',
    firmware_version: '',
  });

  const { data: devices = [], isLoading } = useQuery({
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-urja-text flex items-center gap-3">
            <Cpu className="w-6 h-6 text-urja-success" />
            Devices
          </h1>
          <p className="text-urja-text-secondary mt-1">Manage physical telematics units and hardware.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-urja-primary hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Register Device
        </button>
      </div>

      <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-urja-pale border-b border-urja-green-border/50 text-urja-text-secondary text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-medium">Device Code</th>
                <th className="p-4 font-medium">Vehicle ID</th>
                <th className="p-4 font-medium">Firmware</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Last Seen</th>
                <th className="p-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-urja-text-secondary">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-urja-text-muted">Loading devices...</td></tr>
              ) : devices.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-urja-text-muted">No devices registered.</td></tr>
              ) : (
                devices.map(device => (
                  <tr key={device.id} className="hover:bg-urja-pale/30 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-urja-text font-medium">{device.device_code}</span>
                    </td>
                    <td className="p-4 text-urja-text-secondary font-mono text-xs" title={device.vehicle_id}>
                      {device.vehicle_id ? `${device.vehicle_id.substring(0, 8)}...` : 'Unassigned'}
                    </td>
                    <td className="p-4 text-urja-text-secondary">{device.firmware_version || '—'}</td>
                    <td className="p-4">
                      <span className={`flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[device.status] || statusColors[DeviceStatuses.INACTIVE]}`}>
                        {device.status === DeviceStatuses.ACTIVE && <Wifi className="w-3 h-3" />}
                        {device.status === DeviceStatuses.INACTIVE && <WifiOff className="w-3 h-3" />}
                        {device.status === DeviceStatuses.MAINTENANCE && <AlertTriangle className="w-3 h-3" />}
                        {device.status}
                      </span>
                    </td>
                    <td className="p-4 text-urja-text-secondary">{device.last_seen_at ? formatRelativeTime(device.last_seen_at) : '—'}</td>
                    <td className="p-4 text-urja-text-secondary">{formatDate(device.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-urja-border">
              <h2 className="text-xl font-semibold text-urja-text flex items-center gap-2">
                <Cpu className="w-5 h-5 text-urja-success" />
                Register New Device
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-urja-text-secondary hover:text-urja-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-urja-text-secondary mb-1">Device Code / Serial</label>
                  <input
                    required
                    type="text"
                    value={formData.device_code}
                    onChange={(e) => setFormData({...formData, device_code: e.target.value})}
                    className="w-full bg-urja-pale border border-urja-green-border rounded-lg px-4 py-2 text-urja-text focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
                    placeholder="e.g. TC-8X91-A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-urja-text-secondary mb-1">Vehicle ID (UUID)</label>
                  <input
                    required
                    type="text"
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
                    className="w-full bg-urja-pale border border-urja-green-border rounded-lg px-4 py-2 text-urja-text focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                    placeholder="00000000-0000-0000-0000-000000000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-urja-text-secondary mb-1">Firmware Version (Optional)</label>
                  <input
                    type="text"
                    value={formData.firmware_version}
                    onChange={(e) => setFormData({...formData, firmware_version: e.target.value})}
                    className="w-full bg-urja-pale border border-urja-green-border rounded-lg px-4 py-2 text-urja-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 1.0.4"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-urja-border bg-urja-surface/50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-urja-text-secondary hover:text-urja-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-urja-primary hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Registering...' : 'Register Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
