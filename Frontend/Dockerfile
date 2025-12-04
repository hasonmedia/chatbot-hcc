FROM node:lts-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html/

# Copy file cấu hình Nginx (giả định file này nằm cùng cấp với Dockerfile, 
# tức là tại ./Frontend/nginx.conf)
# Nếu file nginx.conf nằm trong thư mục gốc của repo (./nginx/default.conf),
# bạn cần đảm bảo Dockerfile này có thể truy cập được file đó.
# TẠM GIẢ ĐỊNH file nginx.conf được copy từ thư mục Context (./Frontend)
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
