# FLEETIQ PUBLIC WEBSITE AUDIT

**Target Platform:** FleetIQ / URJA Government EV Fleet Intelligence Platform  
**Audit Scope:** Public Website, Design System, Landing Page, Map Infrastructure, Telemetry, and FastAPI Backend  
**Status Taxonomy:** `PROVEN` | `PARTIAL` | `MISSING` | `BROKEN` | `NOT VERIFIABLE`  
**Date:** August 31, 2026

---

## Executive Summary

FleetIQ is a unified public mobility and government EV intelligence platform. The primary goal of the public website is to provide citizens, commuters, EV drivers, and visitors with instant, zero-friction access to public mobility services (Where Is My Bus?, Live Bus Tracking, Charging Centers, Help & Emergency, and City Network) **without requiring login or authentication**. Authentication is strictly reserved for authorized Charging Center Operators and Platform Administrators.

This audit evaluates the current state of the backend APIs, data models, design tokens, landing page implementation, and map capabilities to lay the ground for building the full public portal.

---

## A. What Already Exists

| Component / Capability | Status | Source Evidence | Details |
|---|---|---|---|
| **Design Tokens & System Specification** | `PROVEN` | `DESIGN.md`, `stitch_extracted/code.html` | Institutional Progress theme with full color tokens (`#006A3B` Primary, `#268451` Primary Container, `#1B4D3E` Dark Emerald, `#F8F9FA` Surface, `#BA1A1A` Error), 8px grid spacing, and Plus Jakarta Sans / Inter / Work Sans typography. |
| **Landing Page Visual Architecture** | `PROVEN` | `stitch_extracted/code.html`, `stitch_extracted/screen.png` | Fully styled government landing page featuring Sticky Header with Brand, Hero with CTAs and key metrics, Mission/About section, National Impact stats, Public Service Grid (Buses, Ambulances, Fire Services, Accessible Mobility, Government Cars, Charging Stations), Citizen & Fleet Mobile App banner, Latest News cards, and 4-column Institutional Footer. |
| **City & State Data Model & Seed Data** | `PROVEN` | `app/models/city.py`, `backend/scripts/seed_public_data.py` | `City` entity supporting name, state, geo-coordinates, and active status. Pre-seeded with Bikaner, Jaipur, Jodhpur, Udaipur, and Delhi. |
| **Charging Centers Model & CRUD APIs** | `PROVEN` | `app/models/charging_center.py`, `app/api/public.py`, `app/api/charging_operator.py` | Full charging center entity with geo-coordinates, power (kW), connector types (CCS2, Type2, GB/T, Bharat DC), operating hours, verified phone contacts, amenities JSONB, and public visibility flags. Public directory API and operator update API are active. |
| **Bus Routes & Stops Data Models** | `PROVEN` | `app/models/route.py`, `app/models/stop.py`, `app/models/route_stop.py`, `app/models/vehicle_route.py` | Relational schema for routes, stops, sequence-ordered stop stops (`RouteStop`), and active vehicle route assignments (`VehicleRoute`). Pre-seeded with 4 transit lines (Red Line 1, Green Line 2, Blue Line 3, Yellow Line 4) and 16 major stops. |
| **Public Route & Stop APIs** | `PROVEN` | `app/api/public.py`, `app/services/public_data_service.py` | `GET /api/public/routes`, `GET /api/public/routes/{id}`, `GET /api/public/stops`, `GET /api/public/stops/{id}` returning structured route lines and stop sequences. |
| **Public Help & Emergency Contacts Model & API** | `PROVEN` | `app/models/help_contact.py`, `app/api/public.py` | `HelpContact` model supporting transport helpline, charging emergency, hospital ambulance dispatch, and traffic police control room with verified contact details. |
| **Sanitized Public Vehicle API** | `PROVEN` | `app/api/public.py`, `app/services/public_data_service.py` | `GET /api/public/vehicles` removes sensitive internal telemetry (driver name, driver phone, device IMEI, registration number, DTC codes, CAN bus diagnostics) and provides sanitized coordinates, speed, and SoC. |
| **Charging Center Operator Authentication & Role Support** | `PROVEN` | `app/models/user.py`, `app/models/charging_center_operator.py`, `app/api/charging_operator.py` | `CHARGING_CENTER_OPERATOR` role with JWT auth, assigned stations lookup, and PATCH endpoint to update station availability and power specifications. |

---

## B. What Can Be Reused

