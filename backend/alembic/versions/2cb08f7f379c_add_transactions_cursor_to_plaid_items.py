"""add_transactions_cursor_to_plaid_items

Revision ID: 2cb08f7f379c
Revises: 5a4ee84e3ba1
Create Date: 2025-12-24 10:21:26.796944

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2cb08f7f379c'
down_revision: Union[str, None] = '5a4ee84e3ba1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add transactions_cursor column to plaid_items table
    op.add_column('plaid_items', sa.Column('transactions_cursor', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove transactions_cursor column from plaid_items table
    op.drop_column('plaid_items', 'transactions_cursor')
