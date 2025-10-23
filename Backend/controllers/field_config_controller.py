from sqlalchemy.ext.asyncio import AsyncSession
from services.field_config_service import (
    create_field_config_service,
    update_field_config_service,
    delete_field_config_service,
    get_field_config_by_id_service,
    get_all_field_configs_service
)
from services.knowledge_base_service import get_all_kb_service
import gspread
from google.oauth2.service_account import Credentials


# Helper function to create response with field config data
def _create_field_config_response(config, message_prefix, sync_success):
    return {
        "message": f"{message_prefix}" + (" and synced to Google Sheets" if sync_success else " (sync to Google Sheets failed)"),
        "field_config": {
            "id": config.id,
            "is_required": config.is_required,
            "excel_column_name": config.excel_column_name,
            "excel_column_letter": config.excel_column_letter
        },
        "sheet_synced": sync_success
    }

# Google Sheets setup
async def get_sheet(db: AsyncSession):
    try:
        sheet = await get_all_kb_service(db)
        # creds = Credentials.from_service_account_file(
        #     "config/config_sheet.json",
        #     scopes=["https://www.googleapis.com/auth/spreadsheets"]
        # )
        client = gspread.service_account(filename="config/config_sheet.json")
        # client = gspread.authorize(creds)
        spreadsheet_id =  sheet.customer_id  # Thay bằng ID bảng tính của bạn
        return client.open_by_key(spreadsheet_id).sheet1
    except Exception as e:
        print(f"Error connecting to Google Sheets: {e}")
        return None

async def sync_headers_to_sheet(db: AsyncSession):
    try:
        sheet = await get_sheet(db)
        if not sheet:
            print("Cannot connect to Google Sheets")
            return False
            
        configs = await get_all_field_configs_service(db)
        if not configs:
            print("No field configs found")
            return False
            
        # Sắp xếp theo column letter
        configs.sort(key=lambda x: x.excel_column_letter)
        
        # Tạo header row từ field configs
        header_row = [config.excel_column_name for config in configs]
        
        # Kiểm tra xem sheet có dữ liệu không
        try:
            current_values = sheet.get_all_values()
            if current_values:
                # Update hàng đầu tiên thay vì xóa và insert
                sheet.update('1:1', [header_row])
            else:
                # Sheet rỗng, insert row mới
                sheet.insert_row(header_row, 1)
        except Exception as e:
            print(f"Error updating sheet: {e}")
            # Fallback: insert row mới
            sheet.insert_row(header_row, 1)
        
        print(f"Successfully synced {len(header_row)} headers to Google Sheets")
        return True
        
    except Exception as e:
        print(f"Error syncing headers to sheet: {e}")
        return False

# --- Create ---
async def create_field_config_controller(data: dict, db: AsyncSession):
    config = await create_field_config_service(data, db)
    if not config:
        return {"message": "Failed to create FieldConfig"}
    
    # Tự động sync headers lên Google Sheets
    sync_success = await sync_headers_to_sheet(db)
    
    return _create_field_config_response(config, "FieldConfig created", sync_success)

# --- Update ---
async def update_field_config_controller(config_id: int, data: dict, db: AsyncSession):
    config = await update_field_config_service(config_id, data, db)
    if not config:
        return {"message": "FieldConfig not found"}
    
    # Tự động sync headers lên Google Sheets
    sync_success = await sync_headers_to_sheet(db)
    
    return _create_field_config_response(config, "FieldConfig updated", sync_success)

# --- Delete ---
async def delete_field_config_controller(config_id: int, db: AsyncSession):
    config = await delete_field_config_service(config_id, db)
    if not config:
        return {"message": "FieldConfig not found"}
    
    # Tự động sync headers lên Google Sheets
    sync_success = await sync_headers_to_sheet(db)
    
    return {
        "message": "FieldConfig deleted" + (" and synced to Google Sheets" if sync_success else " (sync to Google Sheets failed)"),
        "config_id": config.id,
        "sheet_synced": sync_success
    }

# --- Get by ID ---
async def get_field_config_by_id_controller(config_id: int, db: AsyncSession):
    config = await get_field_config_by_id_service(config_id, db)
    if not config:
        return {"message": "FieldConfig not found"}
    return {
        "id": config.id,
        "is_required": config.is_required,
        "excel_column_name": config.excel_column_name,
        "excel_column_letter": config.excel_column_letter
    }

# --- Get all ---
async def get_all_field_configs_controller(db: AsyncSession):
    configs = await get_all_field_configs_service(db)
    # Convert mỗi object FieldConfig sang dict
    return [
        {
            "id": c.id,
            "is_required": c.is_required,
            "excel_column_name": c.excel_column_name,
            "excel_column_letter": c.excel_column_letter
        }
        for c in configs
    ]