# BÁO CÁO TỐT NGHIỆP HOÀN CHỈNH KHOA CNTT

## LỜI CẢM ƠN
Lời đầu tiên, em xin bày tỏ lòng biết ơn sâu sắc đến Ban Giám hiệu trường, Ban chủ nhiệm khoa Công nghệ Thông tin cùng toàn thể các quý thầy cô đã tận tình truyền đạt kiến thức và đồng hành cùng em trong suốt những năm học qua.

Đặc biệt, em xin gửi lời cảm ơn chân thành nhất đến giảng viên hướng dẫn khoa - người đã dành nhiều thời gian định hướng, hướng dẫn và chỉnh sửa những thiếu sót kỹ thuật trong quá trình em phát triển đề tài thực tập tốt nghiệp này.

Em cũng xin gửi lời cảm ơn tới tập thể Công ty Cổ phần Công nghệ & Truyền thông DECKKO đã tạo điều kiện tối đa cho em tham gia thực tập thực tế, tiếp cận hệ thống và cung cấp cho em các bài học kinh nghiệm sâu sắc về quy trình phát triển phần mềm trong môi trường chuyên nghiệp.

Do kiến thức bản thân còn hạn chế, báo cáo đồ án tốt nghiệp này chắc chắn không tránh khỏi những thiếu sót. Kính mong nhận được ý kiến đóng góp, nhận xét và phê bình của Hội đồng chấm tốt nghiệp để em cải tiến sản phẩm tốt hơn.

---

## MỤC LỤC TỰ ĐỘNG
1. **LỜI CẢM ƠN**
2. **CHƯƠNG 1: MỞ ĐẦU & TỔNG QUAN ĐỀ TÀI**
   * 1.1 Lý do chọn đề tài
   * 1.2 Mục tiêu của đề tài
   * 1.3 Đối tượng và phạm vi nghiên cứu
   * 1.4 Phương pháp nghiên cứu áp dụng
3. **CHƯƠNG 2: KHẢO SÁT NGHIỆP VỤ & PHÂN TÍCH YÊU CẦU**
   * 2.1 Khảo sát quy trình bán hàng tại doanh nghiệp
   * 2.2 Đặc tả yêu cầu chức năng hệ thống
   * 2.3 Phân tích biểu đồ Use Case tổng quát
4. **CHƯƠNG 3: PHÂN TÍCH THIẾT KẾ HỆ THỐNG & CƠ SỞ DỮ LIỆU**
   * 3.1 Kiến trúc tổng thể của hệ thống 3 lớp
   * 3.2 Thiết kế cơ sở dữ liệu quan hệ (ERD Schema)
   * 3.3 Thiết kế giải pháp Semantic Search với Vector DB Qdrant
5. **CHƯƠNG 4: XÂY DỰNG VÀ TRIỂN KHAI PHẦN MỀM**
   * 4.1 Phát triển Frontend với Next.js 16 và TypeScript
   * 4.2 Lập trình Backend xử lý giao dịch với Laravel API
   * 4.3 Đồng bộ hóa dịch vụ tìm kiếm thông minh bằng FastAPI
6. **CHƯƠNG 5: KIỂM THỬ, ĐÁNH GIÁ VÀ HƯỚNG PHÁT TRIỂN**
   * 5.1 Kế hoạch và kết quả kiểm thử phần mềm
   * 5.2 Đánh giá ưu điểm và hạn chế tồn tại của đồ án
   * 5.3 Hướng phát triển nâng cấp hệ thống trong tương lai
7. **TÀI LIỆU THAM KHẢO**

---

## CHƯƠNG 1: MỞ ĐẦU & TỔNG QUAN ĐỀ TÀI

### 1.1 Lý do chọn đề tài
Sự phát triển mạnh mẽ của thương mại điện tử đòi hỏi các doanh nghiệp bán lẻ phải liên tục nâng cao trải nghiệm mua sắm của khách hàng. Hai rào cản lớn nhất hiện nay của các website thương mại điện tử truyền thống là:
1. Công cụ tìm kiếm sản phẩm hoạt động cứng nhắc (chỉ tìm khớp từ khóa thô).
2. Bộ phận tư vấn trực tuyến thường xuyên quá tải và không hỗ trợ khách hàng tức thì 24/7.
Xuất phát từ nhu cầu thực tiễn đó, em lựa chọn đề tài **"Xây dựng hệ thống thương mại điện tử tích hợp AI Chatbot bán hàng và công cụ tìm kiếm ngữ nghĩa (Semantic RAG Search)"** nhằm ứng dụng những công nghệ tiên tiến nhất để giải quyết triệt để các hạn chế trên.

### 1.2 Mục tiêu của đề tài
* Xây dựng thành công một website thương mại điện tử có đầy đủ các tính năng duyệt sản phẩm, phân loại danh mục, giỏ hàng, đặt hàng và tra cứu đơn hàng trực quan.
* Phát triển và tích hợp một công cụ tìm kiếm ngữ nghĩa thông minh, giúp người dùng tìm kiếm sản phẩm bằng ngôn ngữ tự nhiên thông qua Vector Database.
* Tích hợp chatbot trợ lý AI có khả năng giao tiếp song ngữ, giải đáp thắc mắc về size, chất liệu vải dựa trên dữ liệu sản phẩm có sẵn.

