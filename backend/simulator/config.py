from dataclasses import dataclass, field

BACKEND_URL = "http://localhost:8000"
INGEST_ENDPOINT = f"{BACKEND_URL}/api/ingest/telemetry"
INTERVAL_SECONDS = 4  # Telemetry send interval


@dataclass
class VehicleConfig:
    vehicle_code: str
    device_code: str
    department: str  # department code
    vehicle_type: str
    route_index: int = 0  # Which predefined route to follow


# 15 vehicles across 3 departments
VEHICLES: list[VehicleConfig] = [
    # Transport / Bus Department (6 buses)
    VehicleConfig("bus-001", "dev-bus-001", "TRANSPORT", "electric_bus", 0),
    VehicleConfig("bus-002", "dev-bus-002", "TRANSPORT", "electric_bus", 1),
    VehicleConfig("bus-003", "dev-bus-003", "TRANSPORT", "electric_bus", 2),
    VehicleConfig("bus-004", "dev-bus-004", "TRANSPORT", "electric_bus", 0),
    VehicleConfig("bus-005", "dev-bus-005", "TRANSPORT", "electric_bus", 1),
    VehicleConfig("bus-006", "dev-bus-006", "TRANSPORT", "electric_bus", 2),
    # Fire Department (4 vehicles)
    VehicleConfig("fire-001", "dev-fire-001", "FIRE", "fire_ev", 3),
    VehicleConfig("fire-002", "dev-fire-002", "FIRE", "fire_ev", 4),
    VehicleConfig("fire-003", "dev-fire-003", "FIRE", "fire_ev", 3),
    VehicleConfig("fire-004", "dev-fire-004", "FIRE", "fire_ev", 4),
    # Electricity Department (5 utility vehicles)
    VehicleConfig("util-001", "dev-util-001", "ELECTRICITY", "utility_ev", 5),
    VehicleConfig("util-002", "dev-util-002", "ELECTRICITY", "utility_ev", 6),
    VehicleConfig("util-003", "dev-util-003", "ELECTRICITY", "utility_ev", 5),
    VehicleConfig("util-004", "dev-util-004", "ELECTRICITY", "utility_ev", 6),
    VehicleConfig("util-005", "dev-util-005", "ELECTRICITY", "utility_ev", 5),
    # Jaipur fleet (6 vehicles)
    VehicleConfig("bus-007", "dev-bus-007", "Jaipur Transport", "electric_bus", 7),
    VehicleConfig("bus-008", "dev-bus-008", "Jaipur Transport", "electric_bus", 8),
    VehicleConfig("bus-009", "dev-bus-009", "Jaipur Transport", "electric_bus", 9),
    VehicleConfig("bus-010", "dev-bus-010", "Jaipur Transport", "electric_bus", 7),
    VehicleConfig("fire-005", "dev-fire-005", "Jaipur Fire Service", "fire_ev", 9),
    VehicleConfig("fire-006", "dev-fire-006", "Jaipur Fire Service", "fire_ev", 9),

    # Jodhpur fleet (3 vehicles)
    VehicleConfig("bus-011", "dev-bus-011", "Jodhpur Transport", "electric_bus", 10),
    VehicleConfig("bus-012", "dev-bus-012", "Jodhpur Transport", "electric_bus", 11),
    VehicleConfig("util-006", "dev-util-006", "Jodhpur Utilities", "utility_ev", 10),

    # Udaipur fleet (3 vehicles)
    VehicleConfig("bus-013", "dev-bus-013", "Udaipur Transport", "electric_bus", 12),
    VehicleConfig("bus-014", "dev-bus-014", "Udaipur Transport", "electric_bus", 13),
    VehicleConfig("fire-007", "dev-fire-007", "Udaipur Fire Service", "fire_ev", 12),

    # Bikaner fleet (2 vehicles)
    VehicleConfig("bus-015", "dev-bus-015", "Bikaner Transport", "electric_bus", 14),
    VehicleConfig("util-007", "dev-util-007", "Bikaner Utilities", "utility_ev", 15),
]
