import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { operatorApi } from '../api/operatorApi';
import { ChargingCenter, ChargingCenterStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatStationStatus, formatRelativeTime } from '../utils/formatters';

export const OperatorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isOperator, logout } = useAuth();

  const [stations, setStations] = useState<ChargingCenter[]>([]);
  const [selectedStation, setSelectedStation] = useState<ChargingCenter | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State for editing
  const [editStatus, setEditStatus] = useState<ChargingCenterStatus>('operational');
  const [editPowerKw, setEditPowerKw] = useState<string>('');
  const [editHours, setEditHours] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOperatorStations = async () => {
      try {
        setLoading(true);
        const data = await operatorApi.getStations();
        setStations(data);
        if (data.length > 0) {
          selectStationForEdit(data[0]);
        }
      } catch (err) {
        console.error('Failed to load operator stations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOperatorStations();
  }, [isAuthenticated, navigate]);

  const selectStationForEdit = (station: ChargingCenter) => {
    setSelectedStation(station);
    setEditStatus(station.status);
    setEditPowerKw(station.power_kw ? String(station.power_kw) : '');
    setEditHours(station.operating_hours || '');
    setEditPhone(station.contact_phone || '');
    setEditDescription(station.description || '');
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStation) return;

    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const updated = await operatorApi.updateStation(selectedStation.id, {
        status: editStatus,
        power_kw: editPowerKw ? parseFloat(editPowerKw) : undefined,
        operating_hours: editHours,
        contact_phone: editPhone,
        description: editDescription,
      });

      // Update in local list
      setStations((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setSelectedStation(updated);
      setSuccessMsg('Station telemetry & status updated successfully on public grid.');
    } catch (err: any) {
      console.error('Failed to update station:', err);
      setErrorMsg(
        err.response?.data?.detail || 'Failed to save changes. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-surface">
        <LoadingSpinner message="Authenticating operator credentials and loading station grid..." />
      </div>
    );
  }

  return (
    <div className="w-full py-10 bg-surface">
      <div className="max-w-container-max-width mx-auto px-gutter">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-outline-variant/60 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-primary-container/10 text-primary text-xs font-bold">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                Certified Operator Portal
              </span>
              <span className="text-xs text-on-surface-variant">
                Logged in as <strong>{user?.email}</strong>
              </span>
            </div>
            <h1 className="font-display-lg text-2xl sm:text-3xl font-bold text-on-background">
              Charging Center Operations Console
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon="logout"
              onClick={logout}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-lg">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Side: Assigned Stations List */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="font-label-bold text-xs uppercase tracking-wider text-outline mb-2">
              Assigned Stations ({stations.length})
            </h2>

            {stations.length === 0 ? (
              <EmptyState
                icon="ev_station"
                title="No Stations Assigned"
                description="Your account is not assigned to any station. Contact your system admin."
              />
            ) : (
              stations.map((st) => {
                const isSelected = selectedStation?.id === st.id;
                const statusInfo = formatStationStatus(st.status);
                return (
                  <div
                    key={st.id}
                    onClick={() => selectStationForEdit(st)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary-container/10 ring-2 ring-primary shadow-sm'
                        : 'border-outline-variant bg-white hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-headline-sm text-sm font-bold text-on-background">
                        {st.name}
                      </h4>
                      <Badge variant={st.status === 'operational' ? 'success' : 'warning'} size="sm" dot>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 line-clamp-1">
                      {st.address || `${st.city}, ${st.state}`}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-outline pt-2 border-t border-outline-variant/40">
                      <span>{st.power_kw ? `${st.power_kw} kW Output` : 'Standard'}</span>
                      <span>Verified {formatRelativeTime(st.last_verified_at)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Side: Station Management & Live Telemetry Editor */}
          <div className="lg:col-span-8">
            {selectedStation ? (
              <div className="bg-white rounded-2xl border border-outline-variant p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-6 border-b border-outline-variant/60 gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-container/10 px-2 py-0.5 rounded">
                      Live Telemetry Editor
                    </span>
                    <h2 className="font-display-lg text-xl sm:text-2xl font-bold text-on-background mt-1">
                      {selectedStation.name}
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Station ID: <code className="font-mono text-outline">{selectedStation.id}</code>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-outline block">Last Verified At</span>
                    <span className="text-xs font-semibold text-on-surface">
                      {formatRelativeTime(selectedStation.last_verified_at)}
                    </span>
                  </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSaveChanges} className="space-y-6">
                  {/* Status Selection */}
                  <div className="space-y-2">
                    <label className="block text-label-sm text-on-surface font-semibold">
                      Public Operational Status *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { val: 'operational', label: 'Operational (Open)', icon: 'check_circle', color: 'border-emerald-500 text-emerald-800 bg-emerald-50' },
                        { val: 'limited', label: 'Limited (Busy / 1 Port)', icon: 'warning', color: 'border-amber-500 text-amber-800 bg-amber-50' },
                        { val: 'offline', label: 'Offline (Maintenance)', icon: 'error', color: 'border-red-500 text-red-800 bg-red-50' },
                      ].map((item) => {
                        const isChosen = editStatus === item.val;
                        return (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => setEditStatus(item.val as ChargingCenterStatus)}
                            className={`p-3.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                              isChosen
                                ? `${item.color} ring-2 ring-primary font-bold shadow-sm`
                                : 'border-outline-variant hover:bg-surface-container bg-white text-on-surface'
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg">{item.icon}</span>
                            <span className="text-xs">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Power Rating & Operating Hours */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Power Capacity (kW)"
                      type="number"
                      placeholder="e.g. 60"
                      value={editPowerKw}
                      onChange={(e) => setEditPowerKw(e.target.value)}
                      icon="bolt"
                    />

                    <Input
                      label="Operating Hours"
                      placeholder="e.g. 24/7 Open or 07:00 AM - 11:00 PM"
                      value={editHours}
                      onChange={(e) => setEditHours(e.target.value)}
                      icon="schedule"
                    />
                  </div>

                  <Input
                    label="Station Contact Helpline"
                    placeholder="e.g. +91 151 222 6100"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    icon="call"
                  />

                  <div className="space-y-1.5 text-left">
                    <label className="block text-label-sm text-on-surface font-semibold">
                      Public Description / Station Notes
                    </label>
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Enter specific station access notes, gate directions, or parking tips..."
                      className="w-full bg-white border border-outline-variant text-on-surface text-sm rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-outline-variant/60 flex items-center justify-between">
                    <a
                      href={`/charging/${selectedStation.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-label-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>View Public Listing</span>
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>

                    <Button
                      type="submit"
                      variant="primary"
                      loading={saving}
                      icon="save"
                    >
                      Publish Updates to Public Grid
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-outline-variant">
                Select a charging station from the list to update its operational parameters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
