# PUBLIC WEBSITE BACKEND GAPS

This document outlines the specific capabilities, endpoint enhancements, and data model extensions required to support the complete, production-grade FleetIQ Public Website while upholding strict government privacy and security standards.

---

## Gap 1: Public Bus Search & Route-Vehicle Association

### Missing Capability
`GET /api/public/vehicles` currently filters only by `vehicle_type` and has an unused `city` query parameter. It does not return the assigned route code/name, destination, or current heading degree (`heading_deg`), nor does it allow filtering vehicles by `route_id` or searching by bus number/destination.

### Why Required
The "Where Is My Bus?" service allows citizens to select a City, choose a Route or Bus Number, and track active buses on that route in real-time. Without route association in the public vehicle schema, the frontend cannot associate moving buses with their route polylines and destinations.

### Suggested Endpoint & Schema Enhancement
Update `GET /api/public/vehicles`:
- Support query parameters: `city: Optional[str]`, `route_id: Optional[uuid.UUID]`, `search: Optional[str]`.
- Enhance `VehiclePublicResponse` schema:
```python
class VehiclePublicResponse(BaseModel):
    id: uuid.UUID
    vehicle_code: str  # e.g., "BUS-101"
    vehicle_type: str  # "electric_bus"
    department_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    speed_kph: Optional[float] = None
    heading_deg: Optional[float] = None
    direction: Optional[str] = None
    soc_pct: Optional[float] = None
    charging: Optional[bool] = None
    status: Optional[str] = None
    route_id: Optional[uuid.UUID] = None
    route_name: Optional[str] = None
    route_code: Optional[str] = None
    last_updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
```

### Suggested Database & Service Change
In `app/services/public_data_service.py`:
- Outer join `VehicleRoute` and `Route` when fetching public electric buses.
- Pull `telemetry.heading_deg` and `telemetry.last_seen` into the public response.

### Security Implications
Zero private data is exposed. Driver names, phones, internal telemetry payload, CAN bus data, and registration numbers remain strictly excluded.

---

## Gap 2: High-Precision Bus Realtime Stream & Heading

### Missing Capability
`WS /ws/public/vehicles` broadcasts sanitized vehicles by polling the database every 5 seconds. It does not broadcast the numerical `heading_deg` or `last_updated_at` timestamps.

### Why Required
Map markers require exact `heading_deg` to rotate vehicle directional arrows correctly along road vectors, and timestamps to detect stale signals (e.g. "Last updated 3 min ago").

### Suggested WebSocket Enhancement
- Broadcast the updated `VehiclePublicResponse` payload including `heading_deg` and `last_updated_at`.
- Support client subscription filters via query parameters (`?city=Bikaner&vehicle_type=electric_bus&route_id=...`).

### Security Implications
The public WebSocket continues to use the sanitized public serialization layer. No privileged operator channels or sensitive government fleet telemetry are ever connected to public sockets.

---

## Gap 3: Route Stops with Ordered Geometry

### Missing Capability
`Route` geometry field is currently a generic `JSONB`. When routes are seeded without pre-calculated GeoJSON coordinates, route lines on the map need to interpolate between stop coordinates.

### Why Required
To draw crisp, professional route lines on the transit map when a citizen clicks on a route (e.g. Line 1 Red corridor), the frontend needs either explicit GeoJSON `geometry` or sequential stop coordinates.

### Suggested Solution
- In `GET /api/public/routes/{id}`, ensure `stops` array is always sorted by `RouteStop.sequence` ascending.
- If `Route.geometry` is present, return it; otherwise synthesize a clean LineString GeoJSON connecting the stop coordinates in order.

---

## Gap 4: Stale Telemetry & Offline State Detection

### Missing Capability
The backend does not explicitly flag whether a public vehicle is currently in active service vs parked in depot with stale GPS.

### Why Required
Citizens should never see a static bus icon marked as "LIVE" if its last GPS ping was 20 minutes ago.

### Suggested Solution
- Add a derived `is_stale: bool` or calculate time difference `(current_time - last_seen)` to output `connectivity_status: "live" | "delayed" | "stale" | "offline"`.

---

## Summary of Database Schema Status

| Table / Entity | Exists in DB? | Action Required |
|---|---|---|
| `cities` | Yes | Ready |
| `routes` | Yes | Ready |
| `stops` | Yes | Ready |
| `route_stops` | Yes | Ready |
| `vehicle_routes` | Yes | Join in `get_public_vehicles` |
| `charging_centers` | Yes | Ready |
| `charging_center_operators` | Yes | Ready |
| `help_contacts` | Yes | Ready |
| `users` | Yes | Ready |
| `vehicles` | Yes | Add `heading_deg` & `last_updated_at` to public response |
