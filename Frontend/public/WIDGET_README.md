# 🤖 Chatbot Widget - Hướng dẫn nhúng vào website

## 📋 Tổng quan

Widget chatbot cho phép bạn dễ dàng tích hợp chatbot AI vào bất kỳ website nào chỉ với **1 dòng code**.

## ✨ Tính năng

- ✅ **Chat realtime** qua WebSocket
- ✅ **Session Management** tự động
- ✅ **Load lịch sử chat** khi quay lại
- ✅ **Auto reconnect** khi mất kết nối
- ✅ **Typing indicator** khi bot đang trả lời
- ✅ **Auto-resize textarea** (Shift+Enter xuống dòng)
- ✅ **Hiển thị hình ảnh** trong tin nhắn
- ✅ **Responsive design** cho mobile
- ✅ **Giao diện đẹp**, hiện đại

## 🚀 Cách sử dụng

### 1️⃣ Cơ bản (Development)

Thêm dòng code này vào **trước thẻ `</body>`** của website:

```html
<!-- Thêm vào trước thẻ </body> -->
<script src="http://localhost:5173/widget.js"></script>
```

### 2️⃣ Production (Tùy chỉnh API URL)

```html
<!-- Thêm vào trước thẻ </body> -->
<script 
    src="https://yourdomain.com/widget.js"
    data-api-url="https://chatbotbe.a2alab.vn"
    data-ws-url="wss://chatbotbe.a2alab.vn"
></script>
```

### 3️⃣ Demo page

Mở file `demo.html` trong trình duyệt để xem demo.

## 📦 Cấu hình

### Attributes

| Attribute | Mô tả | Default | Ví dụ |
|-----------|-------|---------|-------|
| `src` | URL của file widget.js | - | `https://yourdomain.com/widget.js` |
| `data-api-url` | URL Backend API | `http://localhost:8000` | `https://chatbotbe.a2alab.vn` |
| `data-ws-url` | URL WebSocket Server | `ws://localhost:8000` | `wss://chatbotbe.a2alab.vn` |

## 🔧 Cách hoạt động

### Session Management

1. **Lần đầu tiên**: 
   - Tạo session mới qua API `POST /chat/session`
   - Lưu `sessionId` vào `localStorage`
   - Lưu `url_channel` (URL trang web hiện tại)

2. **Từ lần 2 trở đi**:
   - Kiểm tra `sessionId` trong `localStorage`
   - Gọi API `GET /chat/session/{sessionId}` để kiểm tra session còn tồn tại
   - Nếu không tồn tại → tạo session mới

### WebSocket Connection

```javascript
// Kết nối WebSocket
ws://localhost:8000/chat/ws/customer?sessionId={sessionId}

// Format tin nhắn gửi đi
{
    "chat_session_id": 123,
    "sender_type": "customer",
    "content": "Xin chào!"
}

// Format tin nhắn nhận về
{
    "id": 456,
    "chat_session_id": 123,
    "sender_type": "bot",
    "content": "Xin chào! Tôi có thể giúp gì cho bạn?",
    "created_at": "2025-10-13T10:30:00",
    "image": []
}
```

## 🎨 Tùy chỉnh giao diện

Widget sử dụng **inline styles**, bạn có thể tùy chỉnh bằng cách:

### 1. Sửa trực tiếp trong `widget.js`

Tìm đoạn code CSS trong file và chỉnh sửa:

```javascript
chatButton.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    // Thay đổi màu sắc, kích thước, vị trí...
`;
```

### 2. Override bằng CSS trong website

```css
/* Thêm vào CSS của website */
#chatButton {
    background: #ff6b6b !important;
}
```

## 📱 Responsive

Widget tự động responsive cho các thiết bị:
- 💻 Desktop: 380px x 550px
- 📱 Mobile: Tự động điều chỉnh

## 🔐 Bảo mật

- ✅ Session được lưu trong `localStorage` (chỉ trên client)
- ✅ WebSocket sử dụng `wss://` cho production
- ✅ CORS được cấu hình đúng trên backend

## 🐛 Debug

Mở Console của trình duyệt (F12) để xem logs:

```javascript
// Logs hữu ích
✅ Tạo session mới: 123
✅ Sử dụng session cũ: 123
✅ Connected to chat server
📩 Received message: {...}
❌ Disconnected from chat server
```

## 📚 API Endpoints

### Backend API

- `POST /chat/session` - Tạo session mới
  ```json
  // Request body
  {
    "url_channel": "https://example.com/page"
  }
  
  // Response
  {
    "id": 123
  }
  ```

- `GET /chat/session/{sessionId}` - Kiểm tra session
  ```json
  // Response
  {
    "id": 123
  }
  ```

- `GET /chat/history/{sessionId}?page=1&limit=10` - Lấy lịch sử chat
  ```json
  // Response
  {
    "messages": [...]
  }
  ```

### WebSocket

- `ws://localhost:8000/chat/ws/customer?sessionId={id}` - Customer WebSocket

## 🚧 Troubleshooting

### Lỗi kết nối WebSocket

```
❌ WebSocket connection failed
```

**Giải pháp:**
1. Kiểm tra backend đang chạy
2. Kiểm tra URL WebSocket đúng chưa
3. Kiểm tra CORS settings

### Session không tồn tại

```
⚠️ Session cũ không hợp lệ, tạo session mới
```

**Nguyên nhân:** Session bị xóa khỏi database hoặc hết hạn.

**Giải pháp:** Widget tự động tạo session mới.

### Tin nhắn không hiển thị

1. Mở Console (F12)
2. Kiểm tra logs WebSocket
3. Kiểm tra API `/chat/history/{sessionId}`

## 📞 Hỗ trợ

- 📧 Email: support@a2alab.vn
- 🌐 Website: https://chatbotbe.a2alab.vn
- 📱 Demo: Mở file `demo.html`

## 📝 Changelog

### Version 1.0.0 (2025-10-13)
- ✅ Session management tự động
- ✅ Load lịch sử chat
- ✅ Auto reconnect WebSocket
- ✅ Typing indicator
- ✅ Auto-resize textarea
- ✅ Image support
- ✅ Responsive design
- ✅ Giao diện gradient đẹp

## 📄 License

© 2025 A2A Lab - All rights reserved