1. **Brand Assets & Visual Tokens**:
   - Institutional typography stack: Plus Jakarta Sans, Inter, Work Sans.
   - Material Symbols Outlined icon library integration.
   - Tailwind theme configuration containing all exact color variables, radius tokens, and spacing rhythms from `DESIGN.md`.
2. **Landing Page Structure & Copy**:
   - Complete Header, Hero, Mission, National Impact, 6 Public Service Cards, Citizen Mobile App section, News Feed, and Footer from `stitch_extracted/code.html`.
3. **MapLibre GL Open-Source GIS Setup**:
   - MapLibre GL with OpenStreetMap raster and vector tile specification (zero API key dependency, fast rendering, zero watermarks).
   - Haversine distance formula for "Near Me" radius calculations.
4. **FastAPI Backend Services**:
   - `public_data_service.py` functions for filtering charging centers by distance radius, fetching routes with ordered stops, and retrieving city-level emergency contacts.
   - `auth_service.py` for token issuance, bcrypt verification, and role-based access control.

---

## C. What Is Incomplete

| Area | Status | Gap Details |
|---|---|---|
| **Public WebSocket Feed** | `PARTIAL` | `app/websocket/public_routes.py` exists but polls the database every 5 seconds. It does not provide sub-second smooth vehicle interpolation metadata or numerical `heading_deg` for bus marker rotation. |
| **Bus Search & Filter by Route / Code** | `PARTIAL` | `GET /api/public/vehicles` does not currently filter vehicles by assigned `route_id` or query by bus code / destination in SQL. |
| **Public Vehicle Response Fields** | `PARTIAL` | `VehiclePublicResponse` lacks `heading_deg` (only has cardinal string `direction`), `vehicle_code` (e.g. `BUS-101`), `route_id`, `route_name`, `destination`, and `last_updated_at` timestamp. |
| **City Selector State Persistence** | `PARTIAL` | City selector exists conceptually in the backend (`/api/public/cities`), but client-side context for remembering the user's selected city across services needs to be implemented. |

---

## D. What Is Missing

| Feature | Status | Details |
|---|---|---|
| **Frontend Public Portal Pages** | `MISSING` | The old frontend was deleted as requested. A brand-new, modern TypeScript/Vite/React frontend matching the `DESIGN.md` design system needs to be built with pages: Home, Services, Where Is My Bus?, Charging Centers, City Portal, Help & Emergency, Vehicles, Network, Resources, Operator Login, and Charging Operator Portal. |
| **Reusable Public Map Component System** | `MISSING` | Unified Map system featuring `MapContainer`, `VehicleMarker`, `ChargingMarker`, `StopMarker`, `RouteLayer`, `MarkerCluster`, `MapControls`, `LocationButton`, and `SelectedEntityPanel`. |
| **Accessible Alternative Views (List / Grid)** | `MISSING` | Toggleable accessible list views alongside map views for both bus tracking and charging center discovery. |
| **Stale Telemetry Indication** | `MISSING` | Visual badge distinguishing "LIVE (< 15s ago)" vs "Last updated X min ago" vs "Stationary / Offline". |

---

## E. What Backend APIs Exist

