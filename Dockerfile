# ==============================================================================
# 🐳 SINGLE-STAGE DOCKERFILE FOR DE TONG DISCORD BOT
# Đơn giản hóa cấu trúc chạy bằng tsx để bảo toàn cấu trúc thư mục động
# ==============================================================================

FROM node:20-slim

WORKDIR /app

# Sao chép thông tin gói cài đặt thư viện
COPY package*.json ./

# Cài đặt toàn bộ dependencies (bao gồm cả tsx phục vụ chạy file .ts trực tiếp)
RUN npm install

# Sao chép toàn bộ mã nguồn vào vùng làm việc
COPY . .

# Khởi lệnh khởi động hệ thống Discord Bot Đế Tông bằng tsx
CMD ["npm", "start"]
