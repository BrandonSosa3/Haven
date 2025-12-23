from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class LinkTokenResponse(BaseModel):
    link_token: str
    expiration: datetime


class ExchangePublicTokenRequest(BaseModel):
    public_token: str


class PlaidItemResponse(BaseModel):
    id: UUID
    institution_name: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class AccountResponse(BaseModel):
    id: UUID
    name: str
    type: str
    subtype: str
    current_balance: float
    available_balance: float
    credit_limit: float
    is_manual: bool
    
    class Config:
        from_attributes = True