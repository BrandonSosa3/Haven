from pydantic import BaseModel, Field, validator
from datetime import datetime
from uuid import UUID
from typing import Optional


class BudgetCategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    bucket: str = Field(..., pattern="^(needs|wants|savings)$")
    icon: Optional[str] = None
    color: Optional[str] = None


class BudgetCategoryResponse(BaseModel):
    id: UUID
    name: str
    bucket: str
    icon: Optional[str] = None
    color: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class TransactionCategorize(BaseModel):
    bucket: str = Field(..., pattern="^(needs|wants|savings|income|ignore)$")
    category: Optional[str] = None  # Name of user category
    budget_period: Optional[str] = None
    
    @validator('category', 'budget_period', pre=True)
    @classmethod
    def empty_str_to_none(cls, v):
        """Convert empty strings to None"""
        if v == '':
            return None
        return v


class CategorizationSuggestion(BaseModel):
    suggested_bucket: Optional[str]
    suggested_category: Optional[str]
    confidence: str  # high, medium, low
    reason: str  # "You assigned this merchant to X before"


class CategorizationProgress(BaseModel):
    total_transactions: int
    categorized_count: int
    uncategorized_count: int
    needs_total: float
    wants_total: float
    savings_total: float
    ignored_total: float
    income_total: float  # Add this
    progress_percentage: float