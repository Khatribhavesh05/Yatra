export type VehicleType = 'electric_bus' | 'fire_ev' | 'utility_ev' | 'ambulance_ev' | 'other';

export interface VehiclePublic {
  id: string;
  vehicle_code?: string;
  vehicle_type: VehicleType;
  department_name: string;
  latitude?: number | null;
  longitude?: number | null;
  speed_kph?: number | null;
  heading_deg?: number | null;
  direction?: string | null;
  soc_pct?: number | null;
  charging?: boolean | null;
  status: 'online' | 'offline' | 'unknown' | string;
  route_id?: string | null;
  route_name?: string | null;
  route_code?: string | null;
  last_updated_at?: string | null;
}

export type ChargingCenterStatus = 'operational' | 'limited' | 'offline' | 'under_maintenance';

export interface ChargingCenter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  status: ChargingCenterStatus;
  description?: string | null;
  amenities?: Record<string, any> | null;
  contact_phone?: string | null;
  operating_hours?: string | null;
  connectors?: Record<string, any> | null;
  power_kw?: number | null;
  source?: string | null;
  last_verified_at?: string | null;
  public_visible: boolean;
  distance_km?: number;
}

export interface City {
  id: string;
  name: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  is_active: boolean;
}

export interface StateSummary {
  state: string;
  city_count: number;
}

export interface Stop {
  id: string;
  name: string;
  code?: string | null;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  address?: string | null;
  is_active: boolean;
  sequence?: number;
  distance_from_start_km?: number;
}

export interface Route {
  id: string;
  name: string;
  code?: string | null;
  city: string;
  state: string;
  description?: string | null;
  geometry?: Record<string, any> | null;
  color?: string | null;
  is_active: boolean;
  stops?: Stop[];
}

export interface StopDetail extends Stop {
  serving_routes?: Route[];
}

export interface HelpContact {
  id: string;
  city?: string | null;
  state?: string | null;
  department: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  category: 'transport' | 'charging_support' | 'emergency' | string;
  availability?: string | null;
  public_visible: boolean;
  last_verified_at?: string | null;
}

export type GrievanceCategory =
  | 'Bus Delay'
  | 'Vehicle Condition'
  | 'Charging Station Issue'
  | 'Driver Conduct'
  | 'Other';

export interface GrievanceCreate {
  category: GrievanceCategory | string;
  description: string;
  city?: string;
  reporter_name?: string;
  reporter_phone?: string;
  reporter_email?: string;
}

export interface Grievance {
  id: string;
  category: string;
  description: string;
  city?: string | null;
  reporter_name?: string | null;
  reporter_phone?: string | null;
  reporter_email?: string | null;
  status: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'platform_admin' | 'department_admin' | 'dispatcher' | 'analyst' | 'maintenance' | 'charging_center_operator';
  department_id?: string | null;
  department_name?: string | null;
  is_active: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
