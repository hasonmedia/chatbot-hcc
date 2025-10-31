# 📋 Widget Implementation Summary

## ✅ **Đã hoàn thành tất cả các thay đổi**

### 🔧 **Backend Changes**

#### 1. **`chat_service.py`** - Services Layer

**`create_session_service`** (Lần đầu - POST)
```python
async def create_session_service(url_channel: str, db):
    session = ChatSession(
        name=f"W-{random.randint(10**7, 10**8 - 1)}",
        channel="web",
        url_channel = url_channel or "https://chatbotbe.a2alab.vn/chat"
    )
    # ... commit và return session.id
```

**`check_session_service`** (Từ lần 2 - GET)
```python
async def check_session_service(sessionId, url_channel, db):
    result = await db.execute(select(ChatSession).filter(ChatSession.id == sessionId))
    session = result.scalar_one_or_none()
    if session:
        return session.id
    
    # Nếu session không tồn tại, tạo mới với url_channel
    session = ChatSession(
        name=f"W-{random.randint(10**7, 10**8 - 1)}",
        channel="web",
        url_channel = url_channel or "https://chatbotbe.a2alab.vn/chat"
    )
    # ... commit và return session.id
```

#### 2. **`chat_controller.py`** - Controllers Layer

```python
async def create_session_controller(url_channel: str, db: AsyncSession):
    chat = await create_session_service(url_channel, db)
    return {"id": chat}

async def check_session_controller(sessionId, url_channel, db: AsyncSession):
    chat = await check_session_service(sessionId, url_channel, db)
    return {"id": chat}
```

#### 3. **`chat_router.py`** - Routes Layer

**POST /chat/session** (Tạo session mới)
```python
@router.post("/session")
async def create_session(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        body = await request.json()
        url_channel = body.get("url_channel")
    except:
        url_channel = None
    return await create_session_controller(url_channel, db)
```

**GET /chat/session/{sessionId}** (Kiểm tra session cũ)
```python
@router.get("/session/{sessionId}")
async def check_session(
    sessionId: int, 
    url_channel: Optional[str] = Query(None, description="URL của trang web sử dụng widget"),
    db: AsyncSession = Depends(get_db)
):
    return await check_session_controller(sessionId, url_channel, db)
```

---

### 🎨 **Frontend Changes**

#### **`widget.js`** - Widget Script

**Session Management Logic:**

```javascript
async function checkSession() {
    let currentSessionId = localStorage.getItem("chatSessionId");
    
    if (!currentSessionId) {
        // 🆕 Lần đầu: POST /chat/session
        const res = await fetch(`${API_URL}/chat/session`, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                url_channel: window.location.href  // ✅ Gửi URL trang web
            })
        });
        const data = await res.json();
        currentSessionId = data.id;
        localStorage.setItem("chatSessionId", currentSessionId);
        console.log("✅ Tạo session mới:", currentSessionId);
        
    } else {
        // 🔄 Từ lần 2: GET /chat/session/{sessionId}
        try {
            const checkUrl = new URL(`${API_URL}/chat/session/${currentSessionId}`);
            checkUrl.searchParams.append('url_channel', window.location.href);  // ✅ Gửi qua query params
            
            const res = await fetch(checkUrl.toString());
            if (res.ok) {
                const data = await res.json();
                currentSessionId = data.id;
                console.log("✅ Sử dụng session cũ:", currentSessionId);
            } else {
                throw new Error("Session không tồn tại");
            }
        } catch (err) {
            // ⚠️ Session cũ không hợp lệ, tạo mới
            console.log("⚠️ Session cũ không hợp lệ, tạo session mới");
            // ... POST /chat/session với url_channel
        }
    }
    
    sessionId = currentSessionId;
    return sessionId;
}
```

---

## 🎯 **Flow hoạt động chi tiết**

### **Lần đầu tiên user vào trang:**

