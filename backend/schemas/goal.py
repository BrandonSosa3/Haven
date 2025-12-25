from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class GoalCreate(BaseModel):
    name: str
    target_amount: float = Field(..., gt=0)
    current_amount: float = Field(default=0, ge=0)
    target_date: Optional[datetime] = None
    category: Optional[str] = None
    notes: Optional[str] = None


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    target_date: Optional[datetime] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class GoalResponse(BaseModel):
    id: UUID
    name: str
    target_amount: float
    current_amount: float
    target_date: Optional[datetime]
    category: Optional[str]
    notes: Optional[str]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True