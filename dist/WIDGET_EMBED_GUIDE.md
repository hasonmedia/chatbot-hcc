# 🚀 Hướng dẫn nhúng Chatbot Widget vào Website

## 📋 Yêu cầu
- Website có thể chạy JavaScript
- Trình duyệt hỗ trợ WebSocket (Chrome, Firefox, Safari, Edge...)
- HTTPS (nếu backend dùng WSS)

## 🎯 Cách nhúng Widget

### Cách 1: Nhúng vào HTML (Đơn giản nhất)

Thêm đoạn code sau vào **cuối thẻ `<body>`** của trang web:

```html
<script 
    src="https://chatbotfe.a2alab.vn/widget.js"
    data-api-url="https://chatbotbe.a2alab.vn"
    data-ws-url="wss://chatbotbe.a2alab.vn"
></script>
```

### Cách 2: Nhúng động bằng JavaScript

```javascript
(function() {
    const script = document.createElement('script');
    script.src = 'https://chatbotfe.a2alab.vn/widget.js';
    script.setAttribute('data-api-url', 'https://chatbotbe.a2alab.vn');
    script.setAttribute('data-ws-url', 'wss://chatbotbe.a2alab.vn');
    document.body.appendChild(script);
})();
```

### Cách 3: Dùng Google Tag Manager

1. Vào GTM → Tags → New Tag
2. Chọn Custom HTML
3. Paste code:
```html
<script 
    src="https://chatbotfe.a2alab.vn/widget.js"
    data-api-url="https://chatbotbe.a2alab.vn"
    data-ws-url="wss://chatbotbe.a2alab.vn"
></script>
```
4. Trigger: All Pages
5. Publish

## 🔧 Tùy chỉnh (Optional)

### Thay đổi API URL
```html
<script 
    src="https://chatbotfe.a2alab.vn/widget.js"
    data-api-url="https://your-custom-backend.com"
    data-ws-url="wss://your-custom-backend.com"
></script>
```

### Local Development
```html
<script 
    src="http://localhost:5173/widget.js"
    data-api-url="http://localhost:8000"
    data-ws-url="ws://localhost:8000"
></script>
```

## ✅ Kiểm tra Widget đã hoạt động chưa

### 1. Kiểm tra file widget.js tồn tại
Mở trình duyệt và truy cập: https://chatbotfe.a2alab.vn/widget.js
- **Thấy code JavaScript** → ✅ OK
- **Lỗi 404** → ❌ File chưa được deploy

### 2. Mở Console (F12)
Sau khi nhúng widget, mở Developer Tools (F12) → Console tab:

**Thành công:** Bạn sẽ thấy:
```
✅ Tạo session mới: 123
✅ Connected to chat server
```

**Lỗi:** Nếu thấy lỗi CORS hoặc WebSocket error, xem phần Troubleshooting

### 3. Kiểm tra giao diện
- Nút chat 💬 xuất hiện ở góc dưới bên phải
- Click vào nút → chatbox mở ra
- Gửi tin nhắn thử → nhận được phản hồi từ bot

## 🐛 Troubleshooting

### Lỗi 1: CORS Error
```
Access to script at 'https://chatbotfe.a2alab.vn/widget.js' from origin 'https://yourwebsite.com' 
has been blocked by CORS policy
```

**Giải pháp:** Cần cấu hình CORS ở server Frontend (nginx.conf):
```nginx
location /widget.js {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
}
```

### Lỗi 2: WebSocket Connection Failed
```
WebSocket connection to 'wss://chatbotbe.a2alab.vn/chat/ws/customer' failed
```

**Nguyên nhân:**
- Backend chưa bật hoặc chưa deploy
- URL WebSocket sai
- Certificate SSL có vấn đề

**Giải pháp:**
1. Kiểm tra backend có chạy không: `curl https://chatbotbe.a2alab.vn/docs`
2. Thử dùng HTTP/WS thay vì HTTPS/WSS (chỉ khi test local)
3. Kiểm tra SSL certificate

### Lỗi 3: Widget không hiện
**Nguyên nhân:**
- Script tag chưa được thêm vào HTML
- Script bị load trước khi DOM ready
- Có conflict với CSS/JS khác

**Giải pháp:**
1. Kiểm tra script tag đã có trong HTML chưa (View Page Source)
2. Đặt script tag ở **cuối thẻ `</body>`**
3. Kiểm tra z-index của widget (mặc định: 9999)

### Lỗi 4: Không gửi được tin nhắn
**Nguyên nhân:**
- WebSocket chưa kết nối
- Session chưa được tạo

**Giải pháp:**
- Mở Console (F12) xem log
- Xem trạng thái kết nối (đèn xanh = đã kết nối)
- Reload lại trang

## 📊 Các platforms đã test

| Platform | Status | Note |
|----------|--------|------|
| WordPress | ✅ OK | Paste vào theme footer hoặc dùng plugin Insert Headers and Footers |
| Shopify | ✅ OK | Theme.liquid → trước `</body>` |
| Wix | ✅ OK | Settings → Custom Code → Body End |
| HTML thuần | ✅ OK | Paste vào file HTML |
| React/Vue/Angular | ✅ OK | Thêm vào index.html hoặc component |
| Google Tag Manager | ✅ OK | Custom HTML Tag |

## 🎨 Tùy chỉnh giao diện

Hiện tại widget có style cố định. Nếu muốn tùy chỉnh, có thể:

### 1. Thay đổi màu sắc (cần sửa widget.js)
```javascript
// Thay gradient này
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### 2. Thay đổi vị trí
```javascript
// Mặc định: bottom:20px; right:20px;
// Có thể thay thành: bottom:20px; left:20px;
```

### 3. Thay đổi tên bot
```javascript
let botName = "Bot"; // Đổi thành tên bạn muốn
```

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra Console (F12) xem có lỗi gì không
2. Kiểm tra Network tab xem request có thành công không
3. Liên hệ team support với thông tin:
   - URL website đang nhúng
   - Screenshot lỗi trong Console
   - Browser và OS đang dùng

## 🔐 Bảo mật

Widget tự động:
- Escape HTML để tránh XSS
- Lưu session ID trong localStorage
- Chỉ cho phép kết nối từ các domain được config trong backend CORS
- Sử dụng WSS (WebSocket Secure) khi production

## 📈 Analytics

Widget tự động track:
- Số lượng session mới
- URL của trang web nhúng widget
- Lịch sử chat của mỗi session

Xem trong Admin Dashboard để theo dõi metrics.
