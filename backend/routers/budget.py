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
    from datetime import datetime
    from dateutil.relativedelta import relativedelta
    
    # Check for active budget
    budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.is_active == True
    ).first()
    
    # Determine which month we should be working with
    today = datetime.now()
    
    # If it's early in the month (first 5 days), we might still be setting up last month
    if today.day <= 5:
        target_month_start = (today.replace(day=1) - relativedelta(months=1)).replace(day=1)
    else:
        target_month_start = today.replace(day=1)
    
    target_month_end = (target_month_start + relativedelta(months=1)).replace(day=1) - relativedelta(days=1)
    
    print(f"[BUDGET CHECK] Today: {today}")
    print(f"[BUDGET CHECK] Target month: {target_month_start} to {target_month_end}")
    
    # Check for uncategorized transactions in target month
    uncategorized = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.user_bucket.is_(None),
        Transaction.date >= target_month_start,
        Transaction.date <= today  # Only up to today
    ).count()
    
    print(f"[BUDGET CHECK] Uncategorized count: {uncategorized}")
    print(f"[BUDGET CHECK] Has budget: {budget is not None}")
    
    return {
        "has_budget": budget is not None,
        "needs_categorization": uncategorized > 0,
        "uncategorized_count": uncategorized,
        "target_month": {
            "start": target_month_start.isoformat(),
            "end": target_month_end.isoformat(),
            "name": target_month_start.strftime("%B %Y")
        }
    }


@router.get("/uncategorized-transactions")
def get_uncategorized_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get transactions that need categorization for budget setup"""
    from datetime import datetime
    from dateutil.relativedelta import relativedelta
    
    today = datetime.now()
    
    # Determine target month for budget setup
    # If no budget exists, use last full month for initial setup
    budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.is_active == True
    ).first()
    
    if not budget:
        # First time setup - use last full month (November if we're in December)
        if today.month == 1:
            target_start = datetime(today.year - 1, 12, 1)
            target_end = datetime(today.year - 1, 12, 31, 23, 59, 59)
        else:
            target_start = datetime(today.year, today.month - 1, 1)
            # Last day of previous month
            target_end = (today.replace(day=1) - relativedelta(days=1)).replace(hour=23, minute=59, second=59)
        
        print(f"[UNCATEGORIZED] First time setup - using previous month")
        print(f"[UNCATEGORIZED] Range: {target_start} to {target_end}")
    else:
        # Budget exists - get current month transactions up to today
        target_start = today.replace(day=1, hour=0, minute=0, second=0)
        target_end = today.replace(hour=23, minute=59, second=59)
        
        print(f"[UNCATEGORIZED] Existing budget - using current month to date")
        print(f"[UNCATEGORIZED] Range: {target_start} to {target_end}")
    
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.user_bucket.is_(None),
        Transaction.date >= target_start,
        Transaction.date <= target_end
    ).order_by(Transaction.date.desc()).all()
    
    print(f"[UNCATEGORIZED] Found {len(transactions)} transactions")
    
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

@router.patch("/current/period-dates")
def update_budget_period_dates(
    period_start_date: datetime,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the period dates for the current budget"""
    budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.is_active == True
    ).first()
    
    if not budget:
        raise HTTPException(status_code=404, detail="No active budget found")
    
    # Calculate next period date based on period type
    if budget.period_type == "weekly":
        next_period = period_start_date + timedelta(weeks=1)
    elif budget.period_type == "biweekly":
        next_period = period_start_date + timedelta(weeks=2)
    else:  # monthly
        next_period = period_start_date + timedelta(days=30)
    
    budget.period_start_date = period_start_date
    budget.next_period_date = next_period
    
    db.commit()
    db.refresh(budget)
    
    print(f"[BUDGET] Updated period dates: {period_start_date} to {next_period}")
    
    return {
        "message": "Period dates updated successfully",
        "period_start_date": budget.period_start_date.isoformat(),
        "next_period_date": budget.next_period_date.isoformat()
    }


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
        Transaction.date >= budget.period_start_date,
        Transaction.date <= datetime.now()
    ).all()
    
    print(f"[BUDGET SUMMARY] Found {len(transactions)} transactions in period")
    
    # Calculate spending by bucket (only negative amounts)
    needs_spending = sum(abs(float(t.amount)) for t in transactions 
                        if t.user_bucket == "needs" and float(t.amount) < 0)
    wants_spending = sum(abs(float(t.amount)) for t in transactions 
                        if t.user_bucket == "wants" and float(t.amount) < 0)
    savings_spending = sum(abs(float(t.amount)) for t in transactions 
                          if t.user_bucket == "savings" and float(t.amount) < 0)
    
    print(f"[BUDGET SUMMARY] Needs: {needs_spending}, Wants: {wants_spending}, Savings: {savings_spending}")
    
    # Income (positive amounts)
    total_income = sum(abs(float(t.amount)) for t in transactions 
                    if t.user_bucket == "income" and float(t.amount) > 0)

    print(f"[BUDGET SUMMARY] Income: {total_income}")

    # Category breakdown for spending
    category_spending = {}
    for t in transactions:
        if t.user_category and float(t.amount) < 0:
            key = f"{t.user_bucket}_{t.user_category}"
            category_spending[key] = category_spending.get(key, 0) + abs(float(t.amount))

    # Income category breakdown
    income_categories = {}
    for t in transactions:
        if t.user_bucket == "income" and float(t.amount) > 0:
            category = t.user_category if t.user_category else "Uncategorized"
            income_categories[category] = income_categories.get(category, 0) + abs(float(t.amount))

    print(f"[BUDGET SUMMARY] Income categories: {income_categories}")
    print(f"[BUDGET SUMMARY] Spending categories: {category_spending}")
    for t in transactions:
        if t.user_category and float(t.amount) < 0:
            key = f"{t.user_bucket}_{t.user_category}"
            category_spending[key] = category_spending.get(key, 0) + abs(float(t.amount))
    
    print(f"[BUDGET SUMMARY] Categories: {category_spending}")
    
    return {
        "budget": {
            "period_type": budget.period_type,
            "has_monthly_obligations": budget.has_monthly_obligations,
            "total_income": float(budget.total_income),
            "needs_target": float(budget.total_income * budget.needs_percentage / 100),
            "wants_target": float(budget.total_income * budget.wants_percentage / 100),
            "savings_target": float(budget.total_income * budget.savings_percentage / 100)
        },
        "spending": {
            "needs": needs_spending,
            "wants": wants_spending,
            "savings": savings_spending,
            "total": needs_spending + wants_spending + savings_spending
        },
        "income": {
            "total": total_income,
            "categories": income_categories
        },
        "category_spending": category_spending
    }

