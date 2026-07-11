# TÀI LIỆU PHÂN TÍCH THIẾT KẾ HỆ THỐNG KỸ THUẬT DECKKO

## 1. SƠ ĐỒ THỰC THỂ LIÊN KẾT (ERD DATABSE SCHEMA)
Hệ thống sử dụng hệ quản trị cơ sở dữ liệu quan hệ (PostgreSQL) với thiết kế chuẩn hóa để đảm bảo toàn vẹn dữ liệu:

```
[users] 1 ------ * [user_roles] * ------ 1 [roles]
   |
   | 1
   |
   *
[orders] 1 ------ * [order_items] * ------ 1 [product_variants] 
   |                                              | *
   | 1                                            |
   |                                              | 1
   *                                           [products]
[payments]                                        | *
   | 1                                            |
   |                                              | 1
   *                                           [brands] / [categories]
[shipments]
```

---

## 2. ĐẶC TẢ CHI TIẾT CÁC BẢNG CƠ SỞ DỮ LIỆU CHỦ CHỐT

### 2.1 Bảng `products` (Thông tin sản phẩm gốc)
| Tên Trường | Kiểu Dữ Liệu | Thuộc Tính | Mô Tả |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Khóa chính tự sinh (gen_random_uuid) |
| `brand_id` | UUID | FOREIGN KEY | Liên kết đến bảng `brands` |
| `category_id` | UUID | FOREIGN KEY | Liên kết đến bảng `categories` |
| `name` | VARCHAR(150) | NOT NULL | Tên hiển thị của sản phẩm |
| `slug` | VARCHAR(180) | UNIQUE, NOT NULL | Đường dẫn SEO thân thiện |
| `description`| TEXT | NULL | Mô tả chi tiết sản phẩm |

### 2.2 Bảng `product_variants` (Các phiên bản kích thước/màu sắc của sản phẩm)
| Tên Trường | Kiểu Dữ Liệu | Thuộc Tính | Mô Tả |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Khóa chính phiên bản |
| `product_id` | UUID | FOREIGN KEY | Liên kết đến bảng `products` |
| `sku` | VARCHAR(100) | UNIQUE, NOT NULL | Mã định danh quản lý kho hàng |
| `price` | DECIMAL(19,4)| NOT NULL | Giá bán của phiên bản |
| `stock_qty` | INTEGER | DEFAULT 0 | Số lượng tồn kho thực tế |
| `attributes` | JSONB | DEFAULT '{}' | Thuộc tính động (màu sắc, kích cỡ, độ co giãn) |

### 2.3 Bảng `orders` (Thông tin đơn hàng tổng quát)
| Tên Trường | Kiểu Dữ Liệu | Thuộc Tính | Mô Tả |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Khóa chính đơn hàng |
| `order_code` | VARCHAR(64) | UNIQUE, NOT NULL | Mã đơn hàng hiển thị cho khách hàng |
| `user_id` | UUID | FOREIGN KEY | Người đặt hàng (Liên kết `users`) |
| `total_amount`| DECIMAL(19,4)| NOT NULL | Tổng tiền thanh toán |
| `status` | VARCHAR(32) | DEFAULT 'pending'| Trạng thái đơn hàng (pending, paid, completed, cancelled) |

---

## 3. THIẾT KẾ CÁC API ENDPOINTS HỆ THỐNG

### 3.1 Nhóm API Nghiệp Vụ Thanh Toán & Giỏ Hàng
* **`POST /api/v2/checkout`**:
  * **Chức năng**: Khởi tạo phiên thanh toán và đặt hàng an toàn chống trùng lặp (Idempotency).
  * **Payload yêu cầu**:
    ```json
    {
      "idempotency_key": "uuid-string-unique",
      "cart_items": [
        { "variant_id": "uuid-variant-1", "quantity": 2 }
      ],
      "payment_method": "COD",
      "shipping_address": "Số 123 Đường Láng, Đống Đa, Hà Nội"
    }
    ```
  * **Mã phản hồi thành công (200 OK)**:
    ```json
    {
      "status": "success",
      "order_id": "uuid-order",
      "order_code": "TM-20260711-ABCDE",
      "amount": 1100000
    }
    ```

### 3.2 Nhóm API Tìm Kiếm Ngữ Nghĩa Semantic AI
* **`POST /api/v2/ai/semantic-search`**:
  * **Chức năng**: Nhận truy vấn tự nhiên của khách hàng, tính toán vector nhúng và tìm kiếm sản phẩm liên quan từ Qdrant DB.
  * **Payload yêu cầu**:
    ```json
    {
      "user_prompt": "Tôi muốn mua một chiếc áo khoác ấm áp đi phượt chống nước nhẹ"
    }
    ```
  * **Mã phản hồi thành công (200 OK)**:
    ```json
    {
      "response": "DECKKO xin giới thiệu Áo Khoác Gió Windbreaker Thể Thao với công nghệ cản gió và chống nước nhẹ, rất phù hợp cho các hoạt động đi phượt ngoài trời.",
      "sources": [
        { "id": "p14", "name": "Áo Khoác Gió Windbreaker Thể Thao", "price": 720000, "score": 0.81 }
      ]
    }
    ```
