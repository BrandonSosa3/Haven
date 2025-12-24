from sqlalchemy import Column, String, DateTime, Numeric, Boolean, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from models.user import Base


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    account_id = Column(UUID(as_uuid=True), ForeignKey('accounts.id'), nullable=False)
    
    # Plaid identifiers (null if manual transaction)
    plaid_transaction_id = Column(String, unique=True, nullable=True)
    
    # Transaction details
    date = Column(DateTime, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)  # negative = expense, positive = income
    merchant_name = Column(String)
    description = Column(String, nullable=False)
    
    # Categorization
    category = Column(String)  # From Plaid or user-defined
    user_category = Column(String)  # User override
    
    # Status
    pending = Column(Boolean, default=False)
    
    # Notes
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="transactions")
    account = relationship("Account", backref="transactions")