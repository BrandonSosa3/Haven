from sqlalchemy.orm import Session
from models import Transaction, SpendingInsight
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, List
import uuid


def categorize_bucket(category: str) -> str:
    """Map transaction category to needs/wants/savings bucket"""
    if not category:
        return "wants"
    
    category_lower = category.lower()
    
    # Needs
    needs_keywords = [
        'groceries', 'supermarket', 'food and drink', 'rent', 'mortgage', 
        'utilities', 'gas', 'fuel', 'insurance', 'healthcare', 'medical',
        'pharmacy', 'phone', 'internet', 'transportation', 'public transit'
    ]
    
    # Savings
    savings_keywords = [
        'transfer', 'savings', 'investment', 'retirement', 
        'credit card payment', 'loan payment'
    ]
    
    for keyword in needs_keywords:
        if keyword in category_lower:
            return "needs"
    
    for keyword in savings_keywords:
        if keyword in category_lower:
            return "savings"
    
    return "wants"


def generate_weekly_insight(
    user_id: uuid.UUID,
    week_start: datetime,
    week_end: datetime,
    db: Session
) -> SpendingInsight:
    """Generate spending insight for a specific week"""
    
    # Get transactions for this week
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.date >= week_start,
        Transaction.date < week_end
    ).all()
    
    # Calculate totals
    total_income = 0.0
    total_spending = 0.0
    category_spending = defaultdict(float)
    
    for txn in transactions:
        amount = float(txn.amount)
        
        if amount > 0:
            # Income
            total_income += amount
        else:
            # Spending (negative amounts)
            total_spending += abs(amount)
            
            # Categorize
            category = txn.category or "Uncategorized"
            category_spending[category] += abs(amount)
    
    # Create insight
    insight = SpendingInsight(
        user_id=user_id,
        week_start=week_start,
        week_end=week_end,
        total_income=total_income,
        total_spending=total_spending,
        category_spending=dict(category_spending),
        recurring_expenses={}  # TODO: Implement recurring detection
    )
    
    db.add(insight)
    db.commit()
    db.refresh(insight)
    
    return insight


def get_spending_summary(user_id: uuid.UUID, db: Session, weeks: int = 4) -> Dict:
    """Get spending summary for last N weeks"""
    
    end_date = datetime.now()
    start_date = end_date - timedelta(weeks=weeks)
    
    # Get all transactions in period
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.date >= start_date,
        Transaction.date < end_date
    ).all()
    
    # Aggregate by category
    category_totals = defaultdict(float)
    total_income = 0.0
    total_spending = 0.0
    
    for txn in transactions:
        amount = float(txn.amount)
        
        if amount > 0:
            total_income += amount
        else:
            total_spending += abs(amount)
            category = txn.category or "Uncategorized"
            category_totals[category] += abs(amount)
    
    # Calculate weekly averages
    avg_weekly_income = total_income / weeks
    avg_weekly_spending = total_spending / weeks
    
    category_averages = {
        cat: total / weeks 
        for cat, total in category_totals.items()
    }
    
    # Sort by amount
    sorted_categories = sorted(
        category_averages.items(), 
        key=lambda x: x[1], 
        reverse=True
    )
    
    return {
        "observation_period_weeks": weeks,
        "total_income": total_income,
        "total_spending": total_spending,
        "avg_weekly_income": avg_weekly_income,
        "avg_weekly_spending": avg_weekly_spending,
        "category_averages": dict(sorted_categories),
        "top_categories": dict(sorted_categories[:5])
    }


def suggest_budget_from_insights(user_id: uuid.UUID, db: Session) -> Dict:
    """Generate budget suggestion based on spending patterns"""
    
    summary = get_spending_summary(user_id, db, weeks=4)
    
    # Use average weekly income as base
    weekly_income = summary['avg_weekly_income']
    
    if weekly_income == 0:
        # No income detected, use spending + buffer
        weekly_income = summary['avg_weekly_spending'] * 1.2
    
    # Calculate 50/30/20
    needs_budget = weekly_income * 0.50
    wants_budget = weekly_income * 0.30
    savings_budget = weekly_income * 0.20
    
    # Categorize actual spending into buckets
    category_budgets = {}
    for category, weekly_avg in summary['category_averages'].items():
        bucket = categorize_bucket(category)
        category_budgets[category] = {
            "weekly_amount": round(weekly_avg, 2),
            "bucket": bucket,
            "user_set": False
        }
    
    return {
        "suggested_income": round(weekly_income, 2),
        "needs_budget": round(needs_budget, 2),
        "wants_budget": round(wants_budget, 2),
        "savings_budget": round(savings_budget, 2),
        "category_budgets": category_budgets,
        "based_on_weeks": 4
    }