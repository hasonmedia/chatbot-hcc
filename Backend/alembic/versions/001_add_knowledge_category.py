"""add knowledge category table and restructure relationships

Revision ID: 001_add_knowledge_category
Revises: 
Create Date: 2025-11-08 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_add_knowledge_category'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Tạo bảng knowledge_category
    op.create_table(
        'knowledge_category',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('knowledge_base_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['knowledge_base_id'], ['knowledge_base.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_knowledge_category_id'), 'knowledge_category', ['id'], unique=False)
    
    # 2. Thêm cột category_id vào knowledge_base_detail (nullable tạm thời để migrate dữ liệu)
    op.add_column('knowledge_base_detail', sa.Column('category_id', sa.Integer(), nullable=True))
    
    # 3. Migration dữ liệu: 
    # Với mỗi knowledge_base, tạo 1 category mặc định và gán tất cả detail vào category đó
    connection = op.get_bind()
    
    # Lấy danh sách các knowledge_base có detail
    result = connection.execute(sa.text("""
        SELECT DISTINCT knowledge_base_id 
        FROM knowledge_base_detail 
        WHERE knowledge_base_id IS NOT NULL
    """))
    
    for row in result:
        kb_id = row[0]
        
        # Tạo category mặc định cho knowledge base này
        insert_result = connection.execute(sa.text("""
            INSERT INTO knowledge_category (name, description, knowledge_base_id, created_at, updated_at)
            VALUES (:name, :description, :kb_id, now(), now())
            RETURNING id
        """), {
            'name': 'Chưa phân loại',
            'description': 'Category mặc định được tạo tự động khi migrate',
            'kb_id': kb_id
        })
        
        category_id = insert_result.fetchone()[0]
        
        # Cập nhật tất cả detail của knowledge_base này sang category vừa tạo
        connection.execute(sa.text("""
            UPDATE knowledge_base_detail
            SET category_id = :category_id
            WHERE knowledge_base_id = :kb_id
        """), {
            'category_id': category_id,
            'kb_id': kb_id
        })
    
    # 4. Tạo foreign key cho category_id
    op.create_foreign_key(
        'fk_knowledge_base_detail_category_id',
        'knowledge_base_detail', 
        'knowledge_category',
        ['category_id'], 
        ['id']
    )
    
    # 5. Đổi category_id thành NOT NULL
    op.alter_column('knowledge_base_detail', 'category_id', nullable=False)
    
    # 6. Xóa foreign key constraint cũ của knowledge_base_id
    op.drop_constraint('knowledge_base_detail_knowledge_base_id_fkey', 'knowledge_base_detail', type_='foreignkey')
    
    # 7. Xóa cột knowledge_base_id
    op.drop_column('knowledge_base_detail', 'knowledge_base_id')


def downgrade() -> None:
    # 1. Thêm lại cột knowledge_base_id
    op.add_column('knowledge_base_detail', sa.Column('knowledge_base_id', sa.Integer(), nullable=True))
    
    # 2. Migration dữ liệu ngược lại: Lấy knowledge_base_id từ category
    connection = op.get_bind()
    connection.execute(sa.text("""
        UPDATE knowledge_base_detail kbd
        SET knowledge_base_id = kc.knowledge_base_id
        FROM knowledge_category kc
        WHERE kbd.category_id = kc.id
    """))
    
    # 3. Tạo lại foreign key cho knowledge_base_id
    op.create_foreign_key(
        'knowledge_base_detail_knowledge_base_id_fkey',
        'knowledge_base_detail',
        'knowledge_base',
        ['knowledge_base_id'],
        ['id']
    )
    
    # 4. Đổi knowledge_base_id thành NOT NULL
    op.alter_column('knowledge_base_detail', 'knowledge_base_id', nullable=False)
    
    # 5. Xóa foreign key của category_id
    op.drop_constraint('fk_knowledge_base_detail_category_id', 'knowledge_base_detail', type_='foreignkey')
    
    # 6. Xóa cột category_id
    op.drop_column('knowledge_base_detail', 'category_id')
    
    # 7. Xóa index của knowledge_category
    op.drop_index(op.f('ix_knowledge_category_id'), table_name='knowledge_category')
    
    # 8. Xóa bảng knowledge_category
    op.drop_table('knowledge_category')
