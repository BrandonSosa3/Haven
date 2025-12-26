from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Numeric, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from models.user import Base


class Budget(Base):
    """User's budget configuration"""
    __tablename__ = "budgets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    # Budget period settings
    period_type = Column(String, nullable=False)  # weekly, biweekly, monthly
    has_monthly_obligations = Column(Boolean, default=False)
    
    # Period tracking
    period_start_date = Column(DateTime, nullable=False)
    next_period_date = Column(DateTime, nullable=False)
    
    # Income (pooled across all sources)
    total_income = Column(Numeric(12, 2), nullable=False)
    
    # 50/30/20 percentages (can be customized)
    needs_percentage = Column(Numeric(5, 2), default=50)
    wants_percentage = Column(Numeric(5, 2), default=30)
    savings_percentage = Column(Numeric(5, 2), default=20)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="budgets")


class BudgetCategory(Base):
    """User-created categories within buckets"""
    __tablename__ = "budget_categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    name = Column(String, nullable=False)  # "Groceries"
    bucket = Column(String, nullable=False)  # needs, wants, savings
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", backref="budget_categories")