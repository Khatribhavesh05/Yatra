# Department Dashboard API Audit

This audit evaluates the existing FastAPI backend to determine API availability, role capabilities, and data access for the **Department Admin / Officer Dashboard**. 

> **Important**: This is based purely on the actual backend implementation found in `backend/app/api/`. No assumptions or fake APIs have been introduced.

---

## 1. Actual Authentication API
| Feature | Endpoint | Method | Auth | Response | Available? |
|---------|----------|--------|------|----------|------------|
| **Login** | `/api/auth/login` | `POST` | None | `{ access_token, refresh_token, token_type }` | ✅ YES |
| **Refresh** | `/api/auth/refresh` | `POST` | None | `{ access_token, refresh_token, token_type }` | ✅ YES |
| **Get Current User** | `/api/auth/me` | `GET` | Bearer | `{ id, email, full_name, role, department_id, department_name, is_active }` | ✅ YES |

## 2. Actual Department API
| Feature | Endpoint | Method | Role Required | Available? |
|---------|----------|--------|---------------|------------|
| **Get Own Department** | `/api/operator/department` | `GET` | `department_admin` | ❌ **BACKEND API NOT AVAILABLE** (User context in `/api/auth/me` provides basic dept info) |
| **Update Own Department** | `/api/operator/department` | `PATCH` | `department_admin` | ❌ **BACKEND API NOT AVAILABLE** (Updates restricted to `platform_admin` in `/api/admin/`) |

## 3. Actual Vehicle APIs (Department Scoped)
| Feature | Endpoint | Method | Role Required | Available? |
|---------|----------|--------|---------------|------------|
| **List Dept Vehicles** | `/api/operator/vehicles` | `GET` | All Operator Roles | ✅ YES (Returns list of `VehicleWithTelemetryResponse`) |
| **Get Vehicle Detail** | `/api/operator/vehicles/{id}` | `GET` | All Operator Roles | ✅ YES |
| **Create/Update Vehicle** | N/A | `POST`/`PATCH` | `department_admin` | ❌ **BACKEND API NOT AVAILABLE** |

## 4. Actual Telemetry APIs
| Feature | Endpoint | Method | Role Required | Available? |
|---------|----------|--------|---------------|------------|
| **Get Vehicle Track** | `/api/operator/vehicles/{id}/track` | `GET` | All Operator Roles | ✅ YES (Returns list of historical breadcrumbs) |
| **Detailed Diagnostics**| N/A | `GET` | `maintenance` | ❌ **BACKEND API NOT AVAILABLE** (Only basic telemetry returned) |

## 5. Actual Alert APIs (Department Scoped)
| Feature | Endpoint | Method | Role Required | Available? |
|---------|----------|--------|---------------|------------|
| **List Dept Alerts** | `/api/operator/alerts` | `GET` | All Operator Roles | ✅ YES (Supports `status_filter`) |
| **Acknowledge Alert** | `/api/operator/alerts/{id}/ack` | `POST` | `dept_admin`, `dispatcher` | ✅ YES (Takes `resolution_note`) |

## 6. Actual Charging APIs
| Feature | Endpoint | Method | Role Required | Available? |
|---------|----------|--------|---------------|------------|
| **Public Charging List**| `/api/public/charging-centers`| `GET` | None (Public) | ✅ YES |
| **Dept Specific Chargers**| N/A | `GET` | All Operator Roles | ❌ **BACKEND API NOT AVAILABLE** (Only public endpoints exist) |

## 7. Actual Trip APIs
| Feature | Endpoint | Method | Role Required | Available? |
|---------|----------|--------|---------------|------------|
| **List Dept Trips** | N/A | `GET` | All Operator Roles | ❌ **BACKEND API NOT AVAILABLE** (Model exists in DB, but no API exposed) |

## 8. Actual Analytics APIs
| Feature | Endpoint | Method | Role Required | Available? |
|---------|----------|--------|---------------|------------|
| **Dept KPIs & Charts** | N/A | `GET` | `analyst`, `dept_admin` | ❌ **BACKEND API NOT AVAILABLE** (Must compute KPIs client-side from vehicles/alerts list) |

## 9. Actual User/Team APIs
| Feature | Endpoint | Method | Role Required | Available? |
|---------|----------|--------|---------------|------------|
| **List Dept Team** | `/api/operator/users` | `GET` | `department_admin` | ❌ **BACKEND API NOT AVAILABLE** (`/api/admin/users` requires `platform_admin`) |
| **Invite Team Member** | `/api/operator/users/invite`| `POST` | `department_admin` | ❌ **BACKEND API NOT AVAILABLE** (`/api/admin/users/invite` requires `platform_admin`) |

