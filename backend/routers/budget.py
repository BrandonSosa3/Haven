from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import User, Transaction, Budget, BudgetCategory
from schemas import (
    BudgetPeriodSetup,
    BudgetCategoryCreate,
    BudgetCategoryResponse,
    TransactionCategorize,
    BudgetCreate,
    BudgetResponse
)
from routers.auth import get_current_user
from typing import List
from uuid import UUID
from datetime import datetime, timedelta
from calendar import monthrange

router = APIRouter(prefix="/budget", tags=["Budget"])


@router.get("/check-setup")
def check_budget_setup(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if user has completed budget setup"""
    budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.is_active == True
    ).first()
    
    # Calculate last full month date range
    now = datetime.now()
    if now.month == 1:
        last_full_month = 12
        last_full_year = now.year - 1
    else:
        last_full_month = now.month - 1
        last_full_year = now.year
    
    first_day = datetime(last_full_year, last_full_month, 1)
    last_day_num = monthrange(last_full_year, last_full_month)[1]
    last_day = datetime(last_full_year, last_full_month, last_day_num, 23, 59, 59)
    
    # Check if user has uncategorized transactions from last full month
    uncategorized = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.user_bucket.is_(None),
        Transaction.date >= first_day,
        Transaction.date <= last_day
    ).count()
    
    return {
        "has_budget": budget is not None,
        "needs_categorization": uncategorized > 0,
        "uncategorized_count": uncategorized
    }


@router.get("/uncategorized-transactions")
def get_uncategorized_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get transactions that need categorization from the last full month"""
    now = datetime.now()
    
    # Calculate last full month
    # If current month is January, last full month is December of previous year
    if now.month == 1:
        last_full_month = 12
        last_full_year = now.year - 1
    else:
        last_full_month = now.month - 1
        last_full_year = now.year
    
    # Get first and last day of last full month
    first_day = datetime(last_full_year, last_full_month, 1)
    last_day_num = monthrange(last_full_year, last_full_month)[1]
    last_day = datetime(last_full_year, last_full_month, last_day_num, 23, 59, 59)
    
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.user_bucket.is_(None),
        Transaction.date >= first_day,
        Transaction.date <= last_day
    ).order_by(Transaction.date.desc()).all()
    
    return [{
        "id": str(t.id),
        "amount": float(t.amount),
        "date": t.date.isoformat(),
        "description": t.description,
        "merchant_name": t.merchant_name,
        "category": t.category
    } for t in transactions]


@router.put("/transactions/{transaction_id}/categorize")
def categorize_transaction(
    transaction_id: UUID,
    categorization: TransactionCategorize,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Categorize a transaction"""
    try:
        transaction = db.query(Transaction).filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        ).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # Validate bucket value
        valid_buckets = ["needs", "wants", "savings", "income", "ignore"]
        if categorization.bucket not in valid_buckets:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid bucket value. Must be one of: {', '.join(valid_buckets)}"
            )
        
        # Update transaction
        transaction.user_bucket = categorization.bucket
        transaction.user_category = categorization.category  # Can be None for ignore/income
        transaction.budget_period = categorization.budget_period  # Can be None
        
        # Auto-create category if needed
        if categorization.category and categorization.bucket not in ["ignore", "income"]:
            # Clean category name
            category_name = categorization.category.strip() if categorization.category else None
            if category_name:
                existing = db.query(BudgetCategory).filter(
                    BudgetCategory.user_id == current_user.id,
                    func.lower(BudgetCategory.name) == category_name.lower(),
                    BudgetCategory.bucket == categorization.bucket
                ).first()
                
                if not existing:
                    new_category = BudgetCategory(
                        user_id=current_user.id,
                        name=category_name,
                        bucket=categorization.bucket
                    )
                    db.add(new_category)
        
        db.commit()
        
        return {"message": "Transaction categorized successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error categorizing transaction: {str(e)}")


@router.post("/transactions/reset-categorizations")
def reset_all_categorizations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reset all transaction categorizations for the current user"""
    updated = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).update({
        "user_bucket": None,
        "user_category": None,
        "budget_period": None
    })
    
    db.commit()
    
    return {
        "message": f"Reset categorizations for {updated} transactions",
        "reset_count": updated
    }


