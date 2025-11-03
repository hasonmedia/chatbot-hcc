FROM python:3.11-slim

# Set working dir
WORKDIR /app

# Cài đặt các dependency hệ thống tối thiểu (ví dụ psycopg2 cần libpq)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy file requirements trước (tận dụng cache)
COPY requirements.txt .

# Cài Python dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ source
COPY . .

# Expose port
EXPOSE 8000

# Chạy bằng Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--loop", "asyncio"]