## 10. Actual WebSocket Endpoint
| Protocol | Endpoint | Auth | Purpose | Available? |
|----------|----------|------|---------|------------|
| **WS** | `/ws/operator?token=<jwt>` | JWT Query Param | Streams realtime telemetry updates and alerts | ✅ YES |

---

## 11. Actual Roles Implemented
The `UserRole` enum (`backend/app/models/user.py`) defines:
- `platform_admin`
- `department_admin`
- `dispatcher`
- `analyst`
- `maintenance`

**Constraint Note:** `backend/app/api/operator.py` allows ALL the above roles (except `platform_admin`) to access operator endpoints. However, it restricts alert acknowledgment to `platform_admin`, `department_admin`, and `dispatcher`. 

## 12. Actual Response Schemas
Key schemas returned to the frontend:
- **`VehicleWithTelemetryResponse`**: `{ id, vehicle_code, vehicle_type, department_id, is_active, latitude, longitude, speed_kph, heading_deg, soc_pct, estimated_range_km, charging, connectivity_status, last_seen }` (Flat structure).
- **`AlertResponse`**: `{ id, vehicle_id, alert_type, severity, status, first_seen, last_seen, acknowledged_by, acknowledged_at, resolution_note, metadata, created_at, updated_at }`.

## 13. Department Isolation Implementation
Isolation is enforced centrally on the backend in `backend/app/core/dependencies.py` via `get_department_scope`:
```python
async def get_department_scope(current_user: User = Depends(get_current_user)) -> Optional[uuid.UUID]:
    if current_user.role == UserRole.PLATFORM_ADMIN:
        return None  # No scope restriction
    if current_user.department_id is None:
        raise HTTPException(...)
    return current_user.department_id
```
Every endpoint in `operator.py` takes `dept_scope` and passes it to the database query logic (`get_vehicles_with_telemetry`, `get_alerts_for_scope`), securely restricting the data. The WebSocket also scopes broadcasts to `_department_connections[department_id]`. **The frontend simply needs to pass the JWT, and the backend guarantees data isolation.**

## 14. APIs Missing for this Dashboard
The following requested features **cannot be implemented** as actual server-backed features because the APIs do not exist:
1. **Analytics/KPIs API**: The dashboard overview will need to calculate metrics (Active/Charging/Offline counts) locally by iterating the `GET /vehicles` array.
2. **Trips API**: Page 7 (Trips) must display an empty state ("Trip analytics will become available when trip data is enabled").
3. **Team Management API**: Page 10 (Team) cannot be built for `department_admin`. The backend strictly restricts user reading/inviting to `platform_admin`. 
4. **Maintenance Diagnostics API**: Page 9 (Maintenance) cannot display DTCs or firmware details, as these aren't returned in the vehicle endpoint.

## 15. Backend Limitations Affecting the Dashboard
- **No Pagination Envelope**: Endpoints like `/api/operator/vehicles` return raw arrays `[...]`, not paginated objects `{ items: [...], total: X }`. The frontend must not expect a `.items` property.
- **Team Management Blocked**: A Department Admin cannot currently manage their own staff. 
- **Analytics Computed Locally**: We will derive the overview charts from the raw arrays of vehicles and alerts.

---

## Proposed Frontend Architecture & Page Structure

### Architecture
- **Framework**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **State/Caching**: TanStack Query v5 + Axios (with token refresh interceptor)
- **Realtime**: Native WebSocket with exponential backoff and auth connection string
- **Mapping**: MapLibre GL JS (no API keys, pure OSM tiles)
- **Routing**: React Router v7

### Page Structure (Filtered by available APIs)
1. `/login` — Standard login flow with JWT storage
2. `/` (Overview) — Dashboard calculating local KPIs from `/vehicles` and `/alerts`
3. `/live` (Live Fleet) — Real-time MapLibre view listening to WebSocket
4. `/vehicles` — Tabular list of department vehicles
5. `/vehicles/:id` — Detail view with telemetry and historical track map
6. `/alerts` — Alert queue with acknowledge capabilities
7. `/charging` — Public charging locations (read-only)
8. `/trips` — Clean empty state (API missing)
9. `/analytics` — Local derivations of fleet utilization (API missing)
10. `/profile` — Basic info from `/api/auth/me`

*(Note: `/team` and `/maintenance` are omitted as no backing APIs exist for operators).*
