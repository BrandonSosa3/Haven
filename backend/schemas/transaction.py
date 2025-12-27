from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional

class TransactionResponse(BaseModel):
    id: UUID
    account_id: Optional[UUID] = None
    plaid_transaction_id: Optional[str] = None
    amount: float
    date: datetime
    description: Optional[str] = None
    merchant_name: Optional[str] = None
    category: Optional[str] = None
    category_detailed: Optional[str] = None
    user_bucket: Optional[str] = None
    user_category: Optional[str] = None
    budget_period: Optional[str] = None  # Add this line
    pending: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True