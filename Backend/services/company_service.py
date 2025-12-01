from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.company import Company

async def create_company_service(data: dict, db: AsyncSession):
    try: 
        company = Company(
            name=data.get("name"),
            logo_url=data.get("logo_url"),
            contact=data.get("contact")
        )
        db.add(company)
        await db.commit()
        await db.refresh(company)
        return company
    except Exception as e:
        await db.rollback()
        raise Exception(f"Lỗi tạo công ty: {str(e)}")


async def update_company_service(company_id: int, data: dict, db: AsyncSession):
    try: 

        result = await db.execute(select(Company).filter(Company.id == company_id))
        company = result.scalar_one_or_none()
        if not company:
            return None
        company.name = data.get("name", company.name)
        company.logo_url = data.get("logo_url", company.logo_url)
        company.contact = data.get("contact", company.contact)
        await db.commit()
        await db.refresh(company)
        return company
    except Exception as e:
        await db.rollback()
        raise Exception(f"Lỗi cập nhật công ty: {str(e)}")


async def delete_company_service(company_id: int, db: AsyncSession):
    try:
        result = await db.execute(select(Company).filter(Company.id == company_id))
        company = result.scalar_one_or_none()
        if not company:
            return None
        await db.delete(company)
        await db.commit()
        return company
    except Exception as e:
        await db.rollback()
        raise Exception(f"Lỗi xóa công ty: {str(e)}")

async def get_company_by_id_service(company_id: int, db: AsyncSession):
    try: 
        result = await db.execute(select(Company).filter(Company.id == company_id))
        return result.scalar_one_or_none()
    except Exception as e:
        raise Exception(f"Lỗi lấy công ty: {str(e)}")

async def get_all_companies_service(db: AsyncSession):
    try: 

        result = await db.execute(select(Company))
        return result.scalars().all()
    except Exception as e:
        raise Exception(f"Lỗi lấy danh sách công ty: {str(e)}")