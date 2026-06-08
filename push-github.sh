#!/bin/bash
# ==============================================================================
# 🌟 ĐẾ TÔNG AI - SCRIPT ĐẨY MÃ NGUỒN LÊN GITHUB
# Kho lưu trữ mục tiêu: https://github.com/Deckko/-T-ng-AI.git
# ==============================================================================

# Thiết lập màu sắc để hiển thị thông báo sinh động
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================================${NC}"
echo -e "${YELLOW}           🔮 ĐẾ TÔNG AI - GITHUB DEPLOYMENT TOOL 🔮        ${NC}"
echo -e "${BLUE}============================================================${NC}"

# 1. Kiểm tra môi trường cục bộ đã cài đặt Git chưa
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Sai sót: Hệ thống chưa cài đặt Git. Vui lòng cài đặt Git và thử lại!${NC}"
    exit 1
fi

# 2. Khởi tạo Git nếu chưa có
if [ ! -d ".git" ]; then
    echo -e "${GREEN}✨ Đang khởi tạo Git Repository nội bộ...${NC}"
    git init
else
    echo -e "${GREEN}✅ Git Repository nội bộ đã được cấu hình trước đó.${NC}"
fi

# 3. Quét và thêm toàn bộ dữ liệu (Bỏ qua các tệp đã quy định trong .gitignore)
echo -e "${GREEN}⚓ Đang tiến hành add tất cả tệp nguồn (src, package.json, configs)...${NC}"
git add .

# 4. Thực hiện commit đầu tiên với thông điệp tôn nghiêm của Đế Tông AI
COMMIT_MSG="feat(core): Khởi sơn lập giáo - Tiến tông hệ thống Đấu La RPG & Economy Bot v1.0.0"
echo -e "${GREEN}📝 Đang lưu trữ trạng thái mã nguồn (Commit)...${NC}"
git commit -m "$COMMIT_MSG" 2>/dev/null || echo -e "${YELLOW}ℹ️ Không phát hiện thay đổi mới hoặc commit đã được tạo lập.${NC}"

# 5. Chuyển đổi tên nhánh mặc định sang nhanh phong vân 'main'
echo -e "${GREEN}🌿 Định hình nhánh phong vân chính tông: 'main'${NC}"
git branch -M main

# 6. Thiết lập địa chỉ liên kết với Thiên Môn GitHub
TARGET_REPO="https://github.com/Deckko/-T-ng-AI.git"
echo -e "${GREEN}🌐 Liên kết tiên đạo đến kho tàng GitHub: ${YELLOW}$TARGET_REPO${NC}"

if git remote | grep -q 'origin'; then
    git remote set-url origin "$TARGET_REPO"
else
    git remote add origin "$TARGET_REPO"
fi

echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}🎉 THIẾT LẬP HOÀN MỸ THẢO PHÁP THÀNH CÔNG!${NC}"
echo -e "Giờ đây khố phòng của bạn đã được kết nối với GitHub."
echo -e "Hãy thực thi khẩu quyết sau tại terminal để đưa toàn bộ tiên cơ lên vân trung:"
echo -e ""
echo -e "   ${YELLOW}git push -u origin main${NC}"
echo -e ""
echo -e "⚠️ ${YELLOW}Chú ý:${NC} Nếu tài khoản của bạn yêu cầu xác minh cấu hình, vui lòng nhập"
echo -e "   username và Personal Access Token (PAT) của GitHub khi được hỏi."
echo -e "${BLUE}============================================================${NC}"
