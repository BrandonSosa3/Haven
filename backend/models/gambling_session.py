from sqlalchemy import Column, String, DateTime, Numeric, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from models.user import Base


class GamblingSession(Base):
    __tablename__ = "gambling_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    # Session details
    platform = Column(String, nullable=False)  # DraftKings, FanDuel, etc.
    game_type = Column(String, nullable=False)  # sports_bet, poker, etc.
    
    # Financial
    buy_in = Column(Numeric(12, 2), nullable=False)
    cash_out = Column(Numeric(12, 2), nullable=False)
    net_result = Column(Numeric(12, 2), nullable=False)  # cash_out - buy_in
    
    # Session info
    session_date = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer)  # Optional
    
    # Notes
    notes = Column(Text)
    mood = Column(String)  # confident, tilted, etc. (optional)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="gambling_sessions")