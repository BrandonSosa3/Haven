from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import User, GamblingSession
from schemas import GamblingSessionCreate, GamblingSessionUpdate, GamblingSessionResponse, GamblingStats
from routers.auth import get_current_user
from typing import List
from uuid import UUID

router = APIRouter(prefix="/gambling", tags=["Gambling"])


@router.post("/", response_model=GamblingSessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    session_data: GamblingSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new gambling session"""
    # Calculate net result
    net_result = float(session_data.cash_out) - float(session_data.buy_in)
    
    session = GamblingSession(
        user_id=current_user.id,
        net_result=net_result,
        **session_data.dict()
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/", response_model=List[GamblingSessionResponse])
def get_sessions(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all gambling sessions"""
    sessions = db.query(GamblingSession).filter(
        GamblingSession.user_id == current_user.id
    ).order_by(GamblingSession.session_date.desc()).limit(limit).all()
    return sessions


@router.get("/stats", response_model=GamblingStats)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get gambling statistics"""
    sessions = db.query(GamblingSession).filter(
        GamblingSession.user_id == current_user.id
    ).all()
    
    if not sessions:
        return GamblingStats(
            total_sessions=0,
            total_buy_in=0,
            total_cash_out=0,
            net_profit_loss=0,
            win_rate=0,
            average_session=0,
            best_session=0,
            worst_session=0
        )
    
    total_sessions = len(sessions)
    total_buy_in = sum(float(s.buy_in) for s in sessions)
    total_cash_out = sum(float(s.cash_out) for s in sessions)
    net_profit_loss = sum(float(s.net_result) for s in sessions)
    winning_sessions = len([s for s in sessions if float(s.net_result) > 0])
    win_rate = (winning_sessions / total_sessions * 100) if total_sessions > 0 else 0
    average_session = net_profit_loss / total_sessions if total_sessions > 0 else 0
    best_session = max(float(s.net_result) for s in sessions)
    worst_session = min(float(s.net_result) for s in sessions)
    
    return GamblingStats(
        total_sessions=total_sessions,
        total_buy_in=total_buy_in,
        total_cash_out=total_cash_out,
        net_profit_loss=net_profit_loss,
        win_rate=win_rate,
        average_session=average_session,
        best_session=best_session,
        worst_session=worst_session
    )


@router.delete("/{session_id}")
def delete_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a gambling session"""
    session = db.query(GamblingSession).filter(
        GamblingSession.id == session_id,
        GamblingSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    db.delete(session)
    db.commit()
    return {"message": "Session deleted"}