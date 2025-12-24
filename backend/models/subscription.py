from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from models.user import Base


class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    # Subscription details
    name = Column(String, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    billing_cycle = Column(String, nullable=False)  # monthly, yearly, quarterly
    next_billing_date = Column(DateTime, nullable=False)
    
    # Optional details
    category = Column(String)
    notes = Column(String)
    
    # Status
    status = Column(String, default='active')  # active, canceled, paused
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="subscriptions")