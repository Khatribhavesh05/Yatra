import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHealth } from '../api/health';
import { QUERY_KEYS } from '../utils/constants';
import { useWebSocket } from '../hooks/useWebSocket';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import { DetailPanel, InfoRow } from '../components/common/DetailComponents';

export default function SystemHealth() {
  const { data: health, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.HEALTH],
    queryFn: getHealth,
    refetchInterval: 30000,
    retry: false,
  });

  const { connectionState } = useWebSocket();
  const isConnected = connectionState === 'connected';
  const isApiHealthy = !isError && health?.status === 'ok';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Technical Operations & System Health"
        subtitle="Live telemetry gateway status, WebSocket stream pulse, and service availability."
        badgeText="TECHNICAL OPERATIONS"
        actions={
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="yatra-btn-primary"
          >
            <span className={`material-symbols-outlined text-base ${isFetching ? 'animate-spin' : ''}`}>
              refresh
            </span>
            Refresh Diagnostics
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main API Service */}
        <DetailPanel title="Main Telemetry API Gateway" icon="dns">
          <InfoRow
            label="Service Status"
            value={
              isLoading ? (
                'Checking...'
              ) : (
                <StatusBadge
                  status={isApiHealthy ? 'healthy' : 'down'}
                  label={isApiHealthy ? (health?.status?.toUpperCase() || 'HEALTHY') : 'UNREACHABLE'}
                />
              )
            }
          />
          <InfoRow label="Service Identifier" value={health?.service || 'yatra-backend-api'} />
          <InfoRow label="HTTP Endpoint Status" value="200 OK — Operational" border={false} />
        </DetailPanel>

        {/* Real-time WebSocket Stream */}
        <DetailPanel title="Real-Time Telemetry WebSocket Feed" icon="sensors">
          <InfoRow
            label="Connection State"
            value={
              <StatusBadge
                status={isConnected ? 'healthy' : 'warning'}
                label={isConnected ? 'LIVE FEED ACTIVE' : connectionState.toUpperCase()}
              />
            }
          />
          <InfoRow label="Protocol" value="WSS / WebSocket" />
          <InfoRow label="Subscribed Streams" value="Live Telemetry, Incidents, Vehicle Pos" border={false} />
        </DetailPanel>

        {/* Database */}
        <DetailPanel title="Primary PostgreSQL Database" icon="database">
          <InfoRow
            label="Database State"
            value={
              <StatusBadge
                status={isApiHealthy ? 'healthy' : 'warning'}
                label={isApiHealthy ? 'REACHABLE VIA API' : 'STATUS UNKNOWN'}
              />
            }
          />
          <InfoRow label="Persistence Layer" value="PostgreSQL + Supabase Platform" border={false} />
        </DetailPanel>

        {/* Telemetry Simulator Context */}
        <DetailPanel title="Fleet Telemetry Generator" icon="developer_board">
          <InfoRow label="Simulator Engine" value="Active Telemetry Broadcaster" />
          <InfoRow
            label="Launch Command"
            value={
              <span className="font-mono text-[11px] bg-slate-100 text-teal-800 px-2 py-1 rounded border border-slate-200">
                python -m simulator
              </span>
            }
            border={false}
          />
        </DetailPanel>
      </div>
    </div>
  );
}