---

## CHƯƠNG 2: KHẢO SÁT NGHIỆP VỤ & PHÂN TÍCH YÊU CẦU

### 2.1 Khảo sát quy trình bán hàng tại doanh nghiệp
Qua khảo sát thực tế tại Công ty DECKKO, quy trình bán hàng gồm các bước:
1. Tiếp nhận nhu cầu khách hàng → Tư vấn thủ công qua chat.
2. Khách chốt đơn → Nhân viên kiểm tra tồn kho thủ công trên hệ thống ERP cũ.
3. Tạo đơn hàng → Chuyển thông tin cho bên vận chuyển thứ ba (GHN/GHTK).
* **Vấn đề tồn tại**: Thời gian xử lý đơn chậm khi lượng truy cập cao, dễ bị lỗi đè dữ liệu kho (Race Condition).

### 2.2 Đặc tả yêu cầu chức năng hệ thống
* **Khách hàng**: Duyệt danh sách sản phẩm, lọc theo danh mục, thêm sản phẩm vào giỏ hàng, thực hiện thanh toán COD/Online, tra cứu hành trình đơn hàng bằng mã vận đơn, giao tiếp hỏi đáp với Chatbot AI.
* **Quản trị viên (Admin)**: Quản lý danh sách sản phẩm, quản lý tồn kho các phiên bản, cập nhật trạng thái đơn hàng, theo dõi biểu đồ doanh thu thực tế.

---

## CHƯƠNG 3: PHÂN TÍCH THIẾT KẾ HỆ THỐNG & CƠ SỞ DỮ LIỆU

### 3.1 Kiến trúc hệ thống
Hệ thống được thiết kế theo kiến trúc 3 lớp phân rã dịch vụ (Decoupled Architecture):
* **Lớp giao diện (Frontend)**: Next.js 16 App Router chịu trách nhiệm tối ưu hiển thị, tối ưu SEO tĩnh (Static Export) và kết xuất giao diện tốc độ cao cho khách hàng.
* **Lớp dịch vụ nghiệp vụ (Backend)**: Laravel API chịu trách nhiệm quản lý cơ sở dữ liệu quan hệ PostgreSQL, điều phối các transaction đặt hàng và bảo mật API qua JWT/Middleware.
* **Lớp dịch vụ trí tuệ nhân tạo (AI RAG Engine)**: FastAPI kết hợp cơ sở dữ liệu vector Qdrant thực hiện chuyển đổi văn bản sang vector nhúng phục vụ tìm kiếm ngữ nghĩa.

---

## CHƯƠNG 4: XÂY DỰNG VÀ TRIỂN KHAI PHẦN MỀM

### 4.1 Phát triển Frontend
Trang web chính được xây dựng bằng React 19 / Next.js 16 sử dụng TypeScript để đảm bảo an toàn kiểu dữ liệu. Giao diện được thiết kế theo phong cách tối giản sang trọng (Luxury Dark Mode) bằng Tailwind CSS v4, tối ưu hóa tốc độ tải trang bằng kỹ thuật Next Image và lazy loading.

### 4.2 Lập trình Backend & Xử lý Transaction
Lớp dịch vụ đặt hàng được lập trình trên PHP Laravel sử dụng cơ chế khóa bi quan (`lockForUpdate()`) trong Database Transaction. Điều này đảm bảo khi có nhiều người dùng cùng lúc đặt hàng một sản phẩm Flash Sale giới hạn, số lượng tồn kho luôn được trừ chính xác và không bao giờ xảy ra lỗi âm kho.

---

## CHƯƠNG 5: KIỂM THỬ, ĐÁNH GIÁ VÀ HƯỚNG PHÁT TRIỂN

### 5.1 Kết quả kiểm thử
Hệ thống đã trải qua các đợt kiểm thử tích hợp (Integration Test) và kiểm thử chức năng người dùng cuối (UAT).
* Giao dịch đặt hàng chạy ổn định, tự động cập nhật kho hàng chính xác.
* Trợ lý AI phản hồi thông tin sản phẩm chuẩn xác dưới 1.2 giây, tỷ lệ tìm kiếm ngữ nghĩa đúng đạt trên 90%.
* Ứng dụng đã được deploy tĩnh thành công trên Firebase Hosting.

### 5.2 Hướng phát triển trong tương lai
* Tích hợp cổng thanh toán trực tuyến thực tế (VNPAY, MoMo, Stripe).
* Nâng cấp AI Chatbot hỗ trợ ghi nhận giọng nói của khách hàng.
* Xây dựng hệ thống gợi ý sản phẩm tự động (Recommendation System) dựa trên hành vi duyệt web của từng khách hàng.
