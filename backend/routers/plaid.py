from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, PlaidItem, Account
from schemas import LinkTokenResponse, ExchangePublicTokenRequest, PlaidItemResponse, AccountResponse
from services.plaid_service import create_link_token, exchange_public_token, get_accounts
from routers.auth import get_current_user
from typing import List

router = APIRouter(prefix="/plaid", tags=["Plaid"])


@router.post("/create_link_token", response_model=LinkTokenResponse)
def create_plaid_link_token(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Plaid Link token for connecting bank accounts"""
    try:
        response = create_link_token(user_id=str(current_user.id))
        return {
            "link_token": response['link_token'],
            "expiration": response['expiration']
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create link token: {str(e)}"
        )


@router.post("/exchange_public_token", response_model=PlaidItemResponse)
def exchange_plaid_token(
    request: ExchangePublicTokenRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Exchange public token for access token and save accounts"""
    try:
        # Exchange token
        token_response = exchange_public_token(request.public_token)
        access_token = token_response['access_token']
        item_id = token_response['item_id']
        
        # Get accounts
        accounts_response = get_accounts(access_token)
        institution_name = accounts_response.get('item', {}).get('institution_id', 'Unknown')
        
        # Save Plaid item
        plaid_item = PlaidItem(
            user_id=current_user.id,
            access_token=access_token,  # TODO: encrypt this in production
            item_id=item_id,
            institution_name=institution_name
        )
        db.add(plaid_item)
        db.flush()  # Get the ID without committing
        
        # Save accounts
        for acc in accounts_response['accounts']:
            account = Account(
                user_id=current_user.id,
                plaid_item_id=plaid_item.id,
                plaid_account_id=acc['account_id'],
                name=acc['name'],
                type=acc['type'],
                subtype=acc.get('subtype', ''),
                current_balance=float(acc['balances']['current'] or 0),
                available_balance=float(acc['balances'].get('available') or 0),
                credit_limit=float(acc['balances'].get('limit') or 0),
                is_manual=False
            )
            db.add(account)
        
        db.commit()
        db.refresh(plaid_item)
        
        return plaid_item
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to connect account: {str(e)}"
        )


@router.get("/accounts", response_model=List[AccountResponse])
def get_user_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all accounts for the current user"""
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    return accounts

@router.post("/accounts/manual", response_model=AccountResponse)
def create_manual_account(
    name: str,
    type: str,
    current_balance: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a manual account (cash, etc.)"""
    account = Account(
        user_id=current_user.id,
        name=name,
        type=type,
        subtype=type,
        current_balance=current_balance,
        is_manual=True
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account