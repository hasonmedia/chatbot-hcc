import asyncio
import json
import os
import traceback
from datetime import datetime, timedelta
from httplib2 import Credentials
from sqlalchemy.orm import Session
from sqlalchemy import select
from models.knowledge_base import KnowledgeBase
from models.chat import ChatSession, Message, CustomerInfo
from config.redis_cache import cache_set
from config.database import AsyncSessionLocal
import gspread
from sqlalchemy.ext.asyncio import AsyncSession

client = None
sheet = None

async def init_gsheets(db: AsyncSession = None, force: bool = False):
    global client, sheet

    if client and sheet and not force:
        return  

    try:
        close_db = False
        if db is None:
            db = AsyncSessionLocal()
            close_db = True

        # 🔹 Kiểm tra file service account
        json_path = os.getenv('GSHEET_SERVICE_ACCOUNT', 'config/config_sheet.json')
        if not os.path.exists(json_path):
            print("⚠️ Không tìm thấy file service account JSON.")
            client = None
            sheet = None
            return

        # 🔹 Khởi tạo credentials & gspread client
        # creds = Credentials.from_service_account_file(
        #     json_path,
        #     scopes=["https://www.googleapis.com/auth/spreadsheets"]
        # )
        # client = gspread.authorize(creds)
        client = gspread.service_account(filename=json_path)
        result = await db.execute(select(KnowledgeBase).filter(KnowledgeBase.id == 1))
        kb = result.scalar_one_or_none()

        if not kb:
            print("⚠️ Không tìm thấy KnowledgeBase id=1 trong DB.")
            sheet = None
            return

        spreadsheet_id = kb.customer_id  
        if not spreadsheet_id:
            print("⚠️ Không có spreadsheet_id trong KnowledgeBase.")
            sheet = None
            return
        import asyncio
        loop = asyncio.get_running_loop()
        sheet_obj = await loop.run_in_executor(None, lambda: client.open_by_key(spreadsheet_id).sheet1)

        sheet = sheet_obj
        print(f"✅ Google Sheets initialized successfully: {sheet.title}")

    except Exception as e:
        print(f"❌ Lỗi khi init Google Sheets: {e}")
        client = None
        sheet = None

    finally:
        if close_db:
            await db.close()

async def add_customer(customer_data: dict, db: AsyncSession):
    global sheet

    # 🔹 Đảm bảo sheet đã được khởi tạo
    if sheet is None:
        print("⚙️ Sheet chưa được init, tiến hành init_gsheets...")
        await init_gsheets(db)
        if sheet is None:
            print("❌ Không thể khởi tạo Google Sheets, hủy thao tác thêm khách hàng.")
            return
    try:
        from services.field_config_service import get_all_field_configs_service
        
        # Lấy cấu hình cột từ field_config
        field_configs = await get_all_field_configs_service(db)
        field_configs.sort(key=lambda x: x.excel_column_letter)
        
        if not field_configs:
            print("Chưa có cấu hình cột nào. Bỏ qua việc thêm vào Sheet.")
            return
        
        # Chuẩn bị headers và row data dựa trên field_config
        headers = [config.excel_column_name for config in field_configs]
        row = []
        
        for config in field_configs:
            # Lấy value từ customer_data dựa trên excel_column_name
            value = str(customer_data.get(config.excel_column_name, ""))
            row.append(value if value != "None" else "")
        
        # Cập nhật headers trước (đảm bảo đồng bộ)
        current_headers = sheet.row_values(1) if sheet.row_values(1) else []
        if current_headers != headers:
            sheet.clear()
            sheet.insert_row(headers, 1)
        
        # Thêm dữ liệu vào cuối sheet
        current_row_count = len(sheet.get_all_values())
        sheet.insert_row(row, index=current_row_count + 1)
        
        print(f"Thêm khách hàng vào Google Sheets thành công với {len(headers)} cột.")
        
    except Exception as e:
        print(f"Lỗi khi thêm customer vào Sheet: {e}")

