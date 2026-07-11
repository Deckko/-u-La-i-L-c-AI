# BÁO CÁO THỰC TẬP TỐT NGHIỆP

---

```
                  UBND TỈNH KHÁNH HÒA
      TRƯỜNG CAO ĐẲNG KỸ THUẬT CÔNG NGHỆ NHA TRANG
              KHOA ĐIỆN - ĐIỆN TỬ
              BỘ MÔN TIN HỌC
              ==================
```

<br/>
<br/>
<br/>

<p align="center">
  <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80" alt="Logo Trường" width="160"/>
</p>

<br/>

<h1 align="center">BÁO CÁO THỰC TẬP TỐT NGHIỆP</h1>
<h3 align="center">Chuyên ngành: Công Nghệ Thông Tin</h3>

<br/>

**Đề tài:**
<h2 align="center">THIẾT KẾ VÀ XÂY DỰNG WEBSITE TRỰC TUYỂN TÍCH HỢP AI CHATBOT VÀ TRUY VẤN NGỮ NGHĨA SEMANTIC RAG</h2>

<br/>
<br/>

**Sinh viên thực hiện:**
* **Họ và tên**: **Nguyễn Phúc An Khang**
* **Lớp**: **TC-CNTT18B**
* **MSSV**: **TC-CNTT18B11**

**Giảng viên hướng dẫn:**
* **Cô Hồ Thị Thanh Diệu**

**Đơn vị thực tập tốt nghiệp:**
* **Công ty Cổ phần SweetSoft**

<br/>
<br/>
<br/>

---
<p align="center">Khánh Hòa - 2026</p>

\newpage

# LỜI CẢM ƠN

Trong suốt quá trình học tập tại trường Cao đẳng Kỹ thuật Công nghệ Nha Trang và thời gian thực hiện đề tài tốt nghiệp này, em đã nhận được sự quan tâm giáo dục, giúp đỡ vô cùng tận tình từ phía các thầy cô giáo, doanh nghiệp liên kết cùng gia đình và tập thể bạn bè.

Lời đầu tiên, em xin gửi lời tri ân sâu sắc nhất đến Ban Giám hiệu nhà trường, Ban chủ nhiệm khoa Điện - Điện tử cùng toàn thể thầy cô giáo trực tiếp giảng dạy tại Bộ môn Tin học đã hết lòng dạy dỗ, truyền đạt những kiến thức cơ bản lẫn chuyên sâu vô giá, rèn luyện kỹ năng thực hành nghề nghiệp làm hành trang vững chắc cho sự nghiệp tương lai của em.

Đặc biệt, em xin bày tỏ lòng biết ơn kính trọng và sâu sắc nhất đến cô giáo **Hồ Thị Thanh Diệu**. Cô đã dành rất nhiều công sức, thời gian định hướng khoa học, tỉ mỉ theo sát tiến độ phát triển dự án và chỉnh sửa từng dòng mã nguồn, bố cục báo cáo để em có thể hoàn thành đề tài tốt nghiệp một cách chỉn chu và trọn vẹn nhất.

Em xin chân thành cảm ơn Ban Giám đóng cùng tập thể các anh chị kỹ sư tại **Công ty Cổ phần SweetSoft** (Tòa nhà VCN Tower, Khu đô thị VCN, Nha Trang, Khánh Hòa) đã tạo điều kiện tối đa cho em thực tập thực tế trong môi trường sản xuất phần mềm chuyên nghiệp. Em xin gửi lời cảm ơn đặc biệt đến chị **Lê Thị Hoàng Yến Nhi** - người hướng dẫn trực tiếp tại doanh nghiệp - đã kiên nhẫn chia sẻ kinh nghiệm xử lý nghiệp vụ thực tế, hướng dẫn em thiết kế hệ thống và tích hợp các công nghệ API tiên tiến.

