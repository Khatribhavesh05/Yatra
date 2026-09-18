from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio
from typing import Optional

from app.core.database import get_db
from app.services.public_data_service import get_public_vehicles

router = APIRouter(prefix="/ws/public", tags=["websocket-public"])

import uuid

@router.websocket("/vehicles")
async def websocket_public_vehicles(
    websocket: WebSocket,
    city: Optional[str] = Query(None),
    vehicle_type: Optional[str] = Query(None),
    route_id: Optional[uuid.UUID] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    await websocket.accept()
    try:
        while True:
            # Re-fetch the vehicles periodically
            vehicles = await get_public_vehicles(db, vehicle_type=vehicle_type, city=city, route_id=route_id)
            # Send data to client
            await websocket.send_json([v.model_dump(mode="json") for v in vehicles])
            
            # Wait before next update
            await asyncio.sleep(4)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket Error: {e}")
        try:
            await websocket.close()
        except:
            pass