async def extract_customer_info_background(session_id: int, manager):
    """
    ✅ Background task để thu thập thông tin khách hàng
    - Luôn tạo AsyncSessionLocal() mới
    """
    # ✅ Luôn tạo session mới cho background task
    async with AsyncSessionLocal() as new_db:
        try:
            from llm.help_llm import get_current_model
            from llm.gpt import extract_customer_info_gpt
            from llm.gemini import extract_customer_info_gemini
            from services.field_config_service import get_all_field_configs_service
        
            # Lấy cấu hình cột từ field_config
            field_configs = await get_all_field_configs_service(new_db)
            required_fields = [fc.excel_column_name for fc in field_configs if fc.is_required]
            print(f"Yêu cầu điền các trường: {required_fields}")
            # Lấy thông tin model hiện tại
            model_info = await get_current_model(new_db, chat_session_id=session_id)
            model_type = model_info["name"].lower()
            api_key = model_info["key"]
            key_name = model_info.get("key_name", "default")
            
            print(f"🔍 Extract customer info - Session {session_id}, Model: {model_type}, Key: {key_name}")
            
            # Gọi hàm extract tương ứng
            if "gpt" in model_type:
                extracted_info = await extract_customer_info_gpt(
                    api_key=api_key,
                    db_session=new_db,
                    chat_session_id=session_id,
                    limit_messages=15
                )
            elif "gemini" in model_type:
                extracted_info = await extract_customer_info_gemini(
                    api_key=api_key,
                    db_session=new_db,
                    chat_session_id=session_id,
                    limit_messages=15
                )
            else:
                print(f"⚠️ Unknown model type: {model_type}")
                extracted_info = None
            
            print("EXTRACTED JSON RESULT:", extracted_info)
            
            if extracted_info and extracted_info != "null":
                customer_data = json.loads(extracted_info)
                required_filled = all(
                    customer_data.get(field) not in (None, "", "null", False)
                    for field in required_fields
                )
                if required_filled:
                    # Kiểm tra xem đã có thông tin khách hàng này chưa
                    result = await new_db.execute(
                        select(CustomerInfo).filter(CustomerInfo.chat_session_id == session_id)
                    )
                    existing_customer = result.scalar_one_or_none()

                    final_customer_data = None
                    should_set_alert = False
                # has_useful_info = any(
                #             v is not None and v != "" and v != "null" and v is not False
                #             for v in customer_data.values()
                #         )
                
                # if has_useful_info:
                #     # Kiểm tra xem đã có thông tin khách hàng này chưa
                #     result = await new_db.execute(
                #         select(CustomerInfo).filter(CustomerInfo.chat_session_id == session_id)
                #     )
                #     existing_customer = result.scalar_one_or_none()
                    
                #     should_set_alert = False  # ✅ Flag để xác định có nên set alert không
                #     final_customer_data = None
                    
                    if existing_customer:
                        # Cập nhật thông tin hiện có với thông tin mới
                        existing_data = existing_customer.customer_data or {}
                        
                        # Merge data: ưu tiên thông tin mới nếu không null
                        updated_data = existing_data.copy()
                        has_new_info = False
                        
                        for key, value in customer_data.items():
                            if value is not None and value != "" and value != "null":
                                if key not in existing_data or existing_data[key] != value:
                                    updated_data[key] = value
                                    has_new_info = True
                        
                        existing_customer.customer_data = updated_data
                        final_customer_data = updated_data
                        print(f"📝 Cập nhật thông tin khách hàng {session_id}: {updated_data}")
                        
                        # ✅ Chỉ set alert nếu có thông tin mới
                        if has_new_info:
                            should_set_alert = True
                    else:
                        # Tạo mới nếu chưa có
                        customer = CustomerInfo(
                            chat_session_id=session_id,
                            customer_data=customer_data
                        )
                        new_db.add(customer)
                        final_customer_data = customer_data
                        should_set_alert = True
                        print(f"🆕 Tạo mới thông tin khách hàng {session_id}: {customer_data}")
                    
                    # ✅ Set alert nếu cần
                    if should_set_alert:
                        result = await new_db.execute(select(ChatSession).filter(ChatSession.id == session_id))
                        chat_session = result.scalar_one_or_none()
                        if chat_session:
                            chat_session.alert = "true"
                            print(f"🔔 Bật thông báo alert cho session {session_id}")
                    
                    await new_db.commit()
                    
                    # ✅ Sync lên Google Sheets - wrap trong try-except riêng để không rollback DB nếu fail
                    if should_set_alert and final_customer_data:
                        try:
                            await add_customer(final_customer_data, new_db)
                            print(f"📊 Đã sync customer {session_id} lên Google Sheets")
                        except Exception as sheet_error:
                            print(f"⚠️ Lỗi khi sync lên Google Sheets: {sheet_error}")
                            # Không raise exception - DB đã commit thành công
                    
                    # ✅ Gửi WebSocket nếu có thông tin cần cập nhật
                    if should_set_alert and final_customer_data:
                        customer_update = {
                            "chat_session_id": session_id,
                            "customer_data": final_customer_data,
                            "type": "customer_info_update"
                        }
                        await manager.broadcast_to_admins(customer_update)
                        print(f"📡 Đã gửi customer_info_update cho session {session_id}")
                    
                    
        except Exception as extract_error:
            print(f"Lỗi khi trích xuất thông tin background: {extract_error}")