@router.post("/reset-all")
def reset_all_budget_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reset all budget data - deactivate budgets and clear categorizations"""
    
    # Deactivate all budgets
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    for budget in budgets:
        budget.is_active = False
    
    # Clear all transaction categorizations
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    reset_count = 0
    for txn in transactions:
        if txn.user_bucket is not None:
            txn.user_bucket = None
            txn.user_category = None
            txn.budget_period = None
            reset_count += 1
    
    # Delete all categories
    categories = db.query(BudgetCategory).filter(BudgetCategory.user_id == current_user.id).all()
    category_count = len(categories)
    for cat in categories:
        db.delete(cat)
    
    db.commit()
    
    print(f"[BUDGET] Reset complete: {len(budgets)} budgets, {reset_count} transactions, {category_count} categories")
    
    return {
        "message": "All budget data reset successfully",
        "budgets_deactivated": len(budgets),
        "transactions_reset": reset_count,
        "categories_deleted": category_count
    }

@router.get("/history")
def get_budget_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all budgets for the user, ordered by most recent first"""
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id
    ).order_by(Budget.period_start_date.desc()).all()
    
    history = []
    for budget in budgets:
        # Get month name from period_start_date
        month_name = budget.period_start_date.strftime("%B %Y")
        
        history.append({
            "id": str(budget.id),
            "month": month_name,
            "period_start": budget.period_start_date.isoformat(),
            "period_end": budget.next_period_date.isoformat(),
            "is_active": budget.is_active,
            "total_income": float(budget.total_income)
        })
    
    return history