@router.post("/reset-all")
def reset_budget_setup(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reset entire budget setup: deactivate budgets, reset categorizations, delete categories"""
    # Deactivate all budgets
    budgets_deactivated = db.query(Budget).filter(
        Budget.user_id == current_user.id
    ).update({"is_active": False})
    
    # Reset all transaction categorizations
    transactions_reset = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).update({
        "user_bucket": None,
        "user_category": None,
        "budget_period": None
    })
    
    # Delete all budget categories (optional - comment out if you want to keep them)
    categories_deleted = db.query(BudgetCategory).filter(
        BudgetCategory.user_id == current_user.id
    ).delete()
    
    db.commit()
    
    return {
        "message": "Budget setup completely reset",
        "budgets_deactivated": budgets_deactivated,
        "transactions_reset": transactions_reset,
        "categories_deleted": categories_deleted
    }


@router.get("/categories", response_model=List[BudgetCategoryResponse])
def get_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's budget categories"""
    categories = db.query(BudgetCategory).filter(
        BudgetCategory.user_id == current_user.id
    ).order_by(BudgetCategory.bucket, BudgetCategory.name).all()
    
    return categories


@router.post("/categories", response_model=BudgetCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: BudgetCategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new budget category"""
    existing = db.query(BudgetCategory).filter(
        BudgetCategory.user_id == current_user.id,
        func.lower(BudgetCategory.name) == category_data.name.lower(),
        BudgetCategory.bucket == category_data.bucket
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    # Create category with explicit fields
    # Check which schema is being used - categorization has icon/color, budget doesn't
    category = BudgetCategory(
        user_id=current_user.id,
        name=category_data.name,
        bucket=category_data.bucket
    )
    
    # Only set icon and color if they exist in the schema
    if hasattr(category_data, 'icon'):
        category.icon = category_data.icon
    if hasattr(category_data, 'color'):
        category.color = category_data.color
    
    db.add(category)
    db.commit()
    db.refresh(category)
    
    return category


@router.post("/", response_model=BudgetResponse)
def create_budget(
    budget_data: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create budget after categorization is complete"""
    # Deactivate existing budgets
    db.query(Budget).filter(
        Budget.user_id == current_user.id
    ).update({"is_active": False})
    
    # Calculate next period date
    if budget_data.period_type == "weekly":
        next_period = budget_data.period_start_date + timedelta(weeks=1)
    elif budget_data.period_type == "biweekly":
        next_period = budget_data.period_start_date + timedelta(weeks=2)
    else:  # monthly
        next_period = budget_data.period_start_date + timedelta(days=30)
    
    budget = Budget(
        user_id=current_user.id,
        period_type=budget_data.period_type,
        has_monthly_obligations=budget_data.has_monthly_obligations,
        period_start_date=budget_data.period_start_date,
        next_period_date=next_period,
        total_income=budget_data.total_income,
        needs_percentage=budget_data.needs_percentage,
        wants_percentage=budget_data.wants_percentage,
        savings_percentage=budget_data.savings_percentage,
        is_active=True
    )
    
    db.add(budget)
    db.commit()
    db.refresh(budget)
    
    return budget


@router.get("/current", response_model=BudgetResponse)
def get_current_budget(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's active budget"""
    budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.is_active == True
    ).first()
    
    if not budget:
        raise HTTPException(status_code=404, detail="No active budget found")
    
    return budget


@router.get("/pre-budget-summary")
def get_pre_budget_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get summary of categorized transactions before budget is created"""
    # Calculate last full month date range
    now = datetime.now()
    if now.month == 1:
        last_full_month = 12
        last_full_year = now.year - 1
    else:
        last_full_month = now.month - 1
        last_full_year = now.year
    
    first_day = datetime(last_full_year, last_full_month, 1)
    last_day_num = monthrange(last_full_year, last_full_month)[1]
    last_day = datetime(last_full_year, last_full_month, last_day_num, 23, 59, 59)
    
    # Get all categorized transactions from last full month
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.user_bucket.isnot(None),
        Transaction.date >= first_day,
        Transaction.date <= last_day
    ).all()
    
    # Calculate totals by bucket
    needs_total = sum(abs(float(t.amount)) for t in transactions if t.user_bucket == "needs")
    wants_total = sum(abs(float(t.amount)) for t in transactions if t.user_bucket == "wants")
    savings_total = sum(abs(float(t.amount)) for t in transactions if t.user_bucket == "savings")
    income_total = sum(float(t.amount) for t in transactions if t.user_bucket == "income" and float(t.amount) > 0)
    ignored_total = sum(abs(float(t.amount)) for t in transactions if t.user_bucket == "ignore")
    
    # Count transactions by bucket
    needs_count = len([t for t in transactions if t.user_bucket == "needs"])
    wants_count = len([t for t in transactions if t.user_bucket == "wants"])
    savings_count = len([t for t in transactions if t.user_bucket == "savings"])
    income_count = len([t for t in transactions if t.user_bucket == "income"])
    ignored_count = len([t for t in transactions if t.user_bucket == "ignore"])
    
    # Category breakdown
    category_breakdown = {}
    for t in transactions:
        if t.user_category and t.user_bucket not in ["ignore", "income"]:
            key = f"{t.user_bucket}_{t.user_category}"
            if key not in category_breakdown:
                category_breakdown[key] = {
                "bucket": t.user_bucket,
                "category": t.user_category,
                "count": 0,
                "total": 0
            }
            category_breakdown[key]["count"] += 1
            category_breakdown[key]["total"] += abs(float(t.amount))
    
    # Get categories
    categories = db.query(BudgetCategory).filter(
        BudgetCategory.user_id == current_user.id
    ).all()
    
    return {
        "totals": {
            "needs": needs_total,
            "wants": wants_total,
            "savings": savings_total,
            "income": income_total,
            "ignored": ignored_total
        },
        "counts": {
            "needs": needs_count,
            "wants": wants_count,
            "savings": savings_count,
            "income": income_count,
            "ignored": ignored_count,
            "total": len(transactions)
        },
        "category_breakdown": list(category_breakdown.values()),
        "categories": [{"id": str(c.id), "name": c.name, "bucket": c.bucket} for c in categories]
    }


@router.get("/summary")
def get_budget_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get complete budget summary with spending by category"""
    budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.is_active == True
    ).first()
    
    if not budget:
        raise HTTPException(status_code=404, detail="No active budget found")
    
    # Get all categorized transactions for current period
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.user_bucket.isnot(None),
        Transaction.date >= budget.period_start_date
    ).all()
    
    # Calculate spending by bucket and period
    weekly_needs = sum(abs(float(t.amount)) for t in transactions 
                       if t.user_bucket == "needs" and t.budget_period == "weekly")
    weekly_wants = sum(abs(float(t.amount)) for t in transactions 
                       if t.user_bucket == "wants" and t.budget_period == "weekly")
    weekly_savings = sum(abs(float(t.amount)) for t in transactions 
                         if t.user_bucket == "savings" and t.budget_period == "weekly")
    
    monthly_needs = sum(abs(float(t.amount)) for t in transactions 
                        if t.user_bucket == "needs" and t.budget_period == "monthly")
    monthly_wants = sum(abs(float(t.amount)) for t in transactions 
                        if t.user_bucket == "wants" and t.budget_period == "monthly")
    monthly_savings = sum(abs(float(t.amount)) for t in transactions 
                          if t.user_bucket == "savings" and t.budget_period == "monthly")
    
    # Income (all pooled)
    total_income = sum(float(t.amount) for t in transactions 
                       if t.user_bucket == "income" and float(t.amount) > 0)
    
    # Category breakdown
    category_spending = {}
    for t in transactions:
        if t.user_category and float(t.amount) < 0:
            key = f"{t.user_bucket}_{t.budget_period}_{t.user_category}"
            category_spending[key] = category_spending.get(key, 0) + abs(float(t.amount))
    
    return {
        "budget": {
            "period_type": budget.period_type,
            "has_monthly_obligations": budget.has_monthly_obligations,
            "total_income": float(budget.total_income),
            "needs_target": float(budget.total_income * budget.needs_percentage / 100),
            "wants_target": float(budget.total_income * budget.wants_percentage / 100),
            "savings_target": float(budget.total_income * budget.savings_percentage / 100)
        },
        "period_spending": {
            "weekly": {
                "needs": weekly_needs,
                "wants": weekly_wants,
                "savings": weekly_savings,
                "total": weekly_needs + weekly_wants + weekly_savings
            },
            "monthly": {
                "needs": monthly_needs,
                "wants": monthly_wants,
                "savings": monthly_savings,
                "total": monthly_needs + monthly_wants + monthly_savings
            }
        },
        "income": {
            "total": total_income
        },
        "category_spending": category_spending
    }