from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional


class TransactionResponse(BaseModel):
    id: UUID
    account_id: Optional[UUID] = None  # Make this optional
    plaid_transaction_id: Optional[str] = None
    amount: float
    date: datetime
    description: Optional[str] = None
    merchant_name: Optional[str] = None
    category: Optional[str] = None
    category_detailed: Optional[str] = None
    user_bucket: Optional[str] = None  # Add these if not present
    user_category: Optional[str] = None
    pending: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True