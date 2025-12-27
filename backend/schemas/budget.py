from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Literal


class BudgetPeriodSetup(BaseModel):
    period_type: Literal["weekly", "biweekly", "monthly"]
    has_monthly_obligations: bool = False
    period_start_date: datetime


class BudgetCategoryCreate(BaseModel):
    name: str
    bucket: Literal["needs", "wants", "savings", "income"]  # Add "income" here


class BudgetCreate(BaseModel):
    period_type: Literal["weekly", "biweekly", "monthly"]
    has_monthly_obligations: bool
    period_start_date: datetime
    total_income: float
    needs_percentage: float = 50
    wants_percentage: float = 30
    savings_percentage: float = 20


class BudgetResponse(BaseModel):
    id: UUID
    period_type: str
    has_monthly_obligations: bool
    period_start_date: datetime
    next_period_date: datetime
    total_income: float
    needs_percentage: float
    wants_percentage: float
    savings_percentage: float
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class BudgetCategoryResponse(BaseModel):
    id: UUID
    name: str
    bucket: Literal["needs", "wants", "savings", "income"]  # Add "income" here
    user_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True