```
1. Widget load → checkSession()
   ↓
2. localStorage.getItem("chatSessionId") → null
   ↓
3. POST /chat/session
   Body: { "url_channel": "https://example.com/page1" }
   ↓
4. Backend tạo ChatSession mới:
   - name: "W-12345678"
   - channel: "web"
   - url_channel: "https://example.com/page1"
   ↓
5. Response: { "id": 123 }
   ↓
6. localStorage.setItem("chatSessionId", 123)
   ↓
7. Kết nối WebSocket với sessionId=123
   ↓
8. Load lịch sử chat (nếu có)
   ↓
9. Sẵn sàng chat! 💬
```

### **Lần thứ 2 (user quay lại trang):**

```
1. Widget load → checkSession()
   ↓
2. localStorage.getItem("chatSessionId") → 123
   ↓
3. GET /chat/session/123?url_channel=https://example.com/page1
   ↓
4. Backend kiểm tra:
   ├─ Session 123 tồn tại? → Response: { "id": 123 }
   └─ Không tồn tại? → Tạo session mới với url_channel
   ↓
5. Kết nối WebSocket với sessionId=123
   ↓
6. Load lịch sử chat
   ↓
7. Tiếp tục chat! 💬
```

---

## 📊 **So sánh 2 endpoints**

| Feature | POST /chat/session | GET /chat/session/{id} |
|---------|-------------------|------------------------|
| **Khi nào dùng** | Lần đầu tiên | Từ lần 2 trở đi |
| **Nhận url_channel** | ✅ Qua body | ✅ Qua query params |
| **Tạo session mới** | ✅ Luôn luôn | ✅ Nếu không tồn tại |
| **localStorage** | Lưu sessionId | Dùng sessionId cũ |

---

## 🚀 **Lợi ích của thiết kế này**

✅ **url_channel được lưu chính xác** - Biết tin nhắn đến từ trang web nào  
✅ **Session management thông minh** - Tự động tạo mới nếu cần  
✅ **Giảm tải database** - Check session trước khi tạo mới  
✅ **UX tốt hơn** - Giữ lại lịch sử chat khi user quay lại  
✅ **Flexible** - Hoạt động trên nhiều trang web khác nhau  

---

## 🧪 **Testing Scenarios**

### **Test 1: Lần đầu tiên**
```
1. Xóa localStorage
2. Mở trang có widget
3. Kiểm tra Console: "✅ Tạo session mới: 123"
4. Kiểm tra Database: ChatSession với url_channel = window.location.href
```

### **Test 2: Quay lại trang**
```
1. Giữ localStorage (có sessionId)
2. Refresh trang
3. Kiểm tra Console: "✅ Sử dụng session cũ: 123"
4. Lịch sử chat vẫn còn
```

### **Test 3: Session bị xóa từ database**
```
1. Xóa session từ database
2. Refresh trang
3. Kiểm tra Console: "⚠️ Session cũ không hợp lệ, tạo session mới"
4. Session mới được tạo với url_channel mới
```

### **Test 4: Nhiều trang web khác nhau**
```
1. Nhúng widget vào page1.html
2. Nhúng widget vào page2.html
3. Kiểm tra database: Mỗi trang có url_channel riêng
```

---

## 📝 **Database Schema**

```sql
CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,           -- "W-12345678"
    channel VARCHAR(50) NOT NULL,         -- "web"
    url_channel TEXT,                     -- "https://example.com/page1"
    status VARCHAR(20) DEFAULT 'true',
    created_at TIMESTAMP DEFAULT NOW(),
    ...
);
```

---

## 🎉 **Kết luận**

Tất cả đã hoàn thành! Widget giờ đây:

1. ✅ Tạo session với `url_channel` lần đầu
2. ✅ Kiểm tra session cũ với `url_channel` từ lần 2
3. ✅ Tự động tạo session mới nếu session cũ không tồn tại
4. ✅ Lưu nguồn tin nhắn (URL trang web) chính xác
5. ✅ Hoạt động mượt mà trên mọi website

🚀 **Ready to deploy!**
