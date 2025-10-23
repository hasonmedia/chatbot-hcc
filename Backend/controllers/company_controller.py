from sqlalchemy.ext.asyncio import AsyncSession
from services.company_service import (
    create_company_service,
    update_company_service,
    delete_company_service,
    get_company_by_id_service,
    get_all_companies_service
)

async def create_company_controller(data: dict, db: AsyncSession):
    company = await create_company_service(data, db)
    return {
        "message": "Company created",
        "company": {
            "id": company.id,
            "name": company.name,
            "logo_url": company.logo_url,
            "contact": company.contact,
            "created_at": company.created_at
        }
    }

async def update_company_controller(company_id: int, data: dict, db: AsyncSession):
    company = await update_company_service(company_id, data, db)
    if not company:
        return {"message": "Company not found"}
    return {
        "message": "Company updated",
        "company": {
            "id": company.id,
            "name": company.name,
            "logo_url": company.logo_url,
            "contact": company.contact,
            "created_at": company.created_at
        }
    }

async def delete_company_controller(company_id: int, db: AsyncSession):
    company = await delete_company_service(company_id, db)
    if not company:
        return {"message": "Company not found"}
    return {"message": "Company deleted", "company_id": company.id}

async def get_company_by_id_controller(company_id: int, db: AsyncSession):
    company = await get_company_by_id_service(company_id, db)
    if not company:
        return {"message": "Company not found"}
    return {
        "id": company.id,
        "name": company.name,
        "logo_url": company.logo_url,
        "contact": company.contact,
        "created_at": company.created_at
    }

async def get_all_companies_controller(db: AsyncSession):
    companies = await get_all_companies_service(db)
    return [
        {
            "id": c.id,
            "name": c.name,
            "logo_url": c.logo_url,
            "contact": c.contact,
            "created_at": c.created_at
        }
        for c in companies
    ]
    