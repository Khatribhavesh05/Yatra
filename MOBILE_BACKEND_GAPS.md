# MOBILE_BACKEND_GAPS.md
## Vehicle / Driver Mobile App — Backend Gap Analysis & Recommendations

This document outlines the gaps between the idealized Vehicle / Driver mobile app requirements and the current FastAPI + Neon PostgreSQL backend, detailing client-side adaptations and recommended backend enhancements.

---

### 1. Vehicle Assignment to Driver / Operator
- **Current Backend Reality:** No `driver_id` or `assigned_user_id` exists on the `Vehicle` model (`models/vehicle.py`), and no assignment relationship exists on the `User` model (`models/user.py`).
- **Client Adaptation:** 
  - After logging in, the mobile app calls `GET /api/operator/vehicles` (which is strictly scoped to the user's department).
  - The operator selects their active vehicle from the department list.
  - The selected vehicle ID is cached securely in local storage (`FlutterSecureStorage` / `SharedPreferences`) for session persistence.
- **Recommended Backend Change:**
  - Add `assigned_user_id: Mapped[UUID | None]` to `vehicles` table or create a `vehicle_assignments` table.
  - Expose `GET /api/operator/my-vehicle` and `POST /api/operator/vehicles/{id}/assign`.

---

### 2. Dedicated "Driver" User Role
- **Current Backend Reality:** `UserRole` enum (`models/user.py`) defines only:
  - `platform_admin`
  - `department_admin`
  - `dispatcher`
  - `analyst`
  - `maintenance`
- **Client Adaptation:**
  - The mobile app adapts dynamically to the authenticated user's actual role returned by `GET /api/auth/me`.
  - Operational capabilities (viewing vehicle metrics, live telemetry, historical tracks) are available to all operator roles.
  - Alert acknowledgment is enabled for `dispatcher`, `department_admin`, and `platform_admin`, but disabled with a permission tooltip for `analyst` and `maintenance` (matching backend RBAC in `operator.py:138`).
- **Recommended Backend Change:**
  - Add `DRIVER = "driver"` to `UserRole` enum and include `UserRole.DRIVER` in `OPERATOR_ROLES` in `backend/app/api/operator.py`.

---

### 3. Trip Management APIs (Start, End, Active Trip)
- **Current Backend Reality:** The `Trip` model exists in `models/trip.py` with full fields (`started_at`, `ended_at`, `start_lat`, `start_lng`, `distance_km`, `start_soc`, `end_soc`, `energy_consumed_kwh`, `status`), but **no REST endpoints exist** in `api/operator.py` or anywhere in the backend for trips.
- **Client Adaptation:**
  - The Trip screen displays a clean empty state: *"Trip tracking is currently unconfigured on the server. Active trip data will appear once enabled."*
  - No fake trip APIs or fake data are simulated.
- **Recommended Backend Change:**
  - Expose `GET /api/operator/vehicles/{id}/trips` (list past/active trips).
  - Expose `POST /api/operator/trips/start` and `POST /api/operator/trips/end`.

---

### 4. Vehicle Diagnostics & Battery Temperature in Operator View
- **Current Backend Reality:**
  - `POST /api/ingest/telemetry` receives `diagnostics.dtcs` (array of error codes) and `diagnostics.battery_temp_c`.
  - `telemetry_latest` stores `dtcs` and `battery_temp_c`.
  - However, `VehicleWithTelemetryResponse` in `app/schemas/vehicle.py` only exposes `latitude`, `longitude`, `speed_kph`, `heading_deg`, `soc_pct`, `estimated_range_km`, `charging`, `connectivity_status`, and `last_seen`.
- **Client Adaptation:**
  - Display available metrics (SoC %, Range, Speed, Heading, Connectivity Status, Last Seen).
  - Display diagnostic status based on active `DIAGNOSTIC_FAULT` and `HIGH_BATTERY_TEMP` alerts received from `GET /api/operator/alerts`.
- **Recommended Backend Change:**
  - Add `battery_temp_c: Optional[float] = None` and `dtcs: Optional[list[str]] = None` to `VehicleWithTelemetryResponse` schema and query.

---

### 5. Charging Center Real-Time Availability
- **Current Backend Reality:**
  - `GET /api/public/charging-centers` returns static metadata: name, lat/lng, connectors (e.g. `{"CCS2": 4}`), power in kW.
  - Real-time occupancy / charger availability is not tracked in the database.
- **Client Adaptation:**
  - Display verified government EV charging centers with locations, connector types, and kW ratings without misleading the driver about real-time occupancy.
- **Recommended Backend Change:**
  - Introduce dynamic availability counters or live telemetry ingestion for EVSE charging stations.

---

### 6. Batch Telemetry Ingestion for Offline Synchronization
- **Current Backend Reality:**
  - `POST /api/ingest/telemetry` accepts one payload per HTTP request.
  - Idempotency is enforced using `(device_id, event_id)` uniqueness.
- **Client Adaptation:**
  - The mobile client queues telemetry events locally when offline and sends them sequentially to `POST /api/ingest/telemetry` once connectivity returns.
- **Recommended Backend Change:**
  - Implement `POST /api/ingest/telemetry/batch` taking `list[TelemetryIngestPayload]` to optimize network bandwidth and reduce HTTP round-trips upon reconnection.

---

### 7. Geofence Operator Endpoint
- **Current Backend Reality:**
  - `Geofence` model exists in `models/geofence.py` and is linked to `Department`.
  - Alerts are generated on `GEOFENCE_BREACH`.
  - However, no GET endpoint exists for operators to view geofence boundaries on a map.
- **Client Adaptation:**
  - Rely on map markers and alert notices when breaches occur.
- **Recommended Backend Change:**
  - Add `GET /api/operator/geofences` scoped to `department_id`.
