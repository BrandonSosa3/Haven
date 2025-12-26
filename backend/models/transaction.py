from sqlalchemy import Column, String, DateTime, Numeric, Boolean, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from models.user import Base


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    account_id = Column(UUID(as_uuid=True), ForeignKey('accounts.id'), nullable=True)
    
    # Plaid data
    plaid_transaction_id = Column(String, unique=True, nullable=True)
    
    # Transaction details
    amount = Column(Numeric(12, 2), nullable=False)
    date = Column(DateTime, nullable=False)
    description = Column(String, nullable=True)
    merchant_name = Column(String, nullable=True)
    
    # Categories
    category = Column(String, nullable=True)  # From Plaid
    category_detailed = Column(String, nullable=True)
    
    # User categorization (for budgeting)
    user_bucket = Column(String, nullable=True)  # needs, wants, savings, income, ignore
    user_category = Column(String, nullable=True)  # groceries, dining, rent, etc.
    budget_period = Column(String, nullable=True)  # weekly, monthly (for weekly/biweekly budgets)
    # Status
    pending = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", backref="transactions")
    account = relationship("Account", backref="transactions")