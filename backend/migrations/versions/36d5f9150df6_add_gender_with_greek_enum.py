"""Add gender with Greek enum

Revision ID: 36d5f9150df6
Revises: 22efa5413b40
Create Date: 2025-07-04 21:25:36.405204

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '36d5f9150df6'
down_revision: Union[str, Sequence[str], None] = '22efa5413b40'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

from alembic import op
import sqlalchemy as sa

# If needed:
gender_enum = sa.Enum("Άνδρας", "Γυναίκα", name="gender")

def upgrade():
    gender_enum.create(op.get_bind())  # Creates ENUM in PostgreSQL
    op.add_column("users", sa.Column("gender", gender_enum, nullable=True))

def downgrade():
    op.drop_column("users", "gender")
    gender_enum.drop(op.get_bind())  # Drops ENUM type
