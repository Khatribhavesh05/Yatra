# Yatra

Yatra is an EV Fleet Intelligence platform built for Rajasthan government transport departments. It provides real-time bus and vehicle tracking, battery health monitoring, and automated alerts for internal fleet operators, alongside a citizen-facing portal for live bus tracking, EV charging station discovery, and public transit route information.

## Architecture

The repository is a monorepo with four components:

| Folder | Stack | Purpose |
|---|---|---|
| `backend/` | Python (FastAPI) + PostgreSQL/Supabase | Core API: telemetry ingestion, auth/RBAC, alerts, WebSocket updates, and both the internal and public data endpoints. |
| `admin-dashboard/` | React + TypeScript | Internal fleet management console for government staff (department admins, dispatchers, etc.). |
| `frontend/` | React + TypeScript | Public, citizen-facing site — live bus tracking, charging station directory, routes, and help/grievance info. No login required. |
| `chargeease_mobile/` | Flutter | Field operator mobile app for drivers and on-ground fleet staff. *(Folder name is legacy from an earlier project name and will be renamed in a separate pass — the app itself is part of Yatra.)* |

All three frontend clients (`admin-dashboard`, `frontend`, `chargeease_mobile`) talk to the same `backend/` API.

## Getting Started

Each component is set up and run independently. See the sections below, and each folder's own docs where available.

### backend/

Full setup instructions (environment variables, database, migrations/seeding, running the server) are documented in [`backend/README.md`](backend/README.md). Quick version:

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL, JWT secret, etc.
uvicorn app.main:app --reload --port 8000
```

API docs are served at `http://localhost:8000/docs` once running.

### admin-dashboard/

```bash
cd admin-dashboard
npm install
npm run dev
```

Runs on `http://localhost:5174` by default and proxies `/api` and `/ws` requests to the backend on port 8000.

### frontend/

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` by default and proxies `/api` and `/ws` requests to the backend on port 8000.

### chargeease_mobile/

Standard Flutter app setup:

```bash
cd chargeease_mobile
flutter pub get
flutter run
```

Configure the backend API base URL for your target device/emulator inside the app's own config before running.

## Notes

- The `backend/` API is the single source of truth — `admin-dashboard/` and `frontend/` are both thin clients over it (one authenticated/internal, one public), and `chargeease_mobile/` consumes the same API for field operators.
- For deeper technical detail on the backend (architecture diagram, tech stack, RBAC roles, alert types, etc.), see [`backend/README.md`](backend/README.md).
