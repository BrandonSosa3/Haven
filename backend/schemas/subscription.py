from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class SubscriptionCreate(BaseModel):
    name: str
    amount: float = Field(..., gt=0)
    billing_cycle: str  # monthly, yearly, quarterly
    next_billing_date: datetime
    category: Optional[str] = None
    notes: Optional[str] = None


class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    billing_cycle: Optional[str] = None
    next_billing_date: Optional[datetime] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class SubscriptionResponse(BaseModel):
    id: UUID
    name: str
    amount: float
    billing_cycle: str
    next_billing_date: datetime
    category: Optional[str]
    notes: Optional[str]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True