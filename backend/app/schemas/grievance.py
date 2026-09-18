from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class GrievanceCreate(BaseModel):
    category: str
    description: str
    city: Optional[str] = None
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None
    reporter_email: Optional[str] = None

class GrievanceResponse(BaseModel):
    id: uuid.UUID
    category: str
    description: str
    city: Optional[str] = None
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None
    reporter_email: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
