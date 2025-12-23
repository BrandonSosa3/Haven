from sqlalchemy import Column, String, DateTime, Boolean, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from models.user import Base


class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    plaid_item_id = Column(UUID(as_uuid=True), ForeignKey('plaid_items.id'), nullable=True)
    
    # Account details
    plaid_account_id = Column(String, nullable=True)  # null if manual account
    name = Column(String, nullable=False)  # e.g., "Chase Checking"
    type = Column(String, nullable=False)  # checking, savings, credit, investment, cash
    subtype = Column(String)  # checking, savings, credit_card, etc.
    
    # Balances
    current_balance = Column(Numeric(12, 2), default=0)
    available_balance = Column(Numeric(12, 2))
    credit_limit = Column(Numeric(12, 2))  # for credit cards
    
    # Flags
    is_manual = Column(Boolean, default=False)  # true if manually added, false if from Plaid
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="accounts")
    plaid_item = relationship("PlaidItem", backref="accounts")