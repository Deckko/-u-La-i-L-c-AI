# 🔮 Đế Tông Discord Bot - Đấu La Đại Lục RPG & Economy 🔮

Chào mừng đạo hữu đã đến với **Đế Tông Discord Bot** – Một hệ thống Discord Bot toàn diện, kết hợp hài hòa lối chơi nhập vai giả tưởng (RPG) lấy cảm hứng từ thế giới huyền thoại **Đấu La Đại Lục** và các tính năng kinh tế giả lập (Economy) độc đáo. 

Hệ thống được thiết kế bằng **TypeScript** tối tân, vận hành ổn định trên nền tảng **Discord.js v14**, tích hợp lưu trữ cơ sở dữ liệu **MongoDB** (thông qua Mongoose) kết hợp bộ nhớ đệm **Redis** hiệu năng cao chống nghẽn nghẹt tu vi.

---

## 🌌 Tính Năng Trọng Tâm (Major Capabilities)

### 1. 🛡️ Khai Tông Lập Phái - Đăng Ký Hệ Thống RPG
* **Ghi danh nhân vật**: Sử dụng `/dangky` để tạo tài khoản, đặt tên nhân vật, chọn Server tu luyện để bắt đầu hành trình.
* **Hồ sơ tiên nhân (`/hoso`)**: Quản lý chi tiết Cảnh giới, Cấp độ, Linh lực Lực chiến, số dư Xu Đế Tông, Danh hiệu sắc phong tông môn, và thời gian phục hồi tiên lộc.
* **Bảng xếp hạng Thiên Bảng (`/bxh`)**: Bảng vinh danh thông minh hỗ trợ phân trang tương tác trực quan bằng nút nhấn (Buttons), sắp xếp theo Level & EXP và hiển thị hạng của riêng mình.

### 2. 🪙 Hệ Thống Kinh Tế Tiên Môn (Economy & Fun)
* **Điểm danh nhận lộc (`/diemdanh`)**: Thụ nhận Xu tông môn hàng ngày với cơ chế cộng dồn chuỗi ngày (Daily Streak).
* **Tu luyện cày cuốc**: 
  * `/work`: Hành đạo làm việc tại các lĩnh vực tông môn để nhận xu ngẫu nhiên.
  * `/fish`: Đi câu cá thần tích lũy tài nguyên.
  * `/mine`: Khai khoáng tìm kiếm bảo thạch linh tinh.
* **Trò chơi giải trí & Vận khí**:
  * `/coinflip`: Thách thức may rủi sấp ngửa kiếm xu.
  * `/slot`: Máy kéo xèng ma pháp bùng nổ tài lộc.
  * `/roll`: Xoay thần số càn khôn đo lường may mắn.
  * `/shop`: Tiên các mua sắm tiên đan nâng cấp tu vi, vé tầm bảo, hoặc đao khí bảo giáp tăng lực chiến.

### 3. 🔮 Tầm Bảo Gacha Thần Địa (`/quay`)
* Tiêu tốn 50 Xu hoặc 1 Vé Tầm Bảo để mở Hỗn Độn Tầm Bảo Trận.
* Tỷ lệ Gacha công bằng được thiết lập tỉ mỉ:
  * **Sơ Cấp Thường Phẩm (55.0%)**: Nhận Lam Ngân Thảo, tăng nhẹ XP và Lực chiến.
  * **Trung Kỳ Bảo Thạch (28.0%)**: Nhận Hồn Hoàn Quỷ Hỏa Khuyển.
  * **Thượng Cổ Bảo Vật (12.0%)**: Nhận Hải Thần Tam Xoa Kích (Bán thành phẩm), sắc phong danh hiệu `Anh Hùng Hóa Hồn`.
  * **Chí Tôn Thượng Thần (4.5%)**: Nhận Cửu Vĩ Thiên Hồn Thần Cốt, sắc phong danh hiệu danh giá `Thần Vương Đấu La`.
  * **Chí Cao Vạn Cổ Thần (0.5%)**: Nhận Thiên Đế Ấn Infinity huyền thoại, bùng nổ **+15,000 Lực chiến** cùng danh hiệu độc tôn `Chí Cao Vạn Cổ Thần`.

