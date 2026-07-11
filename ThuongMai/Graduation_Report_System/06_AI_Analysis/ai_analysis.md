# BÁO CÁO PHÂN TÍCH THUẬT TOÁN AI SEMANTIC SEARCH & RAG

## 1. GIỚI THIỆU VỀ SEMANTIC SEARCH & RAG
Phương pháp tìm kiếm từ khóa truyền thống (Keyword Search) dựa trên sự trùng khớp chính xác ký tự. Phương pháp này thất bại khi khách hàng sử dụng các từ đồng nghĩa hoặc mô tả nhu cầu dưới dạng câu nói tự nhiên.

Hệ thống DECKKO áp dụng kỹ thuật **RAG (Retrieval-Augmented Generation)** kết hợp với **Semantic Search** (Tìm kiếm ngữ nghĩa) để giải quyết triệt để vấn đề này.

```
+------------------+     Embedding     +-----------------------+
|  User Query      | --------------> |  OpenAI text-3-small  |
+------------------+                 +-----------------------+
                                                 | (Vector 1536d)
                                                 v
+------------------+   Top 5 Matches   +-----------------------+
| Prompt + Context | <-------------- |  Qdrant Search        |
+------------------+ (Score > 0.72)   +-----------------------+
        |
        v
+-----------------------+              +-----------------------+
|  GPT-4o-mini API      | ------------> |  Response to User     |
+-----------------------+              +-----------------------+
```

---

## 2. QUY TRÌNH THỰC THI (ALGORITHM STEP-BY-STEP)

### Bước 1: Số hóa kho tri thức sản phẩm (Vectorization)
* Thông tin sản phẩm từ cơ sở dữ liệu quan hệ (bao gồm tên, mô tả chi tiết, giá tiền và thuộc tính chất liệu) được nối lại thành một đoạn văn bản thô đại diện.
* Đoạn văn bản này được gửi đến API của OpenAI sử dụng mô hình `text-embedding-3-small` để chuyển đổi thành một vector số thực có kích thước **1536 chiều**.
* Vector này đại diện cho ý nghĩa ngữ nghĩa sâu sắc của sản phẩm và được lưu trữ vào **Qdrant Vector Database**.

### Bước 2: Truy vấn ngữ nghĩa của người dùng (Query Embedding & Retrieval)
* Khi khách hàng nhập câu hỏi vào AI Chatbot (ví dụ: *"Tôi muốn tìm một chiếc áo phông mát mẻ mặc mùa hè"*), hệ thống sẽ gửi câu hỏi này qua API nhúng để chuyển đổi sang vector 1536 chiều tương ứng.
* Sử dụng phép toán **Cosine Similarity** (Độ tương đồng Cosine) để so sánh vector câu hỏi với toàn bộ vector sản phẩm có trong Qdrant DB.
* Hệ thống lọc ra tối đa 5 sản phẩm có độ tương đồng cao nhất vượt qua ngưỡng điểm chất lượng `score_threshold = 0.72`.

### Bước 3: Tách ngữ cảnh và tạo câu trả lời (Augmentation & Generation)
* 5 sản phẩm tìm thấy ở Bước 2 được trích xuất dữ liệu thô (tên, giá, mô tả) và đóng vai trò làm **Context (Ngữ cảnh)** để đưa vào Prompt gửi lên mô hình ngôn ngữ lớn (LLM GPT-4o-mini).
* **System Prompt chống ảo giác (Anti-Hallucination Instruction)**:
  * *"Chỉ được giới thiệu sản phẩm có trong ngữ cảnh được cung cấp. Tuyệt đối không tự ý bịa đặt giá cả hoặc tính năng sản phẩm mà ngữ cảnh không nhắc đến."*
* LLM tổng hợp thông tin ngữ cảnh chính xác và phản hồi lại người dùng với văn phong tự nhiên như một trợ lý bán hàng thực thụ.
