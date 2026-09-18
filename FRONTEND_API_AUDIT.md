# Yatra — Frontend API Audit

> **Generated**: 2026-08-28
> **Purpose**: Document all backend API endpoints, their contracts, and identify gaps for the Super Admin Dashboard.

---

## 1. Authentication

### `POST /api/auth/login`

| Property | Value |
|---|---|
| **Auth Required** | ❌ Public |
| **Request Body** | `LoginRequest` — `{ email: EmailStr, password: str }` |
| **Response** | `TokenResponse` — `{ access_token: str, refresh_token: str, token_type: "bearer" }` |
| **Side Effects** | Updates `last_login_at`; creates `user_login` audit log |
| **Notes** | Returns 401 on invalid credentials, 403 if user is deactivated |

### `POST /api/auth/refresh`

| Property | Value |
|---|---|
| **Auth Required** | ❌ (refresh token in body) |
| **Request Body** | `RefreshRequest` — `{ refresh_token: str }` |
| **Response** | `TokenResponse` — `{ access_token, refresh_token, token_type }` |
| **Notes** | Validates refresh token type claim; verifies user still active |

### `GET /api/auth/me`

| Property | Value |
|---|---|
| **Auth Required** | ✅ Bearer token |
| **Role** | Any authenticated user |
| **Response** | `UserMeResponse` — `{ id, email, full_name, role, department_id?, department_name?, is_active }` |
| **Notes** | Used to identify current user & role after login |

---

## 2. Admin Endpoints (Platform Admin Only)

All admin endpoints require `role = platform_admin`.

### `GET /api/admin/departments`

| Property | Value |
|---|---|
| **Auth** | ✅ `platform_admin` |
| **Query Params** | `limit: int = 50 (max 200)`, `offset: int = 0` |
| **Response** | `DepartmentResponse[]` — `{ id, name, code, description?, is_active, created_at, updated_at }` |

### `POST /api/admin/departments`

| Property | Value |
|---|---|
| **Auth** | ✅ `platform_admin` |
| **Request Body** | `DepartmentCreate` — `{ name, code, description? }` |
| **Response** | `DepartmentResponse` (201 Created) |
| **Side Effects** | Audit log: `department_created` |

### `PATCH /api/admin/departments/{dept_id}`

| Property | Value |
|---|---|
| **Auth** | ✅ `platform_admin` |
| **Path Params** | `dept_id: UUID` |
| **Request Body** | `DepartmentUpdate` — `{ name?, description?, is_active? }` |
| **Response** | `DepartmentResponse` |

### `GET /api/admin/users`

| Property | Value |
|---|---|
| **Auth** | ✅ `platform_admin` |
| **Query Params** | `department_id?: UUID`, `limit: int = 50 (max 200)`, `offset: int = 0` |
| **Response** | `UserResponse[]` — `{ id, email, full_name, role, department_id?, is_active, last_login_at?, created_at, updated_at }` |

### `POST /api/admin/users/invite`

| Property | Value |
|---|---|
| **Auth** | ✅ `platform_admin` |
| **Request Body** | `UserCreate` — `{ email: EmailStr, password, full_name, role, department_id? }` |
| **Response** | `UserResponse` (201 Created) |
| **Side Effects** | Audit log: `user_created` |

### `PATCH /api/admin/users/{user_id}/status`

| Property | Value |
|---|---|
| **Auth** | ✅ `platform_admin` |
| **Path Params** | `user_id: UUID` |
| **Request Body** | `UserStatusUpdate` — `{ is_active: bool, reason?: str }` |
| **Response** | `UserResponse` |
| **Side Effects** | Audit log: `user_activated` or `user_deactivated` |

### `GET /api/admin/devices`

| Property | Value |
|---|---|
| **Auth** | ✅ `platform_admin` |
| **Query Params** | `limit: int = 50 (max 200)`, `offset: int = 0` |
| **Response** | `DeviceResponse[]` — `{ id, device_code, vehicle_id, firmware_version?, status, last_seen_at?, created_at, updated_at }` |

### `POST /api/admin/devices`

| Property | Value |
|---|---|
| **Auth** | ✅ `platform_admin` |
| **Request Body** | `DeviceCreate` — `{ device_code, vehicle_id: UUID, firmware_version? }` |
| **Response** | `DeviceResponse` (201 Created) |
| **Side Effects** | Audit log: `device_registered` |

### `GET /api/admin/audit-logs`

| Property | Value |
|---|---|
| **Auth** | ✅ `platform_admin` |
| **Query Params** | `limit: int = 50 (max 200)`, `offset: int = 0` |
| **Response** | `AuditLogResponse[]` — `{ id, actor_id?, action, object_type, object_id?, reason?, metadata?, ip_address?, created_at }` |

---

## 3. Operator Endpoints (Fleet Operations)

Accessible by: `platform_admin`, `department_admin`, `dispatcher`, `analyst`, `maintenance`.
Non-platform-admin users are scoped to their department.

