import { useState, useEffect, useRef, useCallback } from 'react';
import { wsService } from '../services/websocket';
import { WSMessage, VehicleWithTelemetryResponse } from '../types/api';

export const useVehicleStore = (initialVehicles: VehicleWithTelemetryResponse[] = []) => {
  const [vehicles, setVehicles] = useState<VehicleWithTelemetryResponse[]>(initialVehicles);
  const vehiclesMapRef = useRef<Map<string, VehicleWithTelemetryResponse>>(new Map());

  // Sync initial vehicles into map
  useEffect(() => {
    const map = new Map<string, VehicleWithTelemetryResponse>();
    initialVehicles.forEach(v => map.set(v.id, v));
    vehiclesMapRef.current = map;
    setVehicles(Array.from(map.values()));
  }, [initialVehicles]);

  // Subscribe to WebSocket telemetry updates
  useEffect(() => {
    const handleMessage = (message: WSMessage) => {
      if (message.type === 'telemetry_update' && message.data) {
        const data = message.data as Record<string, unknown>;
        const vehicleId = (data.vehicle_id || data.id) as string;
        if (!vehicleId) return;

        const currentMap = vehiclesMapRef.current;
        const existing = currentMap.get(vehicleId);

        if (existing) {
          // Merge telemetry fields directly into the flat vehicle object
          const updated: VehicleWithTelemetryResponse = {
            ...existing,
            latitude: (data.latitude as number) ?? existing.latitude,
            longitude: (data.longitude as number) ?? existing.longitude,
            speed_kph: (data.speed_kph as number) ?? existing.speed_kph,
            heading_deg: (data.heading_deg as number) ?? existing.heading_deg,
            soc_pct: (data.soc_pct as number) ?? existing.soc_pct,
            estimated_range_km: (data.estimated_range_km as number) ?? existing.estimated_range_km,
            charging: (data.charging as boolean) ?? existing.charging,
            connectivity_status: (data.connectivity_status as string) ?? existing.connectivity_status,
            last_seen: (data.observed_at as string) ?? existing.last_seen,
          };
          currentMap.set(vehicleId, updated);
          setVehicles(Array.from(currentMap.values()));
        }
      }
    };

    const unsubscribe = wsService.subscribe(handleMessage);
    return () => { unsubscribe(); };
  }, []);

  return vehicles;
};