async def save_message_to_db_background(data: dict, sender_name: str, image_url: list):
    """Background task: Tạo DB session riêng để lưu tin nhắn"""
    async with AsyncSessionLocal() as new_db:
        try:
            message = Message(
                chat_session_id=data.get("chat_session_id"),
                sender_type=data.get("sender_type"),
                content=data.get("content"),
                sender_name=sender_name,
                image=json.dumps(image_url) if image_url else None
            )
            new_db.add(message)
            await new_db.commit()
            print(f"✅ [Background] Đã lưu tin nhắn ID: {message.id}")
            
        except Exception as e:
            print(f"❌ [Background] Lỗi lưu tin nhắn: {e}")
            traceback.print_exc()
            await new_db.rollback()




async def update_session_admin_background(chat_session_id: int, sender_name: str):
    """Background task: Tạo DB session riêng để cập nhật session"""
    async with AsyncSessionLocal() as new_db:
        try:
            result = await new_db.execute(select(ChatSession).filter(ChatSession.id == chat_session_id))
            db_session = result.scalar_one_or_none()
            if db_session:
                db_session.status = "false"
                db_session.time = datetime.now() + timedelta(hours=1)
                db_session.previous_receiver = db_session.current_receiver
                db_session.current_receiver = sender_name
                await new_db.commit()
                
                # Cập nhật cache
                session_cache_key = f"session:{chat_session_id}"
                session_data = {
                    'id': db_session.id,
                    'name': db_session.name,
                    'status': db_session.status,
                    'channel': db_session.channel,
                    'page_id': db_session.page_id,
                    'current_receiver': db_session.current_receiver,
                    'previous_receiver': db_session.previous_receiver,
                    'time': db_session.time.isoformat() if db_session.time else None
                }
                cache_set(session_cache_key, session_data, ttl=300)
                print(f"✅ [Background] Đã cập nhật session {chat_session_id}")
                
        except Exception as e:
            print(f"❌ [Background] Lỗi cập nhật session: {e}")
            traceback.print_exc()
            await new_db.rollback()


async def send_to_platform_background(channel: str, page_id: str, recipient_id: str, message_data: dict, images=None):
    """Background task: Gửi tin nhắn đến platform tương ứng"""
    try:
        # Import các hàm send platform từ helper
        from helper.help_send_social import send_fb, send_telegram, send_zalo
        
        if channel == "facebook":
            await send_fb(page_id, recipient_id, message_data, images)
        elif channel == "telegram":
            await send_telegram(recipient_id, message_data)
        elif channel == "zalo":
            await send_zalo(recipient_id, message_data, images)
            
            
    except Exception as e:
        print(f"❌ [Background] Lỗi gửi tin nhắn {channel}: {e}")
        traceback.print_exc()