- `GET /api/public/charging-centers` (Query params: `search`, `city`, `state`, `lat`, `lng`, `radius_km`, `skip`, `limit`)
- `GET /api/public/charging-centers/{id}`
- `POST /api/public/charging-centers/register`
- `GET /api/public/states`
- `GET /api/public/cities` (Query param: `state`)
- `GET /api/public/vehicles` (Query params: `vehicle_type`, `city`, `skip`, `limit`)
- `GET /api/public/vehicles/{id}`
- `GET /api/public/routes` (Query param: `city`)
- `GET /api/public/routes/{id}`
- `GET /api/public/stops` (Query param: `city`)
- `GET /api/public/stops/{id}`
- `GET /api/public/help-contacts` (Query params: `city`, `state`, `category`)
- `WS /ws/public/vehicles` (Query params: `city`, `vehicle_type`)
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/charging-operator/stations`
- `GET /api/charging-operator/stations/{id}`
- `PATCH /api/charging-operator/stations/{id}`

---

## F. What Backend APIs Are Missing / Need Enhancement

1. **`GET /api/public/vehicles` Enhancement**: Add optional `route_id`, `search`, and join with `VehicleRoute` and `Route` to return `route_code`, `route_name`, `destination`, `heading_deg`, and `last_updated_at`.
2. **`GET /api/public/routes/{id}/buses`**: Convenience endpoint to retrieve all active buses currently assigned to and operating along a specific route.
3. **`GET /api/public/stops/{id}/buses`**: Convenience endpoint to retrieve incoming buses for a specific stop with estimated distance/arrival.

---

## G. What Design-System Components Already Exist

From `stitch_extracted/code.html` and `DESIGN.md`:
- **Colors**: Primary Green `#006A3B`, Primary Container `#268451`, Deep Institutional Green `#1B4D3E`, Soft Mint `#BAEED9`, Surface Low `#F3F4F5`, Surface Lowest `#FFFFFF`, Outline `#6F7A70`, Outline Variant `#BECABE`, Error `#BA1A1A`.
- **Typography Classes**: Display Large (48px/800), Headline Medium (36px/700), Headline Small (24px/700), Body Large (18px/400), Body Medium (16px/400), Label Bold (14px/700), Label Small (12px/500).
- **Surface Elevation**: Low-contrast outlines (1px `#BECABE`/`#6F7A70`), subtle soft shadows (0px 4px 20px rgba(0,0,0,0.05)), tonal layering.
- **Button Variants**: Primary Solid, Secondary Outlined/Ghost, Tertiary Link with trailing chevron/arrow.
- **Cards**: Flat white containers with 1px border, 8px/12px border radius, top badges, and hover lift.

---

## H. What Pages Already Exist vs Need Creation

| Page | Status | Action Needed |
|---|---|---|
| **Landing Page (Home)** | `PROVEN` in stitch HTML | Recreate in React + TypeScript with zero visual regression from `stitch_extracted/code.html` |
| **Public Service Hub (`/services`)** | `MISSING` in frontend | Create dedicated public service overview with deep links |
| **Where Is My Bus? (`/bus`, `/bus/:id`)** | `MISSING` in frontend | Create interactive search, route selector, live bus tracking map, stop picker, and buses near me |
| **Charging Centers (`/charging`, `/charging/:id`)** | `MISSING` in frontend | Create charging map, station list, connector filter, fast DC filter, and station detail drawer/modal |
| **Help & Emergency (`/help`)** | `MISSING` in frontend | Create categorized help cards backed by `/api/public/help-contacts` |
| **City Portal (`/city`, `/city/:cityName`)** | `MISSING` in frontend | Create city-aware hub (Bikaner, Jaipur, Jodhpur, etc.) filtering local transport & charging |
| **Mobility Network (`/network`)** | `MISSING` in frontend | Create public network coverage overview |
| **Vehicles Overview (`/vehicles`)** | `MISSING` in frontend | Create public-safe fleet overview |
| **Resources & FAQ (`/resources`, `/about`)** | `MISSING` in frontend | Create informative citizen guides, policies, and transparency details |
| **Operator Login (`/login`)** | `MISSING` in frontend | Create JWT auth login for charging center operators |
| **Charging Operator Management (`/charging/operator`)** | `MISSING` in frontend | Create restricted operator dashboard to update station power, status, hours, and connectors |

---

## I. What Map Functionality Already Exists vs Missing

- **MapLibre GL JS Integration**: Proven open-source solution with OpenStreetMap tiles.
- **Vehicle Markers**: Need directional arrows oriented by `heading_deg`, color-coded status badges, and smooth interpolation.
- **Charging Station Markers**: Need icon differentiation for Fast DC (60kW+) vs AC, operational status indicators, and clustering.
- **Route Polyline Rendering**: Supported via GeoJSON route line overlay on MapLibre.
- **Stop Markers**: Sequence numbered pins along active route paths.
- **Geolocation**: Browser `navigator.geolocation` with fallback to manual city/search selection.

---

## J. What Should Be Improved

1. **Frontend Architecture**: Build a blazing-fast React 18 + Vite + TypeScript application with Tailwind CSS configured with the exact design tokens from `DESIGN.md`.
2. **Zero Fake Data Policy**: Connect all frontend components directly to the running FastAPI backend endpoints. If an entity has no data for a selected filter, display a structured, honest empty state.
3. **Public Privacy Protection**: Verify that no private fleet identifiers, CAN diagnostics, driver names, or unapproved vehicle locations are transmitted.
4. **Cross-Device Responsiveness & A11y**: Ensure Desktop (side-panel + map) and Mobile (bottom sheet + map) layouts are responsive, with full keyboard navigation and accessible list-view alternatives.

---