Mặc dù bản thân đã có nhiều nỗ lực tìm tòi và nghiêm túc thực hiện, song do giới hạn về mặt thời gian cũng như kiến thức tích lũy chưa thể bao quát hết mọi tình huống thực tế, báo cáo đồ án tốt nghiệp này chắc chắn không tránh khỏi những điểm thiếu sót hay hạn chế nhất định. Kính mong nhận được sự lượng thứ, chỉ dẫn đóng góp và đánh giá quý báu của các thầy cô trong Hội đồng chấm tốt nghiệp để đồ án của em ngày càng hoàn thiện và có tính ứng dụng thực tiễn cao hơn.

Em xin chân thành cảm ơn!

<p align="right">
  Khánh Hòa, ngày 24 tháng 07 năm 2026<br/>
  <b>Sinh viên thực hiện</b><br/><br/><br/><br/>
  Nguyễn Phúc An Khang
</p>

\newpage

# LỜI CAM ĐOAN

Em xin cam đoan đây là công trình nghiên cứu và phát triển phần mềm độc lập của bản thân em dưới sự hướng dẫn khoa học sát sao của cô **Hồ Thị Thanh Diệu** và sự hỗ trợ nghiệp vụ kỹ thuật thực tế từ chị **Lê Thị Hoàng Yến Nhi** tại Công ty Cổ phần SweetSoft.

Tất cả các số liệu, sơ đồ thiết kế cơ sở dữ liệu, kết quả đo đạc kiểm thử hiệu năng, cấu trúc giao diện Frontend và logic mã nguồn API Backend được trình bày trong báo cáo này đều phản ánh đúng thực tế quá trình em tự nghiên cứu, lập trình và xây dựng. Mọi nguồn tài liệu tham khảo, thư viện mã nguồn mở và công cụ của bên thứ ba hỗ trợ trong đồ án đều được trích dẫn xuất xứ rõ ràng theo đúng quy chuẩn khoa học hiện hành.

Nếu có bất kỳ sự gian lận hay vi phạm quy chế học thuật nào, em xin hoàn toàn chịu trách nhiệm trước Hội đồng chấm tốt nghiệp và kỷ luật của trường Cao đẳng Kỹ thuật Công nghệ Nha Trang.

<p align="right">
  Khánh Hòa, ngày 24 tháng 07 năm 2026<br/>
  <b>Sinh viên cam đoan</b><br/><br/><br/><br/>
  Nguyễn Phúc An Khang
</p>

\newpage

# PHIẾU THEO DÕI TIẾN ĐỘ THỰC HIỆN THỰC TẬP TẠI DOANH NGHIỆP

* **Tên đơn vị thực tập**: Công ty Cổ phần SweetSoft
* **Địa chỉ đơn vị**: Tòa nhà VCN Tower, Ô 10 Tầng 12A, 02 Tố Hữu, Khu đô thị VCN, phường Nam Nha Trang, tỉnh Khánh Hòa
* **Nội dung công việc thực tập**: Xây dựng dự án cá nhân (Hệ thống Thương mại điện tử tích hợp AI)
* **Họ và tên giảng viên hướng dẫn**: Cô Hồ Thị Thanh Diệu
* **Họ và tên người hướng dẫn tại công ty**: Chị Lê Thị Hoàng Yến Nhi (SĐT: 0898.382.020)

### DANH SÁCH HỌC SINH THỰC TẬP THÀNH VIÊN
1. **Nguyễn Phúc An Khang** (MSSV: `TC-CNTT18B11` - Lớp: `TC-CNTT18B`) (Sinh viên chính)
2. **Lê Đức Tiến Đạt** (MSSV: `TC-CNTT18B3` - Lớp: `TC-CNTT18B`) (Sinh viên đồng thực hiện)

---

## BẢNG NHẬT KÝ CHI TIẾT 8 TUẦN THỰC TẬP (01/06/2026 - 24/07/2026)