### `GET /api/operator/vehicles`

| Property | Value |
|---|---|
| **Auth** | ✅ Any operator role |
| **Query Params** | `limit: int = 100 (max 500)`, `offset: int = 0` |
| **Response** | `VehicleWithTelemetryResponse[]` — `{ id, vehicle_code, vehicle_type, department_id, is_active, latitude?, longitude?, speed_kph?, heading_deg?, soc_pct?, estimated_range_km?, charging?, connectivity_status?, last_seen? }` |
| **Scoping** | `platform_admin` sees all; others filtered by department |

### `GET /api/operator/vehicles/{vehicle_id}`

| Property | Value |
|---|---|
| **Auth** | ✅ Any operator role |
| **Path Params** | `vehicle_id: UUID` |
| **Response** | `VehicleWithTelemetryResponse` |
| **Scoping** | Department-scoped for non-admin roles |

### `GET /api/operator/vehicles/{vehicle_id}/track`

| Property | Value |
|---|---|
| **Auth** | ✅ Any operator role |
| **Path Params** | `vehicle_id: UUID` |
| **Query Params** | `limit: int = 100 (max 500)` |
| **Response** | `{ observed_at, latitude, longitude, speed_kph, soc_pct, heading_deg }[]` |
| **Notes** | Historical telemetry breadcrumb trail, ordered newest first |

### `GET /api/operator/alerts`

| Property | Value |
|---|---|
| **Auth** | ✅ Any operator role |
| **Query Params** | `status_filter?: str ("active", "acknowledged", "resolved", "expired")`, `limit: int = 50 (max 200)`, `offset: int = 0` |
| **Response** | `AlertResponse[]` — `{ id, vehicle_id, alert_type, severity, status, first_seen, last_seen, acknowledged_by?, acknowledged_at?, resolution_note?, metadata?, created_at, updated_at }` |
| **Scoping** | Department-scoped for non-admin roles |

### `POST /api/operator/alerts/{alert_id}/ack`

| Property | Value |
|---|---|
| **Auth** | ✅ `platform_admin`, `department_admin`, `dispatcher` only |
| **Path Params** | `alert_id: UUID` |
| **Request Body** | `AlertAckRequest` — `{ resolution_note?: str }` |
| **Response** | `AlertResponse` |
| **Side Effects** | Audit log: `alert_acknowledged` |
| **Notes** | `analyst` and `maintenance` roles cannot acknowledge alerts |

---

## 4. Telemetry Ingestion

### `POST /api/ingest/telemetry`

| Property | Value |
|---|---|
| **Auth** | ❌ Public (IoT Gateway / Simulator) |
| **Request Body** | `TelemetryIngestPayload` — complex nested payload (device_id, vehicle_id, event_id, observed_at, location, motion?, energy?, diagnostics?, connectivity?, seq?) |
| **Response** | `TelemetryIngestResponse` — `{ status, event_id, flags?, message? }` |
| **Notes** | Not consumed by frontend. Used by simulator and IoT devices. |

---

## 5. Public Endpoints (No Auth)

### `GET /api/public/vehicles`

| Property | Value |
|---|---|
| **Auth** | ❌ Public |
| **Response** | `VehiclePublicResponse[]` — sanitized: `{ id, vehicle_type, department_name, latitude?(rounded), longitude?(rounded), speed_kph?(rounded), direction?(cardinal), soc_pct?(rounded), charging?, status? }` |
| **Notes** | Privacy-sanitized data for citizen apps |

### `GET /api/public/charging-centers`

| Property | Value |
|---|---|
| **Auth** | ❌ Public |
| **Response** | `ChargingCenterPublicResponse[]` — `{ id, name, latitude, longitude, connectors?, power_kw? }` |
| **Notes** | Only public_visible=true centers |

---

## 6. Health

### `GET /health`

| Property | Value |
|---|---|
| **Auth** | ❌ Public |
| **Response** | `{ status: "healthy", service: "chargeease-backend" }` |
| **Notes** | Basic liveness check; no database health exposed |

---

## 7. WebSocket

### `WS /ws/operator?token=<jwt_access_token>`

| Property | Value |
|---|---|
| **Auth** | ✅ JWT access token as query param |
| **Connection Flow** | Token → decode → validate type="access" → resolve role/department → accept |
| **Close Codes** | `4001` = Token required / Invalid token |
| **Message Types (Server→Client)** | `{ "type": "telemetry_update", "data": {...} }` and `{ "type": "alert", "data": {...} }` |
| **Isolation** | `platform_admin` receives ALL events. Other roles receive only their department's events. |
| **Client→Server** | Connection kept alive via receive loop; no structured client commands currently |

---

## 8. Enum Values Reference

### UserRole
| Value | Description |
|---|---|
| `platform_admin` | Full system access, cross-department |
| `department_admin` | Department-level management |
| `dispatcher` | Real-time fleet monitoring |
| `analyst` | Read-only analytics |
| `maintenance` | Vehicle health and diagnostics |

