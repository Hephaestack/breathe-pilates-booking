"""Add new subscription models

Revision ID: 6a5e9dd79f62
Revises: 9614d3ad9f6f
Create Date: 2025-07-11 18:04:31.029270

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '6a5e9dd79f62'
down_revision: Union[str, Sequence[str], None] = '9614d3ad9f6f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE subscriptionmodel ADD VALUE IF NOT EXISTS 'family_2'")
    op.execute("ALTER TYPE subscriptionmodel ADD VALUE IF NOT EXISTS 'family_3'")
    op.execute("ALTER TYPE subscriptionmodel ADD VALUE IF NOT EXISTS 'family_3_cadillac'")
    op.execute("ALTER TYPE subscriptionmodel ADD VALUE IF NOT EXISTS 'yoga_4'")

def downgrade() -> None:
    pass