### 4. ⚔️ Khiêu Chiến Boss Thế Giới (`/boss`)
* Hệ thống World Boss toàn server thời gian thực.
* Các nhóm lệnh: `/boss spawned`, `/boss attack`, `/boss info` hỗ trợ triệu hồi, hiển thị lượng máu HP thời gian thực, bảng xếp hạng sát thương cống hiến nhận thưởng khi diệt Boss thành công.

### 5. 💮 Phúc Lộc Thiên Thư - Hệ Thống Giftcode (`/giftcode` & `/redeem`)
* **Chưởng quản tối cao (`/giftcode create/view`)**: Lệnh giới hạn quyền Administrator quản lý/tạo Giftcode, ban thưởng Xu, tăng EXP, khống chế số lượng lượt nhập tối đa cho toàn server.
* **Đệ tử quy đổi tiên lộc (`/redeem`)**: Nhập mã Giftcode nhận linh dược dồi dào, hệ thống kiểm duyệt chống spam và giới hạn nhận một lần cho mỗi đệ tử.

---

## 🛠️ Yêu Cầu Hệ Thống & Cài Đặt Bản Địa

Đảm bảo máy chủ hoặc máy tính của bạn đã được trang bị:
* **Node.js** v18 trở lên.
* **MongoDB** (Cục bộ hoặc MongoDB Atlas trực tuyến).
* **Redis Cloud** hoặc Server Redis nội bộ (Sử dụng cấu hình fallback không lỗi nếu Redis tạm ngắt mạch).

### 1. Chuẩn bị biến môi trường (Environment Variables)
Sao chép tệp cấu hình mẫu `.env.example` thành `.env` và nhập các dữ liệu tương thích của bạn:
```bash
cp .env.example .env
```
Thiết lập các thông số cơ bản:
* `DISCORD_TOKEN`: Token bí ẩn của Discord Bot lấy từ Discord Developer Portal.
* `CLIENT_ID`: Application ID của Discord Bot.
* `MONGODB_URI`: Địa chỉ kết nối đến cơ sở dữ liệu MongoDB Tiên Môn.
* `REDIS_URL`: Chuỗi kết nối Redis (Ví dụ: `redis://127.0.0.1:6379`).

### 2. Cài đặt thư viện & Khởi chạy phát triển
```bash
# Cài đặt tất cả các gói thư viện tối tân
npm install

# Khởi chạy Bot dưới dạng môi trường phát triển (Sử dụng TSX nạp nóng nhanh chóng)
npm run dev
```

### 3. Biên dịch xây dựng sản xuất
Hệ thống sử dụng bộ chuyển dịch siêu tốc **esbuild** để đóng gói toàn bộ server TypeScript thành mã chạy Node.js tối ưu cao:
```bash
# Biên dịch đóng gói thành tệp dist/server.cjs tự động tương thích
npm run build

# Khởi chạy môi trường sản xuất độc lập ổn định
npm start
```

---

## 🐳 Triển Khai Với Docker (Production-Ready Containers)

Bot Đế Tông hỗ trợ kích hoạt Docker container hóa lý tưởng cho Cloud Run, VPS hoặc bất kỳ cụm Kubernetes nào.

**Cập nhật môi trường và kích hoạt:**
```bash
# Xây dựng Docker Image chuyên nghiệp
docker build -t detong-discord-bot .

# Chạy Docker Container
docker run -d --name detong-bot --env-file .env detong-discord-bot
```

---

## 🚀 Hướng Dẫn Đẩy Mã Nguồn Lên GitHub (`push-github.sh`)

Sử dụng kịch bản script tiện ích `push-github.sh` đã được thiết kế sẵn để đẩy mã nguồn lên kho lưu trữ mục tiêu `https://github.com/Deckko/-T-ng-AI.git`.

### Các bước thực hiện:

1. **Cấp quyền thực thi cho Script:**
   ```bash
   chmod +x push-github.sh
   ```

2. **Chạy Script để khởi tạo tự động:**
   ```bash
   ./push-github.sh
   ```

3. **Đẩy mã nguồn chính thức (Push):**
   Chạy khẩu quyết sau ở cửa sổ terminal của bạn để hoàn tất:
   ```bash
   git push -u origin main
   ```

---

## 🛡️ Bản Quyền & Phát Triển
Dự án được bảo hộ và phát triển bởi đệ tử ưu tú của Đế Tông AI. Chúc chư vị đạo hữu sớm thăng hoa cảnh giới tu vi, độc bá Đấu La Đại Lục! ✨
