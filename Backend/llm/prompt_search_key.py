def get_search_key_prompt(history: str, customer_context: str, question: str) -> str:
    """
    Prompt tối ưu để sinh từ khóa tìm kiếm (search key) chính xác cho mô hình RAG.
    Dựa vào câu hỏi, ngữ cảnh hội thoại và thông tin khách hàng để tạo key tìm đúng dữ liệu.
    """
    return f"""
        Nhiệm vụ: Sinh ra từ khóa tìm kiếm (search key) NGẮN GỌN, CHÍNH XÁC và CÓ NGỮ CẢNH 
        cho hệ thống RAG, dựa vào câu hỏi khách hàng.

        ---
        Ngữ cảnh hội thoại:
        {history}

        Thông tin khách hàng:
        {customer_context}

        Câu hỏi hiện tại:
        {question}

        ---
        QUY TẮC CHÍNH:

        1. **Giữ nguyên câu hỏi nếu đã đầy đủ thông tin khóa học.**
        VD:
        - "Khóa HSK3 học những gì?" → "Khóa HSK3 học những gì"
        - "Học phí khóa giao tiếp bao nhiêu?" → "Học phí khóa giao tiếp"

        2. **Nếu thiếu thông tin**, hãy bổ sung tối thiểu dựa trên ngữ cảnh:
        - Nếu biết khách đang nói về khóa học nào → thêm tên khóa.
        - Nếu biết hình thức học → thêm "online" hoặc "offline".
        - Nếu biết địa điểm học (offline) → thêm cơ sở hoặc thành phố.

        3. **Câu hỏi về thời gian, lịch học hoặc khai giảng:**
        - Nếu ONLINE → bắt buộc có “lớp học trực tuyến” hoặc “online”.
            VD: “lịch khai giảng lớp học trực tuyến HSK3”
        - Nếu OFFLINE → phải có địa điểm cụ thể.
            VD: “lịch khai giảng HSK4 cơ sở Đống Đa Hà Nội”
        - Nếu OFFLINE và biết thành phố nhưng không rõ cơ sở → thêm tên thành phố.
            VD: “cơ sở Hà Nội”


        4. **Nếu khách hỏi học phí, ưu đãi, thời gian... mà không rõ khóa học nào:**
        → Sinh key tổng quát, nhưng vẫn trong ngữ cảnh giáo dục.  
        VD:
        - "Bao nhiêu tiền?" → "học phí các khóa học tiếng Trung"
        - "Thời gian học bao lâu?" → "thời lượng trung bình các khóa học"

        5. **Không được:**
        - Diễn giải lại hoặc dịch nghĩa câu hỏi.
        - Thêm từ đồng nghĩa hoặc chi tiết không có trong context.
        - Sinh key quá dài (> 10 từ, trừ khi cần địa điểm).

        6. **Luôn hướng đến mục tiêu RAG:**
        - Mỗi key sinh ra phải giúp mô hình tìm đúng tài liệu liên quan nhất.  
        - Tránh sinh các key mơ hồ như "học phí bao nhiêu" mà không có khóa học cụ thể.

        ---
        VÍ DỤ:

        ❇️ Đủ thông tin → Giữ nguyên:
        - "Khóa HSK3 học những gì?" → "Khóa HSK3 học những gì"
        - "Có cơ sở ở Hà Nội không?" → "Cơ sở Hà Nội"

        ❇️ Lịch học → Thêm ngữ cảnh:
        - "Khi nào khai giảng?" (online, HSK3) → "lịch khai giảng lớp học trực tuyến HSK3"
        - "Lịch tháng này?" (offline, HSK5, Hà Nội) → "lịch khai giảng HSK5 cơ sở Đống Đa Hà Nội"

        ❇️ Thiếu context → Tổng quát hợp lý:
        - "Học phí bao nhiêu?" (chưa biết khóa) → "học phí các khóa học tiếng Trung"
        - "Bao lâu thì xong?" (chưa biết khóa) → "thời lượng trung bình khóa học tiếng Trung"

        ---
        CHỈ TRẢ VỀ TỪ KHÓA (KHÔNG GIẢI THÍCH, KHÔNG GHI CHÚ).
        """
