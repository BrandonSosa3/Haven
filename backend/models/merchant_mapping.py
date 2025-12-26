from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from models.user import Base


class MerchantCategoryMapping(Base):
    """Remembers user's category choices for merchants"""
    __tablename__ = "merchant_category_mappings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    merchant_name = Column(String, nullable=False)
    bucket = Column(String, nullable=False)  # needs, wants, savings
    category = Column(String, nullable=False)  # groceries, dining, etc.
    
    # Track how many times user made this choice (confidence)
    assignment_count = Column(String, default=1)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="merchant_mappings")