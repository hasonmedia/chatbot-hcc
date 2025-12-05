# """
# Platform Message Service - Xử lý gửi tin nhắn đến các platform
# """
# import json
# import requests
# import traceback
# from typing import Dict, List, Optional, Any
# from sqlalchemy.orm import Session
# from models.facebook_page import FacebookPage
# from models.telegram_page import TelegramBot
# from models.zalo import ZaloBot
# from config.database import SessionLocal


# class PlatformMessageService:
#     """
#     Service để gửi tin nhắn đến các platform khác nhau - ĐỒNG BỘ (sync)
#     ⚠️ Chỉ sử dụng SessionLocal() (sync), KHÔNG dùng AsyncSession
#     """
    
#     def __init__(self, db: Optional[Session] = None):
#         """
#         Args:
#             db: Sync Session (SessionLocal), KHÔNG truyền AsyncSession!
#         """
#         self.db = db or SessionLocal()
#         self._should_close_db = db is None
    
#     def __enter__(self):
#         return self
    
#     def __exit__(self, exc_type, exc_val, exc_tb):
#         if self._should_close_db:
#             self.db.close()
    
#     def _parse_images(self, images_data: Any) -> List[str]:
#         """Parse images data thành list URLs"""
#         if not images_data:
#             return []
        
#         try:
#             if isinstance(images_data, str):
#                 return json.loads(images_data)
#             elif isinstance(images_data, list):
#                 return images_data
#             else:
#                 return [str(images_data)]
#         except Exception as e:
#             print(f"Error parsing images: {e}")
#             return []
    
#     def _extract_message_data(self, data: Any) -> tuple[List[str], Optional[str]]:
#         """Extract images và content từ data"""
#         images_data = None
#         content_data = None

#         if hasattr(data, 'image'):
#             images_data = data.image
#         elif isinstance(data, dict) and 'image' in data:
#             images_data = data['image']

#         if hasattr(data, 'content'):
#             content_data = data.content
#         elif isinstance(data, dict) and 'content' in data:
#             content_data = data['content']

#         images = self._parse_images(images_data)
#         return images, content_data
    
#     # def send_facebook_message(self, page_id: str, sender_id: str, data: Any) -> bool:
#     #     """Gửi tin nhắn Facebook"""
#     #     try:
#     #         page = self.db.query(FacebookPage).filter(FacebookPage.page_id == page_id).first()
#     #         if not page:
#     #             print(f"Facebook page {page_id} not found")
#     #             return False

#     #         PAGE_ACCESS_TOKEN = page.access_token
#     #         url_text = f"https://graph.facebook.com/v23.0/{page_id}/messages?access_token={PAGE_ACCESS_TOKEN}"
#     #         url_image = f"https://graph.facebook.com/v23.0/me/messages?access_token={PAGE_ACCESS_TOKEN}"

#     #         images, content = self._extract_message_data(data)
            
#     #         print(images, content)
#     #         # Gửi images
#     #         if images:
#     #             attachments = [{"type": "image", "payload": {"url": url}} for url in images]
#     #             payload = {"recipient": {"id": sender_id}, "message": {"attachments": attachments}}
#     #             response = requests.post(url_image, json=payload, timeout=15)
                
#     #         # Gửi text
#     #         if content:
#     #             payload = {"recipient": {"id": sender_id}, "message": {"text": content}}
#     #             response = requests.post(url_text, json=payload, timeout=15)
            
#     #         return True

#     #     except Exception as e:
#     #         traceback.print_exc()
#     #         return False
    
#     def send_telegram_message(self, chat_id: str, data: Any) -> bool:
#         """Gửi tin nhắn Telegram"""
#         try:
#             token_obj = self.db.query(TelegramBot).filter(TelegramBot.id == 1).first()
#             if not token_obj:
#                 return False
            
#             TELEGRAM_TOKEN = token_obj.bot_token
#             images, content = self._extract_message_data(data)

#             # Gửi images
#             if images:
#                 for img_url in images:
#                     photo_url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendPhoto"
#                     payload = {"chat_id": chat_id, "photo": img_url}
#                     requests.post(photo_url, json=payload, timeout=15)

