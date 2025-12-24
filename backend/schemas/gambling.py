from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class GamblingSessionCreate(BaseModel):
    platform: str
    game_type: str
    buy_in: float = Field(..., ge=0)
    cash_out: float = Field(..., ge=0)
    session_date: datetime
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    mood: Optional[str] = None


class GamblingSessionUpdate(BaseModel):
    platform: Optional[str] = None
    game_type: Optional[str] = None
    buy_in: Optional[float] = None
    cash_out: Optional[float] = None
    session_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    mood: Optional[str] = None


class GamblingSessionResponse(BaseModel):
    id: UUID
    platform: str
    game_type: str
    buy_in: float
    cash_out: float
    net_result: float
    session_date: datetime
    duration_minutes: Optional[int]
    notes: Optional[str]
    mood: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class GamblingStats(BaseModel):
    total_sessions: int
    total_buy_in: float
    total_cash_out: float
    net_profit_loss: float
    win_rate: float
    average_session: float
    best_session: float
    worst_session: float