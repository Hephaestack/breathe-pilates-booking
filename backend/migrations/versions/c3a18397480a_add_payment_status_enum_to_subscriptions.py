"""Add payment_status enum to subscriptions

Revision ID: c3a18397480a
Revises: a230a4ea63cc
Create Date: 2025-08-06 16:52:59.586513

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c3a18397480a'
down_revision: Union[str, Sequence[str], None] = 'a230a4ea63cc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    payment_status_enum = sa.Enum('pending', 'paid', name='paymentstatus')
    payment_status_enum.create(op.get_bind())

    op.alter_column(
        'subscriptions',
        'payment_status',
        existing_type=sa.VARCHAR(),
        type_=payment_status_enum,
        nullable=False,
        postgresql_using="payment_status::paymentstatus"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        'subscriptions',
        'payment_status',
        existing_type=sa.Enum('pending', 'paid', name='paymentstatus'),
        type_=sa.VARCHAR(),
        nullable=True
    )

    sa.Enum(name='paymentstatus').drop(op.get_bind())
