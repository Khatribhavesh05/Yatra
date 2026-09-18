import math
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import joinedload
from app.models.vehicle import Vehicle, VehicleType
from app.models.telemetry import TelemetryLatest
from app.models.department import Department
from app.models.charging_center import ChargingCenter, ChargingCenterStatus
from app.models.city import City
from app.models.route import Route
from app.models.stop import Stop
from app.models.route_stop import RouteStop
from app.models.vehicle_route import VehicleRoute
from app.models.help_contact import HelpContact
from app.models.grievance import Grievance
from app.schemas.vehicle import VehiclePublicResponse
from app.schemas.charging_center import ChargingCenterPublicResponse, ChargingCenterDetailResponse
from app.schemas.city import CityResponse, StateResponse
from app.schemas.route import RouteResponse, RouteDetailResponse, StopResponse, StopDetailResponse
from app.schemas.help_contact import HelpContactResponse
from app.schemas.grievance import GrievanceResponse

def _round_coordinate(value: float, decimals: int = 3) -> float:
    return round(value, decimals)

def _heading_to_direction(heading: float | None) -> str | None:
    if heading is None:
        return None
    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    index = round(heading / 45) % 8
    return directions[index]

def haversine_distance(lat1, lng1, lat2, lng2):
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.asin(math.sqrt(a))

async def get_public_charging_centers(
    db: AsyncSession, search: str = None, city: str = None, state: str = None,
    lat: float = None, lng: float = None, radius_km: float = 10.0,
    skip: int = 0, limit: int = 50
) -> list[ChargingCenterPublicResponse]:
    query = select(ChargingCenter).where(ChargingCenter.public_visible == True)
    if city:
        query = query.where(ChargingCenter.city == city)
    if state:
        query = query.where(ChargingCenter.state == state)
    if search:
        search_pattern = f"%{search}%"
        query = query.where(or_(
            ChargingCenter.name.ilike(search_pattern),
            ChargingCenter.city.ilike(search_pattern)
        ))
    
    result = await db.execute(query)
    centers = result.scalars().all()
    
    if lat is not None and lng is not None:
        centers = [c for c in centers if haversine_distance(lat, lng, c.latitude, c.longitude) <= radius_km]
    
    centers = centers[skip:skip+limit]
    
    return [ChargingCenterPublicResponse.model_validate(c) for c in centers]

async def get_public_charging_center_by_id(db: AsyncSession, id: uuid.UUID) -> ChargingCenterDetailResponse | None:
    c = await db.get(ChargingCenter, id)
    if not c or not c.public_visible:
        return None
    return ChargingCenterDetailResponse.model_validate(c)

async def get_public_states(db: AsyncSession) -> list[StateResponse]:
    query = select(City.state, func.count(City.id)).where(City.is_active == True).group_by(City.state)
    res = await db.execute(query)
    return [StateResponse(state=r[0], city_count=r[1]) for r in res.all()]

async def get_public_cities(db: AsyncSession, state: str = None) -> list[CityResponse]:
    query = select(City).where(City.is_active == True)
    if state:
        query = query.where(City.state == state)
    res = await db.execute(query)
    return [CityResponse.model_validate(c) for c in res.scalars().all()]

async def get_public_vehicles(
    db: AsyncSession,
    vehicle_type: str = None,
    city: str = None,
    route_id: uuid.UUID = None,
    search: str = None,
    skip: int = 0,
    limit: int = 50
) -> list[VehiclePublicResponse]:
    query = (
        select(Vehicle, TelemetryLatest, Department, Route)
        .outerjoin(TelemetryLatest, Vehicle.id == TelemetryLatest.vehicle_id)
        .join(Department, Vehicle.department_id == Department.id)
        .outerjoin(VehicleRoute, (Vehicle.id == VehicleRoute.vehicle_id) & (VehicleRoute.is_active == True))
        .outerjoin(Route, VehicleRoute.route_id == Route.id)
        .where(Vehicle.is_active == True, Vehicle.public_visible == True)
    )
    if vehicle_type:
        query = query.where(Vehicle.vehicle_type == vehicle_type)
    if route_id:
        query = query.where(VehicleRoute.route_id == route_id)
    if city:
        query = query.where(or_(Route.city == city, Route.city.is_(None)))
    if search:
        search_pat = f"%{search}%"
        query = query.where(or_(
            Vehicle.vehicle_code.ilike(search_pat),
            Route.name.ilike(search_pat),
            Route.code.ilike(search_pat)
        ))
    
    result = await db.execute(query.offset(skip).limit(limit))
    rows = result.all()
    
    public_vehicles = []
    for vehicle, telemetry, department, route in rows:
        public_vehicles.append(VehiclePublicResponse(
            id=vehicle.id,
            vehicle_code=vehicle.vehicle_code,
            vehicle_type=vehicle.vehicle_type.value,
            department_name=department.name,
            latitude=_round_coordinate(telemetry.latitude) if telemetry and telemetry.latitude else None,
            longitude=_round_coordinate(telemetry.longitude) if telemetry and telemetry.longitude else None,
            speed_kph=round(telemetry.speed_kph) if telemetry and telemetry.speed_kph else None,
            heading_deg=telemetry.heading_deg if telemetry else None,
            direction=_heading_to_direction(telemetry.heading_deg) if telemetry else None,
            soc_pct=round(telemetry.soc_pct) if telemetry and telemetry.soc_pct is not None else None,
            charging=telemetry.charging if telemetry else None,
            status=telemetry.connectivity_status if telemetry and telemetry.connectivity_status else "unknown",
            route_id=route.id if route else None,
            route_name=route.name if route else None,
            route_code=route.code if route else None,
            last_updated_at=telemetry.observed_at if telemetry else None,
        ))
    return public_vehicles

async def get_public_vehicle_by_id(db: AsyncSession, id: uuid.UUID) -> VehiclePublicResponse | None:
    query = (
        select(Vehicle, TelemetryLatest, Department, Route)
        .outerjoin(TelemetryLatest, Vehicle.id == TelemetryLatest.vehicle_id)
        .join(Department, Vehicle.department_id == Department.id)
        .outerjoin(VehicleRoute, (Vehicle.id == VehicleRoute.vehicle_id) & (VehicleRoute.is_active == True))
        .outerjoin(Route, VehicleRoute.route_id == Route.id)
        .where(Vehicle.id == id, Vehicle.is_active == True, Vehicle.public_visible == True)
    )
    res = await db.execute(query)
    row = res.first()
    if not row:
        return None
    vehicle, telemetry, department, route = row
    return VehiclePublicResponse(
        id=vehicle.id,
        vehicle_code=vehicle.vehicle_code,
        vehicle_type=vehicle.vehicle_type.value,
        department_name=department.name,
        latitude=_round_coordinate(telemetry.latitude) if telemetry and telemetry.latitude else None,
        longitude=_round_coordinate(telemetry.longitude) if telemetry and telemetry.longitude else None,
        speed_kph=round(telemetry.speed_kph) if telemetry and telemetry.speed_kph else None,
        heading_deg=telemetry.heading_deg if telemetry else None,
        direction=_heading_to_direction(telemetry.heading_deg) if telemetry else None,
        soc_pct=round(telemetry.soc_pct) if telemetry and telemetry.soc_pct is not None else None,
        charging=telemetry.charging if telemetry else None,
        status=telemetry.connectivity_status if telemetry and telemetry.connectivity_status else "unknown",
        route_id=route.id if route else None,
        route_name=route.name if route else None,
        route_code=route.code if route else None,
        last_updated_at=telemetry.observed_at if telemetry else None,
    )

async def get_public_routes(db: AsyncSession, city: str = None) -> list[RouteResponse]:
    query = select(Route).where(Route.is_active == True)
    if city:
        query = query.where(Route.city == city)
    res = await db.execute(query)
    return [RouteResponse.model_validate(r) for r in res.scalars().all()]

async def get_public_route_by_id(db: AsyncSession, id: uuid.UUID) -> RouteDetailResponse | None:
    r = await db.get(Route, id)
    if not r or not r.is_active:
        return None
    stops_query = select(Stop).join(RouteStop).where(RouteStop.route_id == id).order_by(RouteStop.sequence)
    stops_res = await db.execute(stops_query)
    stops = [StopResponse.model_validate(s) for s in stops_res.scalars().all()]
    
    resp = RouteDetailResponse.model_validate(r)
    resp.stops = stops
    return resp

async def get_public_stops(db: AsyncSession, city: str = None) -> list[StopResponse]:
    query = select(Stop).where(Stop.is_active == True)
    if city:
        query = query.where(Stop.city == city)
    res = await db.execute(query)
    return [StopResponse.model_validate(s) for s in res.scalars().all()]

async def get_public_stop_by_id(db: AsyncSession, id: uuid.UUID) -> StopDetailResponse | None:
    s = await db.get(Stop, id)
    if not s or not s.is_active:
        return None
    routes_query = select(Route).join(RouteStop).where(RouteStop.stop_id == id, Route.is_active == True)
    routes_res = await db.execute(routes_query)
    routes = [RouteResponse.model_validate(r) for r in routes_res.scalars().all()]
    
    resp = StopDetailResponse.model_validate(s)
    resp.serving_routes = routes
    return resp

async def get_public_help_contacts(db: AsyncSession, city: str = None, state: str = None, category: str = None) -> list[HelpContactResponse]:
    query = select(HelpContact).where(HelpContact.public_visible == True)
    if city:
        query = query.where(HelpContact.city == city)
    if state:
        query = query.where(HelpContact.state == state)
    if category:
        query = query.where(HelpContact.category == category)
    res = await db.execute(query)
    return [HelpContactResponse.model_validate(c) for c in res.scalars().all()]

async def register_public_charging_center(db: AsyncSession, data) -> ChargingCenterPublicResponse:
    center = ChargingCenter(
        name=data.name,
        latitude=data.latitude,
        longitude=data.longitude,
        address=data.address,
        city=data.city or "Bikaner",
        state=data.state or "Rajasthan",
        pincode=data.pincode,
        status=data.status or ChargingCenterStatus.OPERATIONAL,
        description=data.description,
        amenities=data.amenities or {},
        contact_phone=data.contact_phone,
        operating_hours=data.operating_hours or "24/7",
        connectors=data.connectors or {},
        power_kw=data.power_kw or 50.0,
        source="public_registration",
        public_visible=True
    )
    db.add(center)
    await db.commit()
    await db.refresh(center)
    return ChargingCenterPublicResponse.model_validate(center)

async def create_public_grievance(db: AsyncSession, data) -> GrievanceResponse:
    grievance = Grievance(
        category=data.category,
        description=data.description,
        city=data.city,
        reporter_name=data.reporter_name,
        reporter_phone=data.reporter_phone,
        reporter_email=data.reporter_email,
    )
    db.add(grievance)
    await db.commit()
    await db.refresh(grievance)
    return GrievanceResponse.model_validate(grievance)

