from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from datetime import datetime, timezone, timedelta
from typing import Optional
import uuid

from app.models.telemetry import TelemetryEvent, TelemetryLatest
from app.models.device import Device
from app.models.vehicle import Vehicle
from app.schemas.telemetry import TelemetryIngestPayload, TelemetryIngestResponse
from app.core.config import settings


async def process_telemetry(
    db: AsyncSession, payload: TelemetryIngestPayload
) -> TelemetryIngestResponse:
    """Main telemetry ingestion pipeline."""
    flags: dict[str, bool] = {}
    
    # 1. Resolve device and vehicle
    device = await _resolve_device(db, payload.device_id)
    if device is None:
        return TelemetryIngestResponse(
            status="rejected", event_id=payload.event_id,
            message=f"Unknown device: {payload.device_id}"
        )
    vehicle = await _resolve_vehicle(db, payload.vehicle_id)
    if vehicle is None:
        return TelemetryIngestResponse(
            status="rejected", event_id=payload.event_id,
            message=f"Unknown vehicle: {payload.vehicle_id}"
        )
    
    # 2. Idempotency check
    existing = await db.execute(
        select(TelemetryEvent.id).where(
            TelemetryEvent.device_id == device.id,
            TelemetryEvent.event_id == payload.event_id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        return TelemetryIngestResponse(
            status="duplicate", event_id=payload.event_id,
            message="Event already processed"
        )
    
    # 3. Validation flags
    now = datetime.now(timezone.utc)
    
    # Future timestamp
    max_future = now + timedelta(seconds=settings.TELEMETRY_MAX_FUTURE_SECONDS)
    if payload.observed_at.replace(tzinfo=timezone.utc) > max_future:
        flags["future_timestamp"] = True
    
    # Impossible speed
    speed = payload.motion.speed_kph if payload.motion else None
    if speed is not None and speed > settings.TELEMETRY_MAX_SPEED_KPH:
        flags["impossible_speed"] = True
    
    # Poor GPS
    if payload.location.accuracy_m and payload.location.accuracy_m > settings.TELEMETRY_POOR_GPS_ACCURACY_M:
        flags["poor_gps"] = True
    
    # SoC jump check against latest
    latest_result = await db.execute(
        select(TelemetryLatest).where(TelemetryLatest.vehicle_id == vehicle.id)
    )
    latest = latest_result.scalar_one_or_none()
    
    soc = payload.energy.soc_pct if payload.energy else None
    if soc is not None and latest and latest.soc_pct is not None:
        if abs(soc - latest.soc_pct) > 30:
            flags["soc_jump"] = True
    
    # Sequence check
    if payload.seq is not None and latest and latest.seq is not None:
        if payload.seq < latest.seq:
            flags["out_of_sequence"] = True
    
    # 4. Store immutable event
    event = TelemetryEvent(
        event_id=payload.event_id,
        vehicle_id=vehicle.id,
        device_id=device.id,
        observed_at=payload.observed_at,
        latitude=payload.location.lat,
        longitude=payload.location.lng,
        accuracy_m=payload.location.accuracy_m,
        speed_kph=speed,
        heading_deg=payload.motion.heading_deg if payload.motion else None,
        soc_pct=soc,
        estimated_range_km=payload.energy.estimated_range_km if payload.energy else None,
        charging=payload.energy.charging if payload.energy else None,
        dtcs=payload.diagnostics.dtcs if payload.diagnostics else None,
        battery_temp_c=payload.diagnostics.battery_temp_c if payload.diagnostics else None,
        network=payload.connectivity.network if payload.connectivity else None,
        firmware=payload.connectivity.firmware if payload.connectivity else None,
        seq=payload.seq,
        flags=flags if flags else None,
        raw_payload=payload.model_dump(mode="json"),
    )
    db.add(event)
    
    # 5. Upsert telemetry_latest
    await _upsert_latest(db, vehicle.id, device.id, payload, now)
    
    # 6. Update device last_seen_at
    await db.execute(
        update(Device).where(Device.id == device.id).values(last_seen_at=now)
    )
    
    # 7. Evaluate alerts
    from app.services.alert_service import evaluate_alerts
    await evaluate_alerts(db, vehicle, payload, flags)
    
    await db.commit()
    
    return TelemetryIngestResponse(
        status="accepted", event_id=payload.event_id,
        flags=flags if flags else None
    )


async def _resolve_device(db: AsyncSession, device_code: str) -> Optional[Device]:
    result = await db.execute(select(Device).where(Device.device_code == device_code))
    return result.scalar_one_or_none()


async def _resolve_vehicle(db: AsyncSession, vehicle_code: str) -> Optional[Vehicle]:
    result = await db.execute(select(Vehicle).where(Vehicle.vehicle_code == vehicle_code))
    return result.scalar_one_or_none()


async def _upsert_latest(
    db: AsyncSession,
    vehicle_id: uuid.UUID,
    device_id: uuid.UUID,
    payload: TelemetryIngestPayload,
    received_at: datetime,
) -> None:
    """Upsert the telemetry_latest row for fast current-state queries."""
    values = dict(
        vehicle_id=vehicle_id,
        device_id=device_id,
        observed_at=payload.observed_at,
        received_at=received_at,
        latitude=payload.location.lat,
        longitude=payload.location.lng,
        accuracy_m=payload.location.accuracy_m,
        speed_kph=payload.motion.speed_kph if payload.motion else None,
        heading_deg=payload.motion.heading_deg if payload.motion else None,
        soc_pct=payload.energy.soc_pct if payload.energy else None,
        estimated_range_km=payload.energy.estimated_range_km if payload.energy else None,
        charging=payload.energy.charging if payload.energy else None,
        dtcs=payload.diagnostics.dtcs if payload.diagnostics else None,
        battery_temp_c=payload.diagnostics.battery_temp_c if payload.diagnostics else None,
        network=payload.connectivity.network if payload.connectivity else None,
        firmware=payload.connectivity.firmware if payload.connectivity else None,
        seq=payload.seq,
        connectivity_status="online",
    )
    
    stmt = pg_insert(TelemetryLatest).values(**values)
    stmt = stmt.on_conflict_do_update(
        index_elements=[TelemetryLatest.vehicle_id],
        set_={k: v for k, v in values.items() if k != "vehicle_id"},
        where=TelemetryLatest.observed_at < payload.observed_at,  # Only update if newer
    )
    await db.execute(stmt)
