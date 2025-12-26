from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from models.user import Base


class BudgetCategory(Base):
    """User-created budget categories within 50/30/20 buckets"""
    __tablename__ = "budget_categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    name = Column(String, nullable=False)  # "Groceries", "Dining Out", etc.
    bucket = Column(String, nullable=False)  # needs, wants, savings
    
    # Optional styling
    icon = Column(String, nullable=True)  # emoji or icon name
    color = Column(String, nullable=True)  # hex color
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", backref="budget_categories")