@router.get("/{budget_id}/summary")
def get_budget_summary_by_id(
    budget_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get summary for a specific budget (for viewing past months)"""
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    # Get all categorized transactions for this period
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.user_bucket.isnot(None),
        Transaction.date >= budget.period_start_date,
        Transaction.date < budget.next_period_date
    ).all()
    
    # Calculate spending by bucket
    needs_spending = sum(abs(float(t.amount)) for t in transactions 
                        if t.user_bucket == "needs" and float(t.amount) < 0)
    wants_spending = sum(abs(float(t.amount)) for t in transactions 
                        if t.user_bucket == "wants" and float(t.amount) < 0)
    savings_spending = sum(abs(float(t.amount)) for t in transactions 
                          if t.user_bucket == "savings" and float(t.amount) < 0)
    
    # Income
    total_income = sum(abs(float(t.amount)) for t in transactions 
                       if t.user_bucket == "income" and float(t.amount) > 0)
    
    # Income category breakdown
    income_categories = {}
    for t in transactions:
        if t.user_bucket == "income" and float(t.amount) > 0:
            category = t.user_category if t.user_category else "Uncategorized"
            income_categories[category] = income_categories.get(category, 0) + abs(float(t.amount))
    
    # Category breakdown for spending
    category_spending = {}
    for t in transactions:
        if t.user_category and float(t.amount) < 0:
            key = f"{t.user_bucket}_{t.user_category}"
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
        "spending": {
            "needs": needs_spending,
            "wants": wants_spending,
            "savings": savings_spending,
            "total": needs_spending + wants_spending + savings_spending
        },
        "income": {
            "total": total_income,
            "categories": income_categories
        },
        "category_spending": category_spending
    }

@router.post("/create-historical/{year}/{month}")
def create_historical_budget(
    year: int,
    month: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a budget for a specific past month based on that month's transactions"""
    from calendar import monthrange
    
    # Calculate period dates
    period_start = datetime(year, month, 1)
    last_day = monthrange(year, month)[1]
    period_end = datetime(year, month, last_day, 23, 59, 59)
    
    # Get all transactions for that month
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.user_bucket.isnot(None),
        Transaction.date >= period_start,
        Transaction.date <= period_end
    ).all()
    
    # Calculate total income for that month
    total_income = sum(abs(float(t.amount)) for t in transactions 
                       if t.user_bucket == "income" and float(t.amount) > 0)
    
    if total_income == 0:
        total_income = 1000  # Default
    
    # Check if budget already exists for this month
    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.period_start_date >= period_start,
        Budget.period_start_date < period_end
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail=f"Budget already exists for {year}-{month}")
    
    # Create budget
    budget = Budget(
        user_id=current_user.id,
        period_type='monthly',
        has_monthly_obligations=False,
        period_start_date=period_start,
        next_period_date=period_end,
        total_income=total_income,
        needs_percentage=50,
        wants_percentage=30,
        savings_percentage=20,
        is_active=False  # Historical budgets are not active
    )
    
    db.add(budget)
    db.commit()
    db.refresh(budget)
    
    print(f"[BUDGET] Created historical budget for {year}-{month}: ${total_income}")
    
    return {
        "message": f"Historical budget created for {period_start.strftime('%B %Y')}",
        "budget_id": str(budget.id),
        "total_income": float(total_income)
    }
@router.post("/auto-create-current-month")
def auto_create_current_month_budget(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Auto-create budget for current month if it doesn't exist"""
    from calendar import monthrange
    
    now = datetime.now()
    current_month = now.month
    current_year = now.year
    
    # Check if budget already exists for current month
    period_start = datetime(current_year, current_month, 1)
    last_day = monthrange(current_year, current_month)[1]
    period_end = datetime(current_year, current_month, last_day, 23, 59, 59)
    
    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.period_start_date >= period_start,
        Budget.period_start_date <= period_end
    ).first()
    
    if existing:
        return {
            "message": "Budget already exists for current month",
            "budget_id": str(existing.id),
            "created": False
        }
    
    # Get last month's income for estimate
    if current_month == 1:
        last_month = 12
        last_year = current_year - 1
    else:
        last_month = current_month - 1
        last_year = current_year
    
    last_month_start = datetime(last_year, last_month, 1)
    last_month_last_day = monthrange(last_year, last_month)[1]
    last_month_end = datetime(last_year, last_month, last_month_last_day, 23, 59, 59)
    
    # Get last month's income
    last_month_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.user_bucket == "income",
        Transaction.date >= last_month_start,
        Transaction.date <= last_month_end
    ).all()
    
    total_income = sum(abs(float(t.amount)) for t in last_month_transactions if float(t.amount) > 0)
    
    if total_income == 0:
        total_income = 1000  # Default
    
    # Deactivate all previous budgets
    db.query(Budget).filter(
        Budget.user_id == current_user.id
    ).update({"is_active": False})
    
    # Create new budget for current month
    budget = Budget(
        user_id=current_user.id,
        period_type='monthly',
        has_monthly_obligations=False,
        period_start_date=period_start,
        next_period_date=period_end,
        total_income=total_income,
        needs_percentage=50,
        wants_percentage=30,
        savings_percentage=20,
        is_active=True
    )
    
    db.add(budget)
    db.commit()
    db.refresh(budget)
    
    print(f"[BUDGET] Auto-created budget for {period_start.strftime('%B %Y')}: ${total_income}")
    
    return {
        "message": f"Budget created for {period_start.strftime('%B %Y')}",
        "budget_id": str(budget.id),
        "total_income": float(total_income),
        "created": True
    }