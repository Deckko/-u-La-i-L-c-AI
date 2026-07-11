# BÁO CÁO THỰC TẬP & NHẬT KÝ THỰC TẬP CHI TIẾT

## THÔNG TIN CHUNG
* **Họ và tên sinh viên**: [Họ và Tên Sinh Viên]
* **Đơn vị thực tập**: Công ty Cổ phần Công nghệ & Truyền thông DECKKO
* **Vị trí thực tập**: Thực tập sinh Phát triển Web (Web Developer Intern)
* **Thời gian thực tập**: 8 tuần (Từ 04/05/2026 đến 29/06/2026)
* **Người hướng dẫn tại doanh nghiệp**: Kỹ sư Nguyễn Văn A (Tech Lead)

---

## NHẬT KÝ THỰC TẬP THEO TUẦN

### Tuần 1: Hội nhập doanh nghiệp, tìm hiểu quy trình và nhận đề tài
* **Nội dung công việc**:
  * Tham gia buổi định hướng doanh nghiệp, tìm hiểu nội quy và văn hóa công ty.
  * Tiếp cận hạ tầng kỹ thuật và tìm hiểu quy trình làm việc Agile/Scrum của nhóm phát triển.
  * Nhận đề tài thực tập tốt nghiệp: **"Xây dựng hệ thống thương mại điện tử tích hợp AI Chatbot bán hàng và công cụ tìm kiếm ngữ nghĩa (Semantic RAG Search)"**.
  * Thiết lập môi trường phát triển cục bộ (Git, NodeJS, VS Code).
* **Kết quả đạt được**: Hiểu rõ yêu cầu đề tài, cài đặt thành công công cụ phát triển, kết nối thành công kho lưu trữ Git của công ty.

### Tuần 2: Khảo sát quy trình nghiệp vụ và đặc tả yêu cầu hệ thống
* **Nội dung công việc**:
  * Thực hiện phỏng vấn cán bộ quản lý kho và bộ phận chăm sóc khách hàng tại doanh nghiệp nhằm khảo sát quy trình bán hàng thực tế.
  * Phân tích nghiệp vụ thanh toán, kiểm kho, xử lý đơn hàng và cơ chế tư vấn khách hàng tự động.
  * Đặc tả các yêu cầu chức năng (chọn sản phẩm, quản lý giỏ hàng, tra cứu đơn hàng, AI tư vấn chất liệu, phom dáng) và phi chức năng (bảo mật dữ liệu, tốc độ phản hồi AI dưới 1.5s, tương thích mobile).
* **Kết quả đạt được**: Hoàn thiện tài liệu đặc tả yêu cầu (SRS) sơ bộ cho hệ thống thương mại điện tử DECKKO.

### Tuần 3: Thiết kế cơ sở dữ liệu và kiến trúc hệ thống
* **Nội dung công việc**:
  * Thiết kế sơ đồ thực thể liên kết (ERD) cho database quan hệ của hệ thống gồm các bảng: `users`, `roles`, `products`, `product_variants`, `orders`, `order_items`, `payments`.
  * Nghiên cứu tích hợp vector database Qdrant phục vụ tìm kiếm ngữ nghĩa bán hàng.
  * Thiết kế kiến trúc tổng thể kết nối 3 lớp: Frontend (Next.js 16) ↔ Backend (Laravel API) ↔ AI Vector Engine (FastAPI + Qdrant).
* **Kết quả đạt được**: Thiết kế xong cấu trúc các bảng SQL và luồng dữ liệu của AI Agent.

### Tuần 4: Xây dựng cơ sở dữ liệu và triển khai API Backend
* **Nội dung công việc**:
  * Viết mã nguồn SQL khởi tạo các bảng cơ sở dữ liệu có ràng buộc khóa ngoại chặt chẽ.
  * Xây dựng Checkout API trên Laravel xử lý luồng đặt hàng transactional.
  * Lập trình xử lý logic trừ kho an toàn (Locking) khi xảy ra tranh chấp đơn hàng (Race Condition) trong các sự kiện Flash Sale.
* **Kết quả đạt được**: Deploy thử nghiệm cơ sở dữ liệu lên Docker PostgreSQL thành công, hoàn thành API Checkout cốt lõi.

### Tuần 5: Phát triển giao diện người dùng (Frontend) - Phần 1
* **Nội dung công việc**:
  * Khởi tạo dự án Next.js 16 App Router sử dụng ngôn ngữ TypeScript và CSS Tailwind v4.
  * Áp dụng nguyên lý Atomic Design để xây dựng các component nguyên tử (`Button`, `FormattedPrice`, `SkeletonLoader`) và các phân đoạn giao diện phức tạp (`Header`, `ProductCard`).
  * Tích hợp cơ chế i18n hỗ trợ song ngữ Việt - Anh thông qua React Context.
* **Kết quả đạt được**: Xây dựng xong giao diện trang chủ, trang danh mục sản phẩm tương thích responsive trên di động.

### Tuần 6: Phát triển giao diện người dùng (Frontend) - Phần 2 & Kết nối API
* **Nội dung công việc**:
  * Phát triển trang giỏ hàng và trang thanh toán tích hợp biểu mẫu thông tin giao nhận sử dụng thư viện `react-hook-form` kết hợp `zod` để validate dữ liệu đầu vào.
  * Xây dựng trang tra cứu trạng thái đơn hàng (`/track`) và lưu trữ thông tin lịch sử mua sắm cục bộ thông qua localStorage.
  * Kết nối giao diện Frontend Next.js với các Mock Service API để kiểm thử luồng nghiệp vụ mua hàng khép kín.
* **Kết quả đạt được**: Hoàn thiện luồng mua sắm client-side và trang tra cứu đơn hàng lưu vết thông minh.

### Tuần 7: Tích hợp AI Chatbot & Tìm kiếm ngữ nghĩa Semantic Search
* **Nội dung công việc**:
  * Phát triển dịch vụ AI RAG Search Engine bằng Python FastAPI kết nối Vector DB Qdrant.
  * Lập trình API nhúng (Embedding) sử dụng model OpenAI để chuyển đổi dữ liệu sản phẩm thành vector 1536 chiều và thực hiện truy vấn ngữ nghĩa gần đúng (Cosine Similarity).
  * Phát triển AI Chatbot Sidebar trên giao diện Next.js kết nối trực tiếp với API bán hàng thông minh.
* **Kết quả đạt được**: Tích hợp chatbot AI trả lời thông tin sản phẩm có ngữ cảnh chuẩn xác.

### Tuần 8: Kiểm thử toàn diện, sửa lỗi bảo mật và triển khai hệ thống
* **Nội dung công việc**:
  * Thực hiện audit bảo mật toàn diện: Loại bỏ mật khẩu cứng trong mã nguồn, sửa lỗi bypass đăng nhập trong `LoginGate.tsx`.
  * Sửa các lỗi biên dịch của TypeScript Compiler liên quan đến kiểu dữ liệu sản phẩm trong trang quản trị.
  * Tối ưu hóa SEO: Khai báo dynamic rendering cho các trang tĩnh, tạo tệp sitemap.xml và robots.txt tự động.
  * Deploy thành công phiên bản static export của ứng dụng lên Firebase Hosting.
* **Kết quả đạt được**: Ứng dụng chạy trực tuyến ổn định tại tên miền Firebase, hoàn thành báo cáo tốt nghiệp.
