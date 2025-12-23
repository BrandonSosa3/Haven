from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from models.user import Base


class PlaidItem(Base):
    __tablename__ = "plaid_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    # Plaid identifiers
    access_token = Column(String, nullable=False)  # encrypted in production
    item_id = Column(String, nullable=False, unique=True)
    institution_name = Column(String)
    
    # Status
    status = Column(String, default='active')  # active, error, relink_required
    last_synced_at = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="plaid_items")