### VehicleType
| Value |
|---|
| `electric_bus` |
| `fire_ev` |
| `utility_ev` |
| `ambulance_ev` |
| `other` |

### AlertType
| Value |
|---|
| `LOW_SOC` |
| `LOW_RANGE` |
| `VEHICLE_OFFLINE` |
| `GEOFENCE_BREACH` |
| `OVERSPEED` |
| `HIGH_BATTERY_TEMP` |
| `DIAGNOSTIC_FAULT` |
| `CHARGING_INTERRUPTED` |

### AlertSeverity
| Value |
|---|
| `critical` |
| `high` |
| `medium` |
| `low` |
| `info` |

### AlertStatus
| Value |
|---|
| `active` |
| `acknowledged` |
| `resolved` |
| `expired` |

### DeviceStatus
| Value |
|---|
| `active` |
| `inactive` |
| `maintenance` |

### TripStatus
| Value |
|---|
| `active` |
| `completed` |
| `interrupted` |

### GeofenceType
| Value |
|---|
| `depot` |
| `station` |
| `hospital` |
| `boundary` |
| `restricted` |

---

## 9. APIs Missing for Super Admin Dashboard

The following features DO NOT have corresponding backend endpoints:

| Feature | Status | Notes |
|---|---|---|
| **Admin Charging Center List** | ⚠️ BACKEND API NOT AVAILABLE | Only `GET /api/public/charging-centers` exists (public, sanitized). No admin endpoint to list all charging centers with full details (verification status, source, public_visible flag). **Workaround**: Use public endpoint for now; data is sufficient for display. |
| **Admin Charging Center CRUD** | ⚠️ BACKEND API NOT AVAILABLE | No create/update/delete charging center endpoints for admin. |
| **Admin Vehicle CRUD** | ⚠️ BACKEND API NOT AVAILABLE | No admin endpoints to create/update/delete vehicles. Only operator `GET` endpoints exist. |
| **Dashboard Aggregate Stats** | ⚠️ BACKEND API NOT AVAILABLE | No dedicated `/api/admin/stats` endpoint for KPIs. **Workaround**: Compute from `GET /api/operator/vehicles` and `GET /api/operator/alerts`. |
| **Analytics / Reports** | ⚠️ BACKEND API NOT AVAILABLE | No dedicated analytics endpoints. **Workaround**: Derive charts from vehicle telemetry list and alert data. |
| **System Health (detailed)** | ⚠️ BACKEND API NOT AVAILABLE | `/health` only returns basic liveness. No DB, WebSocket, or simulator health details. |
| **User Update (role/name)** | ⚠️ BACKEND API NOT AVAILABLE | Only status (activate/deactivate) can be changed. No endpoint to update user role, name, or department assignment. |
| **Trip History** | ⚠️ BACKEND API NOT AVAILABLE | Trip model exists in DB but no API endpoints to query trips. |
| **Geofence Management** | ⚠️ BACKEND API NOT AVAILABLE | Geofence model exists but no API endpoints. |
| **Notification System** | ⚠️ BACKEND API NOT AVAILABLE | No notification API. Alerts come via WebSocket. |
| **Settings Management** | ⚠️ BACKEND API NOT AVAILABLE | DataPolicy model exists but no API endpoints. |
| **Audit Log Filters** | ⚠️ PARTIAL | Pagination works, but no filter by action type, actor, date range, or search. |

---

## 10. Seed Data / Test Accounts

| Role | Email | Password |
|---|---|---|
| **Platform Admin** | `admin@chargeease.gov` | `admin123` |
| **Transport Admin** | `transport@chargeease.gov` | `transport123` |
| **Fire Admin** | `fire@chargeease.gov` | `fire123` |
| **Electricity Admin** | `electricity@chargeease.gov` | `electricity123` |

### Seed Fleet
- **3 Departments**: Transport (6 buses), Fire (4 fire EVs), Electricity (5 utility EVs)
- **15 Vehicles** with matching devices
- **3 Charging Centers** in Delhi
- **2 Geofences**

---

## 11. CORS Configuration

```
Allowed Origins: http://localhost:5173, http://localhost:3000
Credentials: true
Methods: *
Headers: *
```

The Super Admin Dashboard must run on one of these origins, or the backend CORS config must be updated.

---

## 12. Authentication Flow Summary

```
1. POST /api/auth/login { email, password }
   → { access_token, refresh_token, token_type: "bearer" }

2. Store tokens securely (localStorage/memory)

3. All authenticated requests:
   Authorization: Bearer <access_token>

4. Token expires (30 min):
   POST /api/auth/refresh { refresh_token }
   → New { access_token, refresh_token }

5. WebSocket:
   ws://host/ws/operator?token=<access_token>

6. Identify user:
   GET /api/auth/me → { id, email, full_name, role, ... }
```
