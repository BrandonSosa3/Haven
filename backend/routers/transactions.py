from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, Account, PlaidItem, Transaction
from schemas import TransactionResponse
from services.plaid_service import sync_transactions
from routers.auth import get_current_user
from typing import List
from datetime import datetime

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/sync")
def sync_user_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sync transactions for all user's Plaid accounts"""
    synced_count = 0
    
    # Get all user's Plaid items
    plaid_items = db.query(PlaidItem).filter(PlaidItem.user_id == current_user.id).all()
    
    for plaid_item in plaid_items:
        try:
            # Get cursor - use empty string if None (first sync)
            cursor = plaid_item.transactions_cursor if plaid_item.transactions_cursor else ""
            has_more = True
            
            # Continue syncing until all transactions are fetched
            while has_more:
                # Sync transactions with current cursor
                response = sync_transactions(plaid_item.access_token, cursor)
                
                # Debug: log response structure
                print(f"Sync response for item {plaid_item.id}: has_more={response.get('has_more')}, added={len(response.get('added', []))}, next_cursor={response.get('next_cursor')[:50] if response.get('next_cursor') else None}")
                
                # Process added transactions
                for txn in response.get('added', []):
                    # Check if transaction already exists
                    existing = db.query(Transaction).filter(
                        Transaction.plaid_transaction_id == txn['transaction_id']
                    ).first()
                    
                    if existing:
                        continue
                    
                    # Find the account
                    account = db.query(Account).filter(
                        Account.plaid_account_id == txn['account_id'],
                        Account.user_id == current_user.id
                    ).first()
                    
                    if not account:
                        continue
                    
                    # Parse date - Plaid returns dates in YYYY-MM-DD format
                    try:
                        if isinstance(txn['date'], str):
                            txn_date = datetime.strptime(txn['date'], '%Y-%m-%d')
                        else:
                            txn_date = txn['date']
                    except (ValueError, TypeError) as e:
                        print(f"Error parsing date for transaction {txn.get('transaction_id')}: {e}")
                        continue
                    
                    # Create transaction
                    transaction = Transaction(
                        user_id=current_user.id,
                        account_id=account.id,
                        plaid_transaction_id=txn['transaction_id'],
                        date=txn_date,
                        amount=-float(txn['amount']),  # Negative for expenses
                        merchant_name=txn.get('merchant_name') or txn.get('name') or '',
                        description=txn.get('name', ''),
                        category=', '.join(txn.get('category', [])) if txn.get('category') else None,
                        pending=txn.get('pending', False)
                    )
                    db.add(transaction)
                    synced_count += 1
                
                # Update cursor and check if more transactions are available
                next_cursor = response.get('next_cursor')
                has_more = response.get('has_more', False)
                
                # Save cursor (only if we got a new one, and it's not empty)
                if next_cursor:
                    cursor = next_cursor
                    plaid_item.transactions_cursor = cursor
                
                plaid_item.last_synced_at = datetime.utcnow()
                db.commit()
            
        except Exception as e:
            db.rollback()
            print(f"Error syncing transactions for item {plaid_item.id}: {e}")
            continue
    
    return {"message": f"Synced {synced_count} new transactions"}


@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's transactions"""
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.date.desc()).limit(limit).all()
    
    return transactions