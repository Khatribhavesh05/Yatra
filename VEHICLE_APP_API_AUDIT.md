# VEHICLE_APP_API_AUDIT.md
## Vehicle / Driver Mobile App — Backend API Audit

This audit evaluates the actual FastAPI backend implementation (`backend/app/`) against the requirements for the **Vehicle / Driver Mobile App** in the Government EV Fleet Intelligence Platform.

**Status Legend:**
- **`PROVEN`**: Fully implemented in backend routes, schemas, database models, and service layer.
- **`PARTIAL`**: Endpoint exists but has functional limitations or lacks specific driver/operator fields.
- **`MISSING`**: Feature is not exposed via an API endpoint (`BACKEND API NOT AVAILABLE`).
- **`NOT VERIFIABLE`**: Cannot be verified from backend codebase alone.

---

### API Audit Matrix

| Feature | Actual Endpoint | Method | Auth | Role | Request | Response | Status |
|---|---|---|---|---|---|---|---|
| **User Login** | `/api/auth/login` | `POST` | None | Public | `LoginRequest` (`email`, `password`) | `TokenResponse` (`access_token`, `refresh_token`, `token_type`) | **PROVEN** |
| **Token Refresh** | `/api/auth/refresh` | `POST` | None | Public | `RefreshRequest` (`refresh_token`) | `TokenResponse` (`access_token`, `refresh_token`, `token_type`) | **PROVEN** |
| **Get Current User Info** | `/api/auth/me` | `GET` | Bearer JWT | Authenticated | None | `UserMeResponse` (`id`, `email`, `full_name`, `role`, `department_id`, `department_name`, `is_active`) | **PROVEN** |
| **List Scoped Vehicles** | `/api/operator/vehicles` | `GET` | Bearer JWT | `platform_admin`, `department_admin`, `dispatcher`, `analyst`, `maintenance` | Query: `limit`, `offset` (Scoped to user's `department_id`) | `list[VehicleWithTelemetryResponse]` (raw array) | **PROVEN** |
| **Get Vehicle Details** | `/api/operator/vehicles/{vehicle_id}` | `GET` | Bearer JWT | `platform_admin`, `department_admin`, `dispatcher`, `analyst`, `maintenance` | Path: `vehicle_id` (Scoped to user's `department_id`) | `VehicleWithTelemetryResponse` | **PROVEN** |
| **Get Vehicle Track (Historical)** | `/api/operator/vehicles/{vehicle_id}/track` | `GET` | Bearer JWT | `platform_admin`, `department_admin`, `dispatcher`, `analyst`, `maintenance` | Path: `vehicle_id`, Query: `limit` (Scoped to `department_id`) | `list[dict]` (`observed_at`, `latitude`, `longitude`, `speed_kph`, `soc_pct`, `heading_deg`) | **PROVEN** |
| **List Alerts** | `/api/operator/alerts` | `GET` | Bearer JWT | `platform_admin`, `department_admin`, `dispatcher`, `analyst`, `maintenance` | Query: `status_filter`, `limit`, `offset` (Scoped to `department_id`) | `list[AlertResponse]` | **PROVEN** |
| **Acknowledge Alert** | `/api/operator/alerts/{alert_id}/ack` | `POST` | Bearer JWT | `platform_admin`, `department_admin`, `dispatcher` (Note: `analyst` & `maintenance` forbidden) | Path: `alert_id`, Body: `AlertAckRequest` (`resolution_note`) | `AlertResponse` | **PROVEN** |
| **Ingest Telemetry (Device/App Gateway)** | `/api/ingest/telemetry` | `POST` | None (Device Code validation) | Open / Gateway | `TelemetryIngestPayload` (`device_id`, `vehicle_id`, `event_id`, `observed_at`, `location`, `motion`, `energy`, `diagnostics`, `connectivity`, `seq`) | `TelemetryIngestResponse` (`status`: "accepted"/"duplicate"/"rejected", `event_id`, `flags`, `message`) | **PROVEN** |
| **Realtime Operator WebSocket** | `/ws/operator` | `WS` | JWT Query Param (`?token=...`) | Any Authenticated Operator | `token=<jwt_access_token>` | JSON Stream: `{"type": "telemetry_update", "data": ...}` & `{"type": "alert", "data": ...}` | **PROVEN** |
| **Public Charging Centers** | `/api/public/charging-centers` | `GET` | None | Public | None | `list[ChargingCenterPublicResponse]` (`id`, `name`, `latitude`, `longitude`, `connectors`, `power_kw`) | **PROVEN** |
| **Public Vehicles List** | `/api/public/vehicles` | `GET` | None | Public | None | `list[VehiclePublicResponse]` (Sanitized approximate data) | **PROVEN** |
| **Driver Vehicle Assignment** | N/A | N/A | N/A | N/A | N/A | BACKEND API NOT AVAILABLE | **MISSING** |
| **Driver Profile Update** | N/A | N/A | N/A | N/A | N/A | BACKEND API NOT AVAILABLE | **MISSING** |
| **Trip List / Active Trip** | N/A | N/A | N/A | N/A | N/A | BACKEND API NOT AVAILABLE (Database model `Trip` exists, but no endpoints in `api/`) | **MISSING** |
| **Start Trip Control** | N/A | N/A | N/A | N/A | N/A | BACKEND API NOT AVAILABLE | **MISSING** |
| **End Trip Control** | N/A | N/A | N/A | N/A | N/A | BACKEND API NOT AVAILABLE | **MISSING** |
| **Vehicle Diagnostic Trouble Codes (Detailed)** | N/A | N/A | N/A | N/A | N/A | BACKEND API NOT AVAILABLE (Only ingest accepts DTCs; `VehicleWithTelemetryResponse` does not include DTCs) | **PARTIAL** |
| **Dynamic Device Registration for Operator** | `/api/admin/devices` | `POST` | Bearer JWT | `platform_admin` ONLY | `DeviceCreate` (`device_code`, `vehicle_id`, `firmware_version`) | `DeviceResponse` | **PARTIAL** |
| **Geofence Query Endpoint for Operator** | N/A | N/A | N/A | N/A | N/A | BACKEND API NOT AVAILABLE (Model exists, alert triggers on breach, but no read endpoint in `operator.py`) | **MISSING** |
| **Offline Sync / Bulk Ingest** | `/api/ingest/telemetry` | `POST` | None | Open / Gateway | Individual payload with unique `event_id` | Deduplication via `status="duplicate"` | **PARTIAL** |