async def _generate_bot_response_common(
    user_content: str,
    chat_session_id: int,
    session_data: dict,
    new_db: AsyncSession
) -> dict:
    
    from llm.help_llm import get_current_model
    from llm.gpt import generate_gpt_response
    from llm.gemini import generate_gemini_response
    
    # Lấy thông tin model hiện tại với Round-Robin API key
    model_info = await get_current_model(new_db, chat_session_id=chat_session_id)
    model_type = model_info["name"].lower()
    api_key = model_info["key"]
    key_name = model_info.get("key_name", "default")
    
    print(f"🤖 Session {chat_session_id} - Model: {model_type}, Key: {key_name}")
    
    # Gọi hàm generate tương ứng (function-based)
    if "gpt" in model_type:
        mes = await generate_gpt_response(
            api_key=api_key,
            db_session=new_db,
            query=user_content,
            chat_session_id=session_data["id"],
            model_type=model_type
        )
    elif "gemini" in model_type:
        mes = await generate_gemini_response(
            api_key=api_key,
            db_session=new_db,
            query=user_content,
            chat_session_id=session_data["id"],
            model_type=model_type
        )
    else:
        raise ValueError(f"Unknown model type: {model_type}")
    
    # Lưu bot message vào database
    message_bot = Message(
        chat_session_id=chat_session_id,
        sender_type="bot",
        content=mes
    )
    new_db.add(message_bot)
    await new_db.commit()
    await new_db.refresh(message_bot)
    
    return {
        "id": message_bot.id,
        "chat_session_id": message_bot.chat_session_id,
        "sender_type": message_bot.sender_type,
        "sender_name": message_bot.sender_name,
        "content": message_bot.content
    }


async def generate_and_send_bot_response_background(
    user_content: str, 
    chat_session_id: int, 
    session_data: dict,
    manager
):
    """🚀 Background task: Generate bot response và gửi qua WebSocket"""
    async with AsyncSessionLocal() as new_db:
        try:
            # Generate response sử dụng hàm chung
            bot_message_data = await _generate_bot_response_common(
                user_content, chat_session_id, session_data, new_db
            )
            
            # Tạo bot message để gửi qua websocket
            bot_message = {
                **bot_message_data,
                "session_name": session_data["name"],
                "session_status": session_data["status"],
                "current_receiver": session_data.get("current_receiver"),
                "previous_receiver": session_data.get("previous_receiver")
            }
            
            # Gửi bot response qua websocket
            await manager.broadcast_to_admins(bot_message)
            
            await manager.send_to_customer(chat_session_id, bot_message)
            
            
        except Exception as e:
            print(f"❌ [Background] Lỗi tạo bot response: {e}")
            traceback.print_exc()
            await new_db.rollback()


async def generate_and_send_platform_bot_response_background(
    user_content: str, 
    chat_session_id: int, 
    session_data: dict,
    platform: str,
    page_id: str,
    sender_id: str,
    manager
):
    async with AsyncSessionLocal() as new_db:
        try:
            from helper.help_send_social import send_fb, send_telegram, send_zalo
            
            # Generate response sử dụng hàm chung
            bot_message_data = await _generate_bot_response_common(
                user_content, chat_session_id, session_data, new_db
            )
            
            # Tạo bot message để gửi
            bot_message = {
                **bot_message_data,
                "session_name": session_data["name"],
                "platform": platform,
                "session_status": session_data["status"]
            }
            
            # Gửi bot response qua websocket cho admin
            await manager.broadcast_to_admins(bot_message)

            
            # ✅ Gửi về platform tương ứng (async, không block)
            if platform == "facebook":
                await send_fb(page_id, sender_id, bot_message, None)
            elif platform == "telegram":
                await send_telegram(sender_id, bot_message)
            elif platform == "zalo":
                await send_zalo(sender_id, bot_message, None)            
        except Exception as e:
            traceback.print_exc()
            await new_db.rollback()