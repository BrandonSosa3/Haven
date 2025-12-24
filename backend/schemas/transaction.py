from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional


class TransactionResponse(BaseModel):
    id: UUID
    account_id: UUID
    date: datetime
    amount: float
    merchant_name: Optional[str]
    description: str
    category: Optional[str]
    user_category: Optional[str]
    pending: bool
    
    class Config:
        from_attributes = True