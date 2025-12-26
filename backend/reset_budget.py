#!/usr/bin/env python3
"""
Script to reset budget setup for testing.
This will deactivate budgets, reset transaction categorizations, and delete categories.

Usage:
    python reset_budget.py [user_email]
    
If no email is provided, it will reset for all users (use with caution).
"""

import sys
import os
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, Budget, Transaction, BudgetCategory

def reset_user_budget(db: Session, user_id: str = None, user_email: str = None):
    """Reset budget setup for a specific user"""
    if user_email:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            print(f"User with email {user_email} not found")
            return False
        user_id = str(user.id)
    
    if not user_id:
        print("Error: Must provide either user_id or user_email")
        return False
    
    # Deactivate all budgets
    budgets_deactivated = db.query(Budget).filter(
        Budget.user_id == user_id
    ).update({"is_active": False})
    
    # Reset all transaction categorizations
    transactions_reset = db.query(Transaction).filter(
        Transaction.user_id == user_id
    ).update({
        "user_bucket": None,
        "user_category": None,
        "budget_period": None
    })
    
    # Delete all budget categories
    categories_deleted = db.query(BudgetCategory).filter(
        BudgetCategory.user_id == user_id
    ).delete()
    
    db.commit()
    
    print(f"✅ Reset complete for user {user_email or user_id}:")
    print(f"   - {budgets_deactivated} budgets deactivated")
    print(f"   - {transactions_reset} transactions reset")
    print(f"   - {categories_deleted} categories deleted")
    
    return True

def reset_all_users(db: Session):
    """Reset budget setup for ALL users (use with caution!)"""
    if input("⚠️  WARNING: This will reset budgets for ALL users. Continue? (yes/no): ").lower() != 'yes':
        print("Cancelled")
        return
    
    budgets_deactivated = db.query(Budget).update({"is_active": False})
    transactions_reset = db.query(Transaction).update({
        "user_bucket": None,
        "user_category": None,
        "budget_period": None
    })
    categories_deleted = db.query(BudgetCategory).delete()
    
    db.commit()
    
    print(f"✅ Reset complete for ALL users:")
    print(f"   - {budgets_deactivated} budgets deactivated")
    print(f"   - {transactions_reset} transactions reset")
    print(f"   - {categories_deleted} categories deleted")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        if len(sys.argv) > 1:
            user_email = sys.argv[1]
            reset_user_budget(db, user_email=user_email)
        else:
            print("Usage: python reset_budget.py [user_email]")
            print("       If no email provided, will reset for all users (with confirmation)")
            if input("Reset for all users? (yes/no): ").lower() == 'yes':
                reset_all_users(db)
    finally:
        db.close()

