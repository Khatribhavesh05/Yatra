import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Database, Server, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { getHealth } from '../api/health';
import { QUERY_KEYS } from '../utils/constants';
import { useWebSocket } from '../hooks/useWebSocket';

export default function SystemHealth() {
  const { data: health, isLoading, isFetching, refetch } = useQuery({
    queryKey: [QUERY_KEYS.HEALTH],
    queryFn: getHealth,
    refetchInterval: 30000, // auto refetch every 30s
  });

  const { connectionState } = useWebSocket();
  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-urja-text">System Health</h1>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 rounded-lg bg-urja-pale px-4 py-2 text-sm font-medium text-urja-text hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* API Health */}
        <div className="rounded-2xl border border-urja-border bg-urja-surface p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${health?.status === 'ok' ? 'bg-urja-success/10 text-urja-success' : 'bg-urja-danger/10 text-urja-danger'}`}>
                <Server className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-urja-text">API Service</h3>
                <p className="text-sm text-urja-text-secondary">Main Backend API</p>
              </div>
            </div>
            {isLoading ? (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium capitalize text-urja-text-secondary">
                  {health?.status || 'Unknown'}
                </span>
                <span className={`h-3 w-3 rounded-full ${health?.status === 'ok' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></span>
              </div>
            )}
          </div>
          
          <div className="mt-4 border-t border-urja-border pt-4 text-sm text-urja-text-secondary">
            <div className="flex justify-between mb-2">
              <span>Service</span>
              <span className="text-urja-text-secondary font-mono">{health?.service || '—'}</span>
            </div>
          </div>
        </div>

        {/* WebSocket Health */}
        <div className="rounded-2xl border border-urja-border bg-urja-surface p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${isConnected ? 'bg-urja-success/10 text-urja-success' : isConnecting ? 'bg-amber-500/10 text-amber-500' : 'bg-urja-danger/10 text-urja-danger'}`}>
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-urja-text">Real-time Stream</h3>
                <p className="text-sm text-urja-text-secondary">WebSocket Connection</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-urja-text-secondary">
                {isConnected ? 'LIVE' : isConnecting ? 'RECONNECTING' : 'OFFLINE'}
              </span>
              <span className={`h-3 w-3 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : isConnecting ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></span>
            </div>
          </div>
          
          <div className="mt-4 border-t border-urja-border pt-4 text-sm text-urja-text-secondary">
            <div className="flex justify-between mb-2">
              <span>Protocol</span>
              <span className="text-urja-text-secondary font-mono">WSS</span>
            </div>
            <div className="flex justify-between">
              <span>Updates</span>
              <span className="text-urja-text-secondary">Vehicles, Alerts</span>
            </div>
          </div>
        </div>

        {/* Database Info */}
        <div className="rounded-2xl border border-urja-border bg-urja-surface p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-urja-info/10 text-urja-info">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-urja-text">Database</h3>
              <p className="text-sm text-urja-text-secondary">PostgreSQL Store</p>
            </div>
          </div>
          <div className="rounded-lg bg-urja-pale p-4 border border-urja-green-border/50 text-sm text-urja-text-secondary flex items-start gap-2">
            <InfoIcon className="h-4 w-4 mt-0.5 text-blue-400 shrink-0" />
            <span>Status check not exposed by backend API currently. Assuming healthy if API is reachable.</span>
          </div>
        </div>

        {/* Simulator Info */}
        <div className="rounded-2xl border border-urja-border bg-urja-surface p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-urja-dark/10 text-urja-dark">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-urja-text">Fleet Simulator</h3>
              <p className="text-sm text-urja-text-secondary">Telemetry Generator</p>
            </div>
          </div>
          <div className="rounded-lg bg-urja-pale p-4 border border-urja-green-border/50 text-sm text-urja-text-secondary flex flex-col gap-2">
            <span>Connect simulator to generate live telemetry:</span>
            <code className="bg-urja-bg px-2 py-1.5 rounded text-urja-primary font-mono text-xs border border-urja-border">
              python -m simulator
            </code>
          </div>
        </div>

      </div>
    </div>
  );
}

function InfoIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