#             # Gửi text
#             if content:
#                 text_url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
#                 payload = {"chat_id": chat_id, "text": content}
#                 requests.post(text_url, json=payload, timeout=15)
            
#             return True

#         except Exception as e:
#             traceback.print_exc()
#             return False
    
#     def send_zalo_message(self, chat_id: str, data: Any) -> bool:
#         """Gửi tin nhắn Zalo"""
#         try:
#             zalo_obj = self.db.query(ZaloBot).filter(ZaloBot.id == 1).first()
#             if not zalo_obj:
#                 return False
            
#             ACCESS_TOKEN = zalo_obj.access_token
#             url = "https://openapi.zalo.me/v3.0/oa/message/cs"
#             headers = {
#                 "Content-Type": "application/json",
#                 "access_token": ACCESS_TOKEN
#             }

#             images, content = self._extract_message_data(data)

#             # Gửi cả images và content
#             if images and content:
#                 attachments = [{"type": "image", "payload": {"url": url}} for url in images]
#                 payload = {
#                     "recipient": {"user_id": str(chat_id)},
#                     "message": {
#                         "text": content,
#                         "attachment": {
#                             "type": "template",
#                             "payload": {"template_type": "file", "elements": attachments}
#                         }
#                     }
#                 }
#                 response = requests.post(url, headers=headers, json=payload, timeout=15)

#             # Gửi chỉ images
#             elif images:
#                 for img_url in images:
#                     payload = {
#                         "recipient": {"user_id": str(chat_id)},
#                         "message": {
#                             "attachment": {
#                                 "type": "template", 
#                                 "payload": {
#                                     "template_type": "media", 
#                                     "elements": [{"media_type": "image", "url": img_url}]
#                                 }
#                             }
#                         }
#                     }
#                     response = requests.post(url, headers=headers, json=payload, timeout=15)

#             # Gửi chỉ content
#             elif content:
#                 payload = {"recipient": {"user_id": str(chat_id)}, "message": {"text": content}}
#                 response = requests.post(url, headers=headers, json=payload, timeout=15)
            
#             return True

#         except Exception as e:
#             traceback.print_exc()
#             return False
    
#     def send_to_platform(self, platform: str, **kwargs) -> bool:
#         """Gửi tin nhắn đến platform được chỉ định"""
#         if platform == "facebook":
#             return self.send_facebook_message(
#                 kwargs.get('page_id'), 
#                 kwargs.get('sender_id'), 
#                 kwargs.get('data')
#             )
#         elif platform == "telegram":
#             return self.send_telegram_message(
#                 kwargs.get('chat_id'),
#                 kwargs.get('data')
#             )
#         elif platform == "zalo":
#             return self.send_zalo_message(
#                 kwargs.get('chat_id'),
#                 kwargs.get('data')
#             )
#         else:
#             return False


# # Backward compatibility functions
# def send_fb(page_id: str, sender_id: str, data: Any, db: Optional[Session] = None):
#     """
#     Backward compatibility cho send_fb - ĐỒNG BỘ (sync)
#     ⚠️ Không truyền AsyncSession vào hàm này!
#     """
#     with PlatformMessageService(db) as service:
#         return service.send_facebook_message(page_id, sender_id, data)


# def send_telegram(chat_id: str, message: Any, db: Optional[Session] = None):
#     """
#     Backward compatibility cho send_telegram - ĐỒNG BỘ (sync)
#     ⚠️ Không truyền AsyncSession vào hàm này!
#     """
#     with PlatformMessageService(db) as service:
#         return service.send_telegram_message(chat_id, message)


# def send_zalo(chat_id: str, message: Any, db: Optional[Session] = None):
#     """
#     Backward compatibility cho send_zalo - ĐỒNG BỘ (sync)
#     ⚠️ Không truyền AsyncSession vào hàm này!
#     """
#     with PlatformMessageService(db) as service:
#         return service.send_zalo_message(chat_id, message)