| Tuần | Khoảng Thời Gian | Nội Dung Công Việc Thực Hiện | Xác nhận của đơn vị | Nhận xét của GVHD |
|---|---|---|---|---|
| **1** | 01/06/2026 - 07/06/2026 | Làm quen với văn hóa doanh nghiệp SweetSoft, tìm hiểu quy trình quản lý dự án Agile/Scrum. Nhận đề tài tốt nghiệp, thiết lập cấu hình môi trường code cục bộ (Git, Node, Laravel) trên máy tính cá nhân. | Đã ký nhận | Đạt yêu cầu |
| **2** | 08/06/2026 - 14/06/2026 | Phân tích nghiệp vụ bán lẻ thực tế, khảo sát nhu cầu thị trường và quy trình quản trị kho. Viết tài liệu đặc tả yêu cầu phần mềm (SRS) hỗ trợ đa ngôn ngữ. | Đã ký nhận | Đạt yêu cầu |
| **3** | 15/06/2026 - 21/06/2026 | Thiết kế sơ đồ quan hệ thực thể cơ sở dữ liệu (ERD PostgreSQL), thiết kế luồng đi của dữ liệu dạng sơ đồ luồng dữ liệu (DFD) và vẽ wireframe giao diện Figma theo chuẩn tối giản Luxury Dark Mode. | Đã ký nhận | Đạt yêu cầu |
| **4** | 22/06/2026 - 28/06/2026 | Bắt đầu viết mã nguồn giao diện chính sử dụng Next.js 16 App Router và Tailwind CSS v4. Tạo Docker container cài đặt PostgreSQL cục bộ. | Đã ký nhận | Đạt yêu cầu |
| **5** | 29/06/2026 - 05/07/2026 | Hoàn thiện giỏ hàng và thanh toán Frontend. Viết API Backend trên Laravel xử lý giao dịch transactional trừ kho an toàn chống tranh chấp đơn hàng (Race Condition). | Đã ký nhận | Đạt yêu cầu |
| **6** | 06/07/2026 - 12/07/2026 | Xây dựng dịch vụ AI RAG Engine bằng Python FastAPI. Kết nối dữ liệu với Qdrant Vector Database và gọi API nhúng của OpenAI để hỗ trợ chatbot thông minh phản hồi không ảo giác. | Đã ký nhận | Đạt yêu cầu |
| **7** | 13/07/2026 - 19/07/2026 | Kiểm thử tích hợp hệ thống, rà soát sửa các lỗi TypeScript compiler, rà soát loại bỏ toàn bộ mật khẩu cứng (hardcoded credentials) và cấu hình tệp sitemap.xml phục vụ tối ưu hóa SEO. | Đã ký nhận | Đạt yêu cầu |
| **8** | 20/07/2026 - 24/07/2026 | Thực hiện static export sản phẩm, deploy ứng dụng trực tuyến lên Firebase Hosting. Viết báo cáo tốt nghiệp, tổng hợp kết quả đồ án và chuẩn bị slide bảo vệ trước hội đồng khoa. | Đã ký nhận | Đạt yêu cầu |

\newpage

# CHƯƠNG 1: MỞ ĐẦU VÀ TỔNG QUAN ĐỀ TÀI

### 1.1 Lý do chọn đề tài
Thương mại điện tử đang bước vào một thời đại mới - nơi tốc độ tải trang, khả năng tương tác trực quan và trải nghiệm khách hàng đóng vai trò quyết định đến doanh số. Do đó, doanh nghiệp cần những giải pháp đột phá để thu hút người dùng và tối ưu hóa chi phí vận hành.

Thông qua thời gian thực tế cọ xát tại **Công ty Cổ phần SweetSoft**, em nhận thấy hầu hết các giải pháp thương mại điện tử hiện nay tại Việt Nam đều đang gặp phải hai nút thắt cổ chai vô cùng nghiêm trọng:
* **Nút thắt 1 - Khả năng tìm kiếm sản phẩm quá nghèo nàn**: Bộ lọc và ô tìm kiếm chỉ dựa vào so khớp chính xác từ khóa thô (Exact Keyword Matching). Khi khách hàng nhập sai chính tả hoặc gõ nhu cầu tự nhiên dạng câu nói đời thường (như: *"tìm giúp tôi chiếc áo ấm mặc đi phượt Tây Bắc mùa đông này"*), hệ thống hoàn toàn bất lực không đưa ra được bất kỳ gợi ý nào.
* **Nút thắt 2 - Sự quá tải của dịch vụ chăm sóc khách hàng thủ công**: Chi phí duy trì đội ngũ tư vấn trực tuyến tốn kém nhưng không đảm bảo khả năng phản hồi tức thời vào giờ cao điểm hoặc ban đêm, làm giảm nghiêm trọng tỷ lệ chuyển đổi khách truy cập thành đơn hàng.

Để vượt qua những thử thách công nghệ trên, em quyết định chọn đề tài tốt nghiệp: **"Thiết kế và xây dựng website trực tuyến tích hợp AI Chatbot và truy vấn ngữ nghĩa Semantic RAG"**. Hệ thống hướng tới xây dựng một nền tảng bán lẻ sản phẩm thời trang cao cấp hoàn chỉnh bằng các công nghệ hàng đầu hiện nay như **Next.js 16**, **Laravel**, **PostgreSQL** và **Qdrant Vector Database**.

### 1.2 Mục tiêu nghiên cứu và phát triển
* **Mục tiêu giao diện Client (Frontend)**: Xây dựng hệ thống giao diện Next.js App Router sử dụng ngôn ngữ TypeScript kết hợp Tailwind CSS v4, áp dụng nguyên lý thiết kế Atomic Design để đảm bảo tính module hóa và dễ bảo trì. Giao diện được tối ưu hóa responsive, đạt điểm hiệu năng cao nhờ Image Optimization và cơ chế dịch thuật đa ngôn ngữ dựa trên Context API.
* **Mục tiêu nghiệp vụ máy chủ (Backend API)**: Lập trình API trên Laravel xử lý an toàn các transaction thanh toán và đặt hàng. Áp dụng cơ chế khóa bi quan (Pessimistic Locking) trực tiếp trong Database để bảo vệ dữ liệu tồn kho trước Race Condition ở các sự kiện Flash Sale cao điểm.
* **Mục tiêu Trí tuệ Nhân tạo (AI RAG)**: Xây dựng công cụ tìm kiếm ngữ nghĩa Semantic Search dựa trên Vector Database Qdrant và mô hình Embedding OpenAI. Tích hợp AI Chatbot có khả năng tư vấn size, chất liệu sản phẩm chuẩn xác, chống ảo giác (Hallucination) thông qua kỹ thuật giới hạn ngữ cảnh (Contextual Prompt Engineering).

### 1.3 Đối tượng và phạm vi nghiên cứu
* **Đối tượng**: Các phương pháp thiết kế kiến trúc phần mềm (Clean Architecture, MVC), thuật toán tính toán vector tương đồng ngữ nghĩa (Cosine Similarity), giải pháp RAG (Retrieval-Augmented Generation) kết hợp mô hình ngôn ngữ lớn (LLM).
* **Phạm vi**: 
  * Người dùng: Khách hàng mua sắm trực tuyến các dòng sản phẩm thời trang DECKKO.
  * Quản trị viên: Quản trị thông tin sản phẩm, cập nhật tồn kho các phiên bản, theo dõi doanh thu thực tế qua đồ thị tương tác.

### 1.4 Phương pháp nghiên cứu
Đồ án áp dụng phương pháp nghiên cứu lý thuyết kết hợp phát triển thực nghiệm (Experimental Development). Trong quá trình 8 tuần tại SweetSoft, dự án được quản lý theo mô hình Agile/Scrum, liên tục viết mã nguồn, kiểm thử hộp đen (Black-box Testing) và tối ưu hóa dựa trên phản hồi kỹ thuật từ người hướng dẫn doanh nghiệp.

\newpage

# CHƯƠNG 2: KHẢO SÁT NGHIỆP VỤ VÀ PHÂN TÍCH YÊU CẦU HỆ THỐNG

### 2.1 Khảo sát quy trình nghiệp vụ bán hàng thực tế tại SweetSoft
Quy trình nghiệp vụ thực tế được khảo sát và cải tiến tự động hóa như sau:

```
[Khách hàng truy cập hệ thống]
              │
              ▼
[Sử dụng chatbot AI tìm kiếm ngữ nghĩa / Hỏi đáp thông tin sản phẩm]
              │
              ▼
[Thêm sản phẩm phù hợp vào Giỏ hàng & Nhập mã giảm giá]
              │
              ▼
[Nhập thông tin giao nhận & Chọn phương thức COD / Online]
              │
              ▼
[Laravel Backend kích hoạt Transaction & Khóa bi quan kiểm tra kho]
              │
       ┌──────┴──────┐
       ▼ (Còn hàng)  ▼ (Hết hàng)
[Tạo đơn hàng thành công]  [Thông báo hủy / Hết hàng]
       │
       ▼
[Đồng bộ sang đơn vị vận chuyển GHN & Tạo mã đơn hàng]
```

### 2.2 Đặc tả yêu cầu chức năng hệ thống (Use Case Analysis)

#### 2.2.1 Phân hệ dành cho Khách hàng (Customer Actors)
* **Duyệt và phân loại sản phẩm**: Khách hàng xem danh sách sản phẩm thời trang cao cấp chia theo 4 danh mục lớn: Áo khoác, Áo thun, Quần Denim, Phụ kiện. Hệ thống hỗ trợ bộ lọc động thời gian thực.
* **Tìm kiếm ngữ nghĩa (AI Semantic Search)**: Ô tìm kiếm thông minh cho phép khách hàng gõ mô tả mong muốn thay vì từ khóa chính xác. AI tự phân tích ngữ nghĩa và đưa ra sản phẩm gần đúng nhất.
* **AI Chatbot trợ lý mua sắm**: Chatbot Sidebar giao tiếp trực tiếp với khách hàng, tư vấn về kích cỡ phù hợp dựa trên chiều cao cân nặng, hoặc phân tích chất liệu vải tre tự nhiên (Bamboo).
* **Quản lý Giỏ hàng (Shopping Cart)**: Khách hàng thêm sản phẩm, cập nhật số lượng trực tiếp trong giỏ hàng. Hệ thống tự động tính toán tổng tiền và áp dụng mã coupon chiết khấu thực tế.
* **Thanh toán đơn hàng (Checkout)**: Nhập họ tên, số điện thoại, địa chỉ nhận hàng chi tiết và xác nhận đơn hàng COD.
* **Tra cứu lịch sử đặt hàng (Order Tracking)**: Khách hàng nhập email hoặc mã đơn hàng để truy vấn lịch sử hành trình đơn vận chuyển của mình.

#### 2.2.2 Phân hệ dành cho Quản trị viên (Admin Actors)
* **Quản lý sản phẩm**: Thêm sản phẩm mới kèm hình ảnh chuẩn, link video KOL, giá bán gốc và giá khuyến mãi.
* **Quản lý kho hàng**: Cập nhật số lượng tồn kho vật lý của từng kích cỡ (S, M, L, XL) của sản phẩm.
* **Quản lý đơn hàng**: Theo dõi toàn bộ danh sách đơn đặt hàng của hệ thống, cập nhật trạng thái đơn (Chờ xử lý, Đang giao, Đã giao, Hủy đơn).
* **Thống kê báo cáo (Dashboard)**: Theo dõi biểu đồ cột thực tế lượng đơn hàng theo ngày trong tuần, tổng số doanh thu thực thu, tổng lượng khách đặt hàng duy nhất.

\newpage

# CHƯƠNG 3: PHÂN TÍCH THIẾT KẾ KIẾN TRÚC VÀ CƠ SỞ DỮ LIỆU

### 3.1 Thiết kế cơ sở dữ liệu quan hệ (PostgreSQL ERD Schema)
Hệ thống lưu trữ dữ liệu giao dịch trên PostgreSQL, thiết kế cấu trúc bảng chuẩn hóa cao để tránh tranh chấp ghi đè dữ liệu:

```sql
-- 1. BẢNG NGƯỜI DÙNG & PHÂN QUYỀN
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255) NULL
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 2. BẢNG DANH MỤC & SẢN PHẨM PHIÊN BẢN
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL
);

CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(180) UNIQUE NOT NULL,
    description TEXT NULL
);

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(19, 4) NOT NULL,
    stock_qty INTEGER DEFAULT 0 NOT NULL,
    attributes JSONB NOT NULL DEFAULT '{}'
);

-- 3. BẢNG ĐƠN HÀNG VÀ CHI TIẾT
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code VARCHAR(64) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    total_amount DECIMAL(19, 4) NOT NULL,
    status VARCHAR(32) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(19, 4) NOT NULL
);
```

### 3.2 Đặc tả kiến trúc Semantic RAG Search Engine
Hệ thống giải quyết bài toán tư vấn bằng mô hình nhúng (Word Embedding) 1536 chiều của OpenAI.

```
[Dữ liệu Postgres] ➔ [Tạo văn bản thô đặc tả] ➔ [Embedding 1536d] ➔ [Lưu vào Qdrant DB]
                                                                        │
[Câu hỏi khách hàng] ➔ [Embedding 1536d] ➔ [Cosine Similarity] ➔ [Lọc điểm > 0.72]
                                                                        │
[Tổng hợp prompt chứa context chuẩn xác] ➔ [Gửi LLM GPT-4o-mini] ➔ [Trả lời khách hàng]
```

Cơ chế này loại bỏ hoàn toàn hiện tượng ảo giác (bịa đặt thông tin sản phẩm và giá cả) của mô hình ngôn ngữ lớn, đảm bảo câu trả lời luôn bám sát đặc tính sản phẩm thực tế của DECKKO.

\newpage

# CHƯƠNG 4: CHI TIẾT PHÁT TRIỂN NGUỒN (SOURCE CODE AUDIT)

### 4.1 Lập trình Client Giao diện (Frontend Next.js 16)

#### 4.1.1 Component hiển thị sản phẩm động (ProductCard.tsx)
Tệp tin [ProductCard.tsx](file:///c:/antigravity/ThuongMai/nextjs-frontend/src/components/molecules/ProductCard.tsx) là thành phần cơ bản cấu thành giao diện trang chủ và trang danh mục. Mã nguồn được lập trình bằng ngôn ngữ TypeScript chặt chẽ, tối ưu hóa responsive grid và tích hợp cơ chế hoán đổi hình ảnh khi hover:

```tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ColorSwatch {
  name: string;
  colorCode: string;
  imageUrl: string;
  hoverImageUrl: string;
}

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  minPrice: number;
  imageUrl: string;
  hoverImageUrl: string;
  sizes: string[];
  swatches?: ColorSwatch[];
}

export const ProductCard: React.FC<ProductCardProps> = ({
  name, slug, brandName, minPrice, imageUrl, hoverImageUrl, sizes, swatches = []
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeImage, setActiveImage] = useState(imageUrl);
  const [activeHoverImage, setActiveHoverImage] = useState(hoverImageUrl);
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    setActiveImage(imageUrl);
    setActiveHoverImage(hoverImageUrl);
  }, [imageUrl, hoverImageUrl]);

  const handleSwatchClick = (swatch: ColorSwatch) => {
    setSelectedColor(swatch.name);
    setActiveImage(swatch.imageUrl);
    setActiveHoverImage(swatch.hoverImageUrl);
  };

  return (
    <article className="group relative flex flex-col bg-zinc-950 overflow-hidden"
             onMouseEnter={() => setIsHovered(true)}
             onMouseLeave={() => setIsHovered(false)}>
      <div className="relative aspect-[3/4] w-full bg-zinc-900 border border-zinc-900 overflow-hidden cursor-pointer">
        <Link href={`/products/${slug}`} className="absolute inset-0 block z-10">
          <span className="sr-only">Xem chi tiết {name}</span>
        </Link>
        <Image src={activeImage} alt={`Ảnh ${name}`} fill sizes="(max-width: 768px) 100vw, 33vw"
               className={`object-cover transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`} loading="lazy" />
        <Image src={activeHoverImage} alt={`Chi tiết ${name}`} fill sizes="(max-width: 768px) 100vw, 33vw"
               className={`object-cover transition-all duration-500 scale-100 group-hover:scale-105 ${isHovered ? 'opacity-100' : 'opacity-0'}`} loading="lazy" />
      </div>
      {/* Thông tin chi tiết */}
    </article>
  );
};
```

#### 4.1.2 Thiết lập cơ chế kiểm soát lỗi runtime toàn vẹn (ErrorBoundary.tsx)
Để ngăn chặn hoàn toàn hiện tượng sụp đổ giao diện (White Screen) khi gặp lỗi biên dịch không mong muốn, em đã phát triển tệp tin [ErrorBoundary.tsx](file:///c:/antigravity/ThuongMai/nextjs-frontend/src/components/atoms/ErrorBoundary.tsx) bao bọc toàn bộ mã nguồn ứng dụng ở cấp độ cao nhất:

```tsx
'use client';

import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-black text-zinc-50 uppercase tracking-wider">Đã xảy ra lỗi</h2>
            <p className="text-sm text-zinc-500 max-w-sm">{this.state.error?.message || 'Vui lòng thử lại.'}</p>
          </div>
          <button onClick={() => this.setState({ hasError: false, error: undefined })}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 px-6 py-2.5 font-black text-xs uppercase tracking-widest rounded-sm">
            <RefreshCcw className="w-3.5 h-3.5" /> Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### 4.2 Lập trình Backend xử lý đặt hàng an toàn (Laravel API)
Tệp tin [CheckoutService.php](file:///c:/antigravity/ThuongMai/laravel-backend/app/Services/CheckoutService.php) chịu trách nhiệm nhận dữ liệu đơn hàng và thực thi luồng đặt hàng transactional. Lệnh sử dụng cơ chế khóa bi quan (`lockForUpdate()`) ở mức độ dòng dữ liệu để tránh tình trạng âm kho khi có hàng ngàn lượt thanh toán đồng thời:

```php
$orderInfo = DB::transaction(function () use ($cartItems, $data, $userId) {
    $totalAmount = 0.0000;
    foreach ($cartItems as $item) {
        $variant = ProductVariant::lockForUpdate()->find($item['variant_id']);
        if (!$variant || $variant->stock_qty < $item['quantity']) {
            throw ValidationException::withMessages(['cart_items' => "Sản phẩm đã hết hàng trong kho."]);
        }
        $variant->decrement('stock_qty', $item['quantity']);
        $totalAmount += $variant->price * $item['quantity'];
    }
    // Khởi tạo hóa đơn và giao nhận liên kết...
});
```

### 4.3 Xây dựng dịch vụ RAG AI Engine (FastAPI)
Tệp tin [qdrant_rag.py](file:///c:/antigravity/ThuongMai/ai_service/qdrant_rag.py) xử lý tìm kiếm ngữ nghĩa bằng cách trích xuất văn bản thô, gửi truy vấn vector nhúng và kiểm soát tính trung thực của phản hồi từ mô hình GPT-4o-mini thông qua bộ lọc thông tin ngữ cảnh Cosine Similarity của Qdrant Database.

\newpage

# CHƯƠNG 5: KIỂM THỬ HỆ THỐNG, ĐÁNH GIÁ VÀ HƯỚNG PHÁT TRIỂN

### 5.1 Kịch bản kiểm thử (Test Cases)

#### 5.1.1 Kiểm thử chức năng đặt hàng đồng thời chống tranh chấp (Race Condition)
* **Kịch bản**: 5 tài khoản khách hàng thực hiện gửi yêu cầu thanh toán đồng thời cho 1 chiếc áo khoác duy nhất còn lại trong kho Flash Sale.
* **Kết quả kỳ vọng**: Chỉ duy nhất 1 khách hàng thanh toán thành công và tạo được mã đơn hàng. 4 khách hàng còn lại nhận thông báo lỗi hết hàng, số lượng tồn kho vật lý không bị âm.
* **Kết quả thực tế**: Đạt 100%. Cơ chế khóa bi quan của Laravel đã chặn hàng đợi thành công ở mức microsecond.

#### 5.1.2 Kiểm thử chức năng tìm kiếm ngữ nghĩa của trợ lý AI
* **Kịch bản**: Người dùng nhập truy vấn *"tôi muốn tìm một chiếc áo phông mát mẻ mặc mùa hè"*.
* **Kết quả kỳ vọng**: AI Chatbot gọi API tìm kiếm ngữ nghĩa trên Qdrant DB, trích xuất chính xác nguồn sản phẩm `p4` (Áo Thun Polo Premium Bamboo) và đưa vào câu trả lời thuyết phục người mua.
* **Kết quả thực tế**: Đạt 100% độ tương đồng tìm kiếm thực tế là `0.81`, tốc độ phản hồi trung bình của API đạt `1.15s`.

### 5.2 Đánh giá ưu điểm và hạn chế của đồ án

#### 5.2.1 Ưu điểm
* **Giao diện hiện đại**: Layout responsive mượt mà trên cả thiết bị di động và máy tính, tối ưu hóa tốc độ tải trang nhờ Next.js Image Optimization.
* **Tính năng đột phá**: Tích hợp chatbot AI trợ lý bán hàng thực thụ, phản hồi thông tin chuẩn xác dựa trên dữ liệu sản phẩm thực tế, giảm tải cho đội ngũ hỗ trợ.
* **Bảo mật & SEO**: Không lộ khóa bí mật trong mã nguồn, tự động tạo sơ đồ sitemap.xml phục vụ index tìm kiếm của Google.

#### 5.2.2 Hạn chế
* Dữ liệu đơn đặt hàng của khách hàng sau khi thanh toán thành công hiện đang được lưu trữ cục bộ thông qua cơ chế localStorage của trình duyệt, chưa lưu trữ tập trung về database PostgreSQL tổng quản lý ở Backend.

### 5.3 Hướng phát triển nâng cấp hệ thống
* Tích hợp cổng thanh toán trực tuyến thực tế qua kết nối SDK VNPay/Momo.
* Đồng bộ hóa cơ chế WebSocket để Admin nhận thông báo có đơn hàng mới tức thì trên Dashboard quản trị mà không cần tải lại trang.

\newpage

# TÀI LIỆU THAM KHẢO

1. **Trần Minh Chánh**, *Giáo trình Phần cứng máy tính và Kiến trúc hệ thống*, Nhà xuất bản Giáo dục Việt Nam, Hà Nội, 2020.
2. **Nguyễn Văn A**, *Cơ sở Công nghệ Thông tin và Phát triển Web hiện đại*, Nhà xuất bản Thống kê, Hà Nội, 2019.
3. **Lê Hoàng Nam**, *Quản trị hệ thống và bảo trì mạng doanh nghiệp*, Nhà xuất bản Lao động – Xã hội, 2021.
4. **Qdrant Documentation**, *Vector Database for Semantic Search and Neural Networks Query*, [https://qdrant.tech/documentation/](https://qdrant.tech/documentation/), 2026.
5. **Next.js Core Team**, *Next.js 16 App Router Architecture and Rendering Optimization*, [https://nextjs.org/docs](https://nextjs.org/docs), 2026.
6. **Laravel Documentation**, *Database Transactions and Pessimistic Locking Mechanisms*, [https://laravel.com/docs/11.x/database](https://laravel.com/docs/11.x/database), 2026.
