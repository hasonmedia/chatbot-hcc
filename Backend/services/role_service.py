from models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

async def get_users_with_permission(db: AsyncSession, current_user: User):
    users_dto =[]
    all_users = await db.execute(select(User))
    for user in all_users.scalars().all():
        permission = calculate_permission_for_user(current_user, user)
        users_dto.append({
            "user": user,
            "permission": permission
        })
    return users_dto

def calculate_permission_for_user(current_user: User, target_user: User ):
    print(current_user.role)
    can_view = False
    can_edit = False
    can_delete = False

    if current_user.role == "root" or current_user.role == "superadmin":
        can_view = True
        can_edit = True
        can_delete = True
    elif current_user.role == "admin":
        if target_user.role in ["user"] and current_user.company_id == target_user.company_id:
            can_view = True
            can_edit = True
            can_delete = True
        elif target_user.role in ["user"] and current_user.company_id != target_user.company_id:
            can_view = True
        elif target_user.role in ["admin"]:
            can_view = True
            if current_user.id == target_user.id:
                can_edit = True
    elif current_user.role == "user":
        if target_user.id == current_user.id:
            can_view = True
            can_edit = True
        elif target_user.role == "user" and current_user.company_id == target_user.company_id:
            can_view = True
        elif target_user.role == "user" and current_user.company_id != target_user.company_id:
            can_view = False
    
    return {
        "can_view": can_view,
        "can_edit": can_edit,
        "can_delete": can_delete
    }

def get_global_abilities_for_user(current_user: User):
    abilities = {
        "users": {
            "can_create": False,
            "avalilable_roles": []
        },
        "update_user": {
            "can_edit": False,
            "avalilable_roles": []
        },
        "delete_user": {
            "can_delete": False,
            "avalilable_roles": []
        },
        "companies": {
            "can_create": False
        }
    }

    if current_user.role == "root":
        abilities["users"]["can_create"] = True
        abilities["users"]["avalilable_roles"] = ["root","superadmin", "admin", "user"]
        abilities["companies"]["can_create"] = True
        
        
        abilities["update_user"]["can_edit"] = True
        abilities["update_user"]["avalilable_roles"] = ["root","superadmin", "admin", "user"]
    elif current_user.role == "superadmin":
        abilities["users"]["can_create"] = True
        abilities["users"]["avalilable_roles"] = ["superadmin", "admin", "user"]
        abilities["companies"]["can_create"] = True
        
        
        abilities["update_user"]["can_edit"] = True
        abilities["update_user"]["avalilable_roles"] = ["admin", "user"]
    elif current_user.role == "admin":
        abilities["users"]["can_create"] = True
        abilities["users"]["avalilable_roles"] = ["user"]
    elif current_user.role == "user":
        abilities["users"]["can_create"] = False
        abilities["users"]["avalilable_roles"] = []
    
    return abilities