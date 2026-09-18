from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List, Optional

from app.core.database import get_db
from app.schemas.vehicle import VehiclePublicResponse
from app.schemas.charging_center import ChargingCenterPublicResponse, ChargingCenterDetailResponse
from app.schemas.city import CityResponse, StateResponse
from app.schemas.route import RouteResponse, RouteDetailResponse, StopResponse, StopDetailResponse
from app.schemas.help_contact import HelpContactResponse
from app.schemas.grievance import GrievanceCreate, GrievanceResponse

from app.services import public_data_service as pds

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/charging-centers", response_model=List[ChargingCenterPublicResponse])
async def public_charging_centers(
    search: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: float = 10.0,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint for charging centers."""
    return await pds.get_public_charging_centers(db, search, city, state, lat, lng, radius_km, skip, limit)

@router.get("/charging-centers/{id}", response_model=ChargingCenterDetailResponse)
async def public_charging_center_by_id(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    res = await pds.get_public_charging_center_by_id(db, id)
    if not res:
        raise HTTPException(status_code=404, detail="Charging center not found")
    return res

@router.get("/states", response_model=List[StateResponse])
async def public_states(db: AsyncSession = Depends(get_db)):
    return await pds.get_public_states(db)

@router.get("/cities", response_model=List[CityResponse])
async def public_cities(state: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    return await pds.get_public_cities(db, state)

@router.get("/vehicles", response_model=List[VehiclePublicResponse])
async def public_vehicles(
    vehicle_type: Optional[str] = None,
    city: Optional[str] = None,
    route_id: Optional[uuid.UUID] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint. No authentication required. Returns sanitized vehicle data."""
    return await pds.get_public_vehicles(db, vehicle_type, city, route_id, search, skip, limit)

@router.get("/vehicles/{id}", response_model=VehiclePublicResponse)
async def public_vehicle_by_id(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    res = await pds.get_public_vehicle_by_id(db, id)
    if not res:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return res

@router.get("/routes", response_model=List[RouteResponse])
async def public_routes(city: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    return await pds.get_public_routes(db, city)

@router.get("/routes/{id}", response_model=RouteDetailResponse)
async def public_route_by_id(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    res = await pds.get_public_route_by_id(db, id)
    if not res:
        raise HTTPException(status_code=404, detail="Route not found")
    return res

@router.get("/stops", response_model=List[StopResponse])
async def public_stops(city: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    return await pds.get_public_stops(db, city)

@router.get("/stops/{id}", response_model=StopDetailResponse)
async def public_stop_by_id(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    res = await pds.get_public_stop_by_id(db, id)
    if not res:
        raise HTTPException(status_code=404, detail="Stop not found")
    return res

@router.get("/help-contacts", response_model=List[HelpContactResponse])
async def public_help_contacts(
    city: Optional[str] = None,
    state: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    return await pds.get_public_help_contacts(db, city, state, category)

@router.post("/charging-centers/register", response_model=ChargingCenterPublicResponse)
async def public_register_charging_center(
    body: pds.ChargingCenterPublicResponse | dict,
    db: AsyncSession = Depends(get_db)
):
    from app.schemas.charging_center import ChargingCenterCreate
    if isinstance(body, dict):
        create_data = ChargingCenterCreate(**body)
    else:
        create_data = ChargingCenterCreate(**body.model_dump())
    return await pds.register_public_charging_center(db, create_data)

@router.post("/grievances", response_model=GrievanceResponse, status_code=status.HTTP_201_CREATED)
async def public_submit_grievance(body: GrievanceCreate, db: AsyncSession = Depends(get_db)):
    """Public endpoint. No authentication required. Citizens may submit anonymously."""
    return await pds.create_public_grievance(db, body)

