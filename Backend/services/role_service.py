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
    can_view = False
    can_edit = False
    can_delete = False

    if current_user.role == "root":
        can_view = True
        can_edit = True
        can_delete = True
    elif current_user.role == "superadmin":
        if target_user.role in ["superadmin"]:
            can_view = True
            can_edit = False
            can_delete = False
        elif target_user.role in ["admin", "user"]:
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
            "can_edit": False,
            "can_delete": False,
            "can_view": False,
            "avalilable_roles": []
        },
        "companies": {
            "can_create": False
        }
    }

    if current_user.role == "root":
        abilities["users"]["can_create"] = True
        abilities["users"]["can_edit"] = True
        abilities["users"]["can_delete"] = True
        abilities["users"]["can_view"] = True
        abilities["users"]["avalilable_roles"] = ["root","superadmin", "admin", "user"]
        abilities["companies"]["can_create"] = True

    elif current_user.role == "superadmin":
        abilities["users"]["can_create"] = True
        abilities["users"]["can_edit"] = True
        abilities["users"]["can_delete"] = True
        abilities["users"]["can_view"] = True
        abilities["users"]["avalilable_roles"] = [ "admin", "user"]
        abilities["companies"]["can_create"] = True
    elif current_user.role == "admin":
        abilities["users"]["can_create"] = True
        abilities["users"]["can_edit"] = True
        abilities["users"]["can_delete"] = True
        abilities["users"]["can_view"] = True
        abilities["users"]["avalilable_roles"] = ["user"]

    return abilities


def get_user_id(user_obj):
    if isinstance(user_obj, dict):
        return user_obj.get("id")
    return getattr(user_obj, "id", None)