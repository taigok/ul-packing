"""initial schema"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "packing_lists",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=False, server_default=""),
        sa.Column("unit", sa.Enum("G", "OZ", name="unit"), nullable=False, server_default="G"),
        sa.Column("share_token", sa.String(length=128), nullable=False, unique=True),
        sa.Column("is_shared", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "gear_items",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("list_id", sa.String(length=36), sa.ForeignKey("packing_lists.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column(
            "category",
            sa.Enum(
                "SHELTER",
                "SLEEPING",
                "BACKPACK",
                "CLOTHING",
                "COOKING",
                "FOOD",
                "WATER",
                "ELECTRONICS",
                "OTHER",
                name="category",
            ),
            nullable=False,
        ),
        sa.Column("weight_grams", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("kind", sa.Enum("BASE", "CONSUMABLE", "WORN", name="itemkind"), nullable=False, server_default="BASE"),
        sa.Column("notes", sa.Text(), nullable=False, server_default=""),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_table("gear_items")
    op.drop_table("packing_lists")
    sa.Enum(name="itemkind").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="category").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="unit").drop(op.get_bind(), checkfirst=True)
