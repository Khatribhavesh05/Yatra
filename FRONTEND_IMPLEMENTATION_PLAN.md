# ChargeEase — Frontend Implementation Plan

> **Generated**: 2026-08-28  
> **Companion Document**: [FRONTEND_API_AUDIT.md](file:///c:/Users/khana/OneDrive/Desktop/ChargeEase/FRONTEND_API_AUDIT.md)  
> **Status**: AWAITING APPROVAL — Do not begin coding until approved.

---

## A. Backend APIs Discovered

21 REST endpoints + 1 WebSocket across 6 route groups:

### Auth (3 endpoints — no role restriction)
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/login` | Authenticate user, returns JWT access + refresh tokens |
| POST | `/api/auth/refresh` | Exchange refresh token for new token pair |
| GET | `/api/auth/me` | Get current user identity (id, email, role, department) |

### Admin (9 endpoints — `platform_admin` only)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/admin/departments` | List departments (limit/offset) |
| POST | `/api/admin/departments` | Create department |
| PATCH | `/api/admin/departments/{id}` | Update department (name, description, is_active) |
| GET | `/api/admin/users` | List users (filterable by department_id, limit/offset) |
| POST | `/api/admin/users/invite` | Create/invite user |
| PATCH | `/api/admin/users/{id}/status` | Activate/deactivate user (with reason) |
| GET | `/api/admin/devices` | List IoT devices (limit/offset) |
| POST | `/api/admin/devices` | Register new device |
| GET | `/api/admin/audit-logs` | List audit trail (limit/offset) |

### Operator (5 endpoints — all authenticated roles, department-scoped)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/operator/vehicles` | List vehicles with latest telemetry (limit/offset) |
| GET | `/api/operator/vehicles/{id}` | Single vehicle with telemetry |
| GET | `/api/operator/vehicles/{id}/track` | Historical GPS breadcrumb trail (limit) |
| GET | `/api/operator/alerts` | List alerts (status_filter, limit/offset) |
| POST | `/api/operator/alerts/{id}/ack` | Acknowledge alert (admin/dispatcher only) |

### Public (2 endpoints — no auth)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/public/vehicles` | Sanitized vehicle positions for citizens |
| GET | `/api/public/charging-centers` | Public charging center locations |

### Ingest (1 endpoint — no auth, used by simulator/IoT)
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/ingest/telemetry` | Receive telemetry from IoT devices |

### Health (1 endpoint — no auth)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Basic liveness check (`{ status, service }`) |

### WebSocket (1 endpoint)
| Protocol | Path | Purpose |
|----------|------|---------|
| WS | `/ws/operator?token=<jwt>` | Real-time telemetry + alert push |

**Total: 21 REST + 1 WebSocket = 22 discoverable backend interfaces.**

---

## B. APIs Missing for Super Admin Requirements

| Required Feature | Backend Status | Impact | Proposed Workaround |
|-----------------|---------------|--------|---------------------|
| Dashboard aggregate KPIs (total EVs, active count, etc.) | ⚠️ NO ENDPOINT | Medium | Compute client-side from `GET /api/operator/vehicles` + `GET /api/operator/alerts` |
| Charging center admin CRUD (create/edit/delete) | ⚠️ NO ENDPOINT | Low | Display read-only via `GET /api/public/charging-centers`; mark CRUD as "Admin API Required" |
| Vehicle CRUD (create/update/delete) | ⚠️ NO ENDPOINT | Low | Display-only from operator endpoints |
| Analytics / reporting API | ⚠️ NO ENDPOINT | Medium | Derive charts client-side from vehicle telemetry + alert data |
| Detailed system health (DB, services, simulator) | ⚠️ BASIC ONLY | Low | Show `/health` result + client-side WebSocket status |
| User profile update (role, name, department reassignment) | ⚠️ STATUS ONLY | Medium | Only expose activate/deactivate toggle; display other fields read-only |
| Trip history query | ⚠️ NO ENDPOINT (model exists in DB) | Low | Show "Coming soon" placeholder on vehicle detail |
| Geofence management | ⚠️ NO ENDPOINT (model exists in DB) | Low | Not included in dashboard scope |
| Audit log filtering (by action, actor, date range) | ⚠️ PAGINATION ONLY | Low | Client-side filtering on fetched page |
| Notification system / alert inbox | ⚠️ NO ENDPOINT | Low | Rely on WebSocket push for real-time alerts |
| Data policy / settings management | ⚠️ NO ENDPOINT (model exists in DB) | Low | Not included in initial dashboard scope |

**Rule**: For every missing API, the UI will clearly indicate the limitation. No fake data will be generated. No mock endpoints will be invented.

---

## C. Data Models Discovered

13 SQLAlchemy tables mapped from the backend:

| Model | Table | Key Fields | Relationships |
|-------|-------|------------|---------------|
| **User** | `users` | id, email, hashed_password, full_name, role (enum), department_id, is_active, last_login_at | → Department |
| **Department** | `departments` | id, name, code, description, is_active | → users, vehicles, geofences |
| **Vehicle** | `vehicles` | id, vehicle_code, registration_number, vehicle_type (enum), make, model, year, department_id, is_active, public_visible | → Department, Device, TelemetryLatest, Alerts, Trips |
| **Device** | `devices` | id, device_code, vehicle_id, firmware_version, status (enum), last_seen_at | → Vehicle |
| **Alert** | `alerts` | id, vehicle_id, alert_type (enum), severity (enum), status (enum), first_seen, last_seen, acknowledged_by, acknowledged_at, resolution_note, metadata | → Vehicle, User (acknowledger) |
| **TelemetryEvent** | `telemetry_events` | id, event_id, vehicle_id, device_id, observed_at, lat/lng, speed, soc, charging, diagnostics, raw_payload | → Vehicle (immutable history) |
| **TelemetryLatest** | `telemetry_latest` | Same fields as TelemetryEvent + connectivity_status | → Vehicle (mutable cache, upsert) |
| **ChargingCenter** | `charging_centers` | id, name, lat/lng, connectors (JSON), power_kw, source, last_verified_at, public_visible | None |
| **AuditLog** | `audit_logs` | id, actor_id, action, object_type, object_id, reason, metadata, ip_address, created_at | → User (actor) |
| **Trip** | `trips` | id, vehicle_id, started_at, ended_at, start/end lat/lng, distance_km, start/end soc, energy_consumed_kwh, status (enum) | → Vehicle |
| **Geofence** | `geofences` | id, name, geofence_type (enum), department_id, boundary (JSON), center_lat/lng, radius_m, is_active | → Department |
| **DataPolicy** | `data_policies` | id, policy_key, policy_value, description, updated_by | → User |

### Key Enums

| Enum | Values |
|------|--------|
| **UserRole** | `platform_admin`, `department_admin`, `dispatcher`, `analyst`, `maintenance` |
| **VehicleType** | `electric_bus`, `fire_ev`, `utility_ev`, `ambulance_ev`, `other` |
| **AlertType** | `LOW_SOC`, `LOW_RANGE`, `VEHICLE_OFFLINE`, `GEOFENCE_BREACH`, `OVERSPEED`, `HIGH_BATTERY_TEMP`, `DIAGNOSTIC_FAULT`, `CHARGING_INTERRUPTED` |
| **AlertSeverity** | `critical`, `high`, `medium`, `low`, `info` |
| **AlertStatus** | `active`, `acknowledged`, `resolved`, `expired` |
| **DeviceStatus** | `active`, `inactive`, `maintenance` |
| **TripStatus** | `active`, `completed`, `interrupted` |
| **GeofenceType** | `depot`, `station`, `hospital`, `boundary`, `restricted` |

---

## D. WebSocket Contract

### Connection
```
URL:    ws://<host>/ws/operator?token=<jwt_access_token>
Auth:   JWT access token passed as query parameter
Accept: Server calls websocket.accept() after token validation
```

### Authentication Handshake
1. Client connects with `?token=<access_token>`
2. Server decodes JWT, verifies `type == "access"`
3. If invalid/missing → close with code `4001`
4. If valid → resolves `user_role` and `department_id`, accepts connection

### Connection Isolation
- `platform_admin` users → added to `_admin_connections` list → receive ALL events
- Other roles → added to `_department_connections[department_id]` → receive only their department's events

### Server → Client Messages

**Telemetry Update:**
```json
{
  "type": "telemetry_update",
  "data": {
    "vehicle_id": "uuid",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "speed_kph": 45.2,
    "soc_pct": 72.5,
    "heading_deg": 180.0,
    "estimated_range_km": 145.0,
    "charging": false,
    "connectivity_status": "online",
    "observed_at": "2026-08-28T10:00:00Z"
  }
}
```

**Alert:**
```json
{
  "type": "alert",
  "data": {
    "id": "uuid",
    "vehicle_id": "uuid",
    "alert_type": "LOW_SOC",
    "severity": "critical",
    "status": "active",
    "first_seen": "2026-08-28T10:00:00Z",
    "metadata": { "soc_pct": 15.2 }
  }
}
```

### Client → Server
No structured commands currently. The connection stays alive via a `receive_text()` loop. Clients can send pings to keep alive.

### Reconnection Strategy (Frontend Responsibility)
- Exponential backoff: 1s → 2s → 4s → 8s → ... → max 30s
- Max 10 attempts before giving up
- On new token (after refresh): reconnect with fresh token
- UI indicator: LIVE (green) / RECONNECTING (amber) / OFFLINE (red)

---

## E. Authentication Flow

```
┌─────────────────────────────────────────────────────┐
│                    LOGIN FLOW                        │
│                                                      │
│  1. User enters email + password                     │
│  2. POST /api/auth/login                             │
│     → { access_token, refresh_token, token_type }    │
│  3. Store tokens in localStorage                     │
│  4. GET /api/auth/me                                 │
│     → { id, email, full_name, role, department_id,   │
│        department_name, is_active }                  │
│  5. Redirect to dashboard                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              AUTHENTICATED REQUESTS                  │
│                                                      │
│  Every API call:                                     │
│    Authorization: Bearer <access_token>              │
│                                                      │
│  WebSocket:                                          │
│    ws://host/ws/operator?token=<access_token>        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│               TOKEN REFRESH FLOW                     │
│                                                      │
│  On 401 response:                                    │
│  1. POST /api/auth/refresh { refresh_token }         │
│     → New { access_token, refresh_token }            │
│  2. Update stored tokens                             │
│  3. Retry original failed request                    │
│  4. If refresh also fails → clear tokens → /login    │
└─────────────────────────────────────────────────────┘
```

### Token Details
- Access token: expires in **30 minutes**
- Refresh token: expires in **7 days**
- JWT claims: `sub` (user UUID), `role`, `department_id`, `type` ("access"/"refresh"), `jti`, `exp`
- Token blacklisting: in-memory `_token_blacklist` set (revoked JTI values)

### Role-Based Access
- `platform_admin`: Full access to all admin + operator endpoints. `department_id = null` → no department filter applied. Receives all WebSocket events.
- Other roles: Scoped to their department via `get_department_scope()` dependency.

---

## F. Proposed Frontend Architecture

### Tech Stack
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Build | Vite | Fast HMR, native TS support, user requirement |
| UI | React 19 + TypeScript | User requirement |
| Styling | Tailwind CSS v4 | User requirement, utility-first, dark theme |
| Routing | React Router v7 | User requirement, nested route support |
| Server State | TanStack Query v5 | User requirement, caching, refetch, mutations |
| HTTP Client | Axios | Interceptor support for token refresh queue |
| Icons | lucide-react | Consistent, tree-shakeable icon set |
| Charts | Recharts | User requirement, React-native chart library |
| Maps | MapLibre GL JS | User requirement, open-source, free tiles |
| Validation | Zod | Schema validation for forms |
| Real-time | Native WebSocket API | Direct WS connection, no abstraction needed |

### Project Location
**`admin-dashboard/`** at the project root — completely separate from the existing `frontend/` (public consumer website). The two apps have different auth systems, routing, layouts, and purposes.

### Source Structure
```
admin-dashboard/
├── .env                          # VITE_API_BASE_URL, VITE_WS_URL
├── index.html
├── vite.config.ts                # Port 5174, proxy /api → backend
├── tsconfig.json
├── package.json
└── src/
    ├── main.tsx                  # Entry: React root + providers
    ├── App.tsx                   # Route definitions + ProtectedRoute
    ├── index.css                 # Tailwind v4 import + overrides
    │
    ├── types/
    │   ├── api.ts                # TypeScript interfaces matching backend Pydantic schemas
    │   └── enums.ts              # Const objects + labels for all backend enums
    │
    ├── utils/
    │   ├── constants.ts          # Route paths, query keys, storage keys
    │   └── formatters.ts         # Date/battery/speed/range/status formatters
    │
    ├── api/                      # One file per resource, all using shared client
    │   ├── client.ts             # Axios instance + auth interceptor + 401 refresh queue
    │   ├── auth.ts               # login, refresh, getMe
    │   ├── departments.ts        # getDepartments, createDepartment, updateDepartment
    │   ├── vehicles.ts           # getVehicles, getVehicle, getVehicleTrack
    │   ├── alerts.ts             # getAlerts, acknowledgeAlert
    │   ├── users.ts              # getUsers, inviteUser, updateUserStatus
    │   ├── devices.ts            # getDevices, createDevice
    │   ├── charging.ts           # getChargingCenters
    │   ├── auditLogs.ts          # getAuditLogs
    │   └── health.ts             # getHealth
    │
    ├── hooks/
    │   ├── useAuth.tsx           # AuthContext + AuthProvider (login/logout/refresh)
    │   ├── useWebSocket.ts       # Connect/disconnect WS, expose connectionState
    │   └── useVehicleStore.ts    # Merge WS telemetry updates into vehicle state
    │
    ├── services/
    │   └── websocket.ts          # WebSocketService class (connect, reconnect, subscribe)
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx       # Collapsible nav with route links
    │   │   ├── Header.tsx        # Title, WS indicator, user info, logout
    │   │   └── DashboardLayout.tsx  # Shell: sidebar + header + scrollable content
    │   ├── common/               # Reusable: DataTable, StatusBadge, EmptyState, etc.
    │   ├── charts/               # Recharts wrappers for analytics
    │   └── maps/                 # MapLibre GL wrappers
    │
    └── pages/                    # One file per route (see Section G)
```

### Design System
- **Theme**: Dark — `slate-950` base, `slate-900` cards, `slate-800` borders
- **Text**: `slate-100` headings, `slate-400` secondary, `slate-500` muted
- **Accent**: `emerald-500`/`emerald-600` for primary actions
- **Status colors**: emerald=active, blue=charging, amber=idle, gray=offline, red=critical
- **Severity colors**: red=critical, orange=high, yellow=medium, blue=low, gray=info
- **Aesthetic**: Government Command Center — information-dense, professional, desktop-first

---

## G. Proposed Page Structure

| # | Page | Route | Backend APIs Used | Key Features |
|---|------|-------|-------------------|--------------|
| 1 | **Login** | `/login` | `POST /api/auth/login`, `GET /api/auth/me` | Email/password form, JWT token storage, role validation |
| 2 | **Overview** | `/` | `GET vehicles`, `GET alerts(active)`, `GET departments` | 6 KPI cards (computed client-side), department summary table, critical alert feed |
| 3 | **Live Fleet** | `/live-fleet` | `GET vehicles`, `WS /ws/operator` | MapLibre GL map, vehicle markers, sidebar list, filters (dept/status/battery), real-time updates via WS |
| 4 | **Vehicles** | `/vehicles` | `GET vehicles`, `GET departments` | Sortable/filterable table, status badges, battery bars, row click → detail |
| 5 | **Vehicle Detail** | `/vehicles/:id` | `GET vehicle/{id}`, `GET vehicle/{id}/track`, `GET alerts` | Telemetry cards, track history table/map, vehicle-specific alerts |
| 6 | **Alerts** | `/alerts` | `GET alerts`, `POST alerts/{id}/ack` | Status/severity/type filter tabs, acknowledge modal with resolution note |
| 7 | **Departments** | `/departments` | `GET departments`, `POST departments`, `GET vehicles` | Card grid with per-dept vehicle stats, create modal |
| 8 | **Dept Detail** | `/departments/:id` | `GET departments`, `PATCH departments/{id}`, `GET vehicles`, `GET alerts` | Edit modal, department vehicles table, department alerts |
| 9 | **Users & Roles** | `/users` | `GET users`, `POST users/invite`, `PATCH users/{id}/status`, `GET departments` | Invite modal, activate/deactivate with reason, dept filter |
| 10 | **Devices** | `/devices` | `GET devices`, `POST devices` | Register modal, status badges, firmware display |
| 11 | **Charging** | `/charging` | `GET public/charging-centers` | Card grid (read-only), "Admin API not available" banner |
| 12 | **Analytics** | `/analytics` | `GET vehicles`, `GET alerts`, `GET departments` | 5 Recharts charts derived from real data — no mock data |
| 13 | **Audit Logs** | `/audit-logs` | `GET audit-logs` | Read-only table, client-side action filter |
| 14 | **System Health** | `/system-health` | `GET /health`, WS state | API liveness, WebSocket status indicator |

### Data Flow Diagram
```
                    ┌──────────────────────┐
                    │   Backend (FastAPI)   │
                    │   localhost:8000      │
                    └──────┬───────┬───────┘
                           │       │
                    REST   │       │  WebSocket
                    (HTTPS)│       │  (WS)
                           │       │
                    ┌──────▼───────▼───────┐
                    │   Vite Proxy          │
                    │   localhost:5174      │
                    │   /api → :8000       │
                    │   /ws  → :8000       │
                    └──────┬───────────────┘
                           │
              ┌────────────▼────────────────┐
              │        React App             │
              │                              │
              │  ┌──────────────────────┐    │
              │  │  Axios Client        │    │
              │  │  (auth interceptor)  │    │
              │  └──────────┬───────────┘    │
              │             │                │
              │  ┌──────────▼───────────┐    │
              │  │  TanStack Query      │    │
              │  │  (cache + refetch)   │    │
              │  └──────────┬───────────┘    │
              │             │                │
              │  ┌──────────▼───────────┐    │
              │  │  Pages / Components  │    │
              │  └──────────────────────┘    │
              │                              │
              │  ┌──────────────────────┐    │
              │  │  WebSocket Service   │──── Real-time vehicle + alert updates
              │  │  (singleton)         │    │
              │  └──────────────────────┘    │
              └──────────────────────────────┘
```

---

## H. Backend Changes Required

### Required (1 change)

| File | Change | Reason |
|------|--------|--------|
| `backend/.env` | Add `http://localhost:5174` to `CORS_ORIGINS` | The admin dashboard runs on port 5174. Without this, the browser will block all cross-origin requests. |

### Not Required

No other backend changes are needed. The existing 21 endpoints + WebSocket provide sufficient coverage for all core dashboard functionality. Missing features (aggregate stats, analytics, detailed health) will be computed client-side from available data.

### Recommended Future Backend Enhancements (NOT blocking)

These are suggestions for Phase 2+ if the backend developer chooses to implement them. They are **not required** for the initial dashboard build:

1. **`GET /api/admin/stats`** — Pre-computed aggregate KPIs (faster than client-side computation over full vehicle list)
2. **`GET /api/admin/charging-centers`** + CRUD — Full admin management of charging infrastructure
3. **`POST/PATCH /api/admin/vehicles`** — Vehicle CRUD for fleet management
4. **`PATCH /api/admin/users/{id}`** — Full user update (role, name, department reassignment)
5. **`GET /api/operator/trips`** — Trip history query with filters
6. **Audit log filters** — Server-side filtering by action, actor, date range
7. **Detailed health endpoint** — DB connectivity, WebSocket connection count, simulator status

---

## Implementation Phases (Proposed)

| Phase | Scope | Dependencies |
|-------|-------|-------------|
| 1 | Project scaffold (Vite + React + TS + Tailwind) | None |
| 2 | Types, enums, API client layer, constants, formatters | Phase 1 |
| 3 | Auth (context, hook, Login page, token refresh) | Phase 2 |
| 4 | Layout shell (Sidebar, Header, DashboardLayout, routes) | Phase 3 |
| 5 | WebSocket service + hooks | Phase 3 |
| 6 | Overview page | Phases 4, 5 |
| 7 | Live Fleet page + map | Phases 4, 5 |
| 8 | Vehicles page + Vehicle Detail | Phase 4 |
| 9 | Alerts page + acknowledge flow | Phase 4 |
| 10 | Departments + Department Detail | Phase 4 |
| 11 | Users & Roles page | Phase 4 |
| 12 | Devices page | Phase 4 |
| 13 | Charging Infrastructure page | Phase 4 |
| 14 | Analytics page (Recharts) | Phase 4 |
| 15 | Audit Logs + System Health | Phase 4 |
| 16 | Polish (error states, loading skeletons, responsive) | All above |

Each phase will be presented for review before proceeding.
