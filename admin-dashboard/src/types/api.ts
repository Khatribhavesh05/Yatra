

// ============ Auth ============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface UserMeResponse {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department_id: string | null;
  department_name: string | null;
  is_active: boolean;
}

// ============ Department ============
export interface DepartmentCreate {
  name: string;
  code: string;
  description?: string;
}

export interface DepartmentUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface DepartmentResponse {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============ User ============
export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
  role: string;
  department_id?: string;
}

export interface UserStatusUpdate {
  is_active: boolean;
  reason?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department_id: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============ Vehicle ============
export interface VehicleWithTelemetryResponse {
  id: string;
  vehicle_code: string;
  vehicle_type: string;
  department_id: string;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  speed_kph: number | null;
  heading_deg: number | null;
  soc_pct: number | null;
  estimated_range_km: number | null;
  charging: boolean | null;
  connectivity_status: string | null;
  last_seen: string | null;
}

export interface VehicleTrackPoint {
  observed_at: string;
  latitude: number;
  longitude: number;
  speed_kph: number | null;
  soc_pct: number | null;
  heading_deg: number | null;
}

// ============ Alert ============
export interface AlertResponse {
  id: string;
  vehicle_id: string;
  alert_type: string;
  severity: string;
  status: string;
  first_seen: string;
  last_seen: string;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolution_note: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface AlertAckRequest {
  resolution_note?: string;
}

// ============ Device ============
export interface DeviceCreate {
  device_code: string;
  vehicle_id: string;
  firmware_version?: string;
}

export interface DeviceResponse {
  id: string;
  device_code: string;
  vehicle_id: string;
  firmware_version: string | null;
  status: string;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============ Charging Center ============
export interface ChargingCenterPublicResponse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  connectors: Record<string, number> | null;
  power_kw: number | null;
}

// ============ Audit Log ============
export interface AuditLogResponse {
  id: string;
  actor_id: string | null;
  action: string;
  object_type: string;
  object_id: string | null;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// ============ Health ============
export interface HealthResponse {
  status: string;
  service: string;
}

// ============ WebSocket ============
export interface WSTelemetryMessage {
  type: 'telemetry_update';
  data: Record<string, unknown>;
}

export interface WSAlertMessage {
  type: 'alert';
  data: Record<string, unknown>;
}

export type WSMessage = WSTelemetryMessage | WSAlertMessage;

// ============ Pagination ============
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
