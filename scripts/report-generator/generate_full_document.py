"""
Master execution script to generate the entire Word Document (.docx) report.
"""
import sys
import os

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from doc_builder import create_base_document, add_heading_1, add_p, add_bullet
from content_part1_2 import build_cover_page, build_chapter_1, build_chapter_2
from content_part3 import build_chapter_3
from content_part4 import build_chapter_4
from content_part5 import build_chapter_5

def build_conclusion(doc):
    add_heading_1(doc, "KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN")
    add_p(doc, 
        "Tài liệu 'Phân tích và thiết kế hệ thống Bán hàng thông minh cho chuỗi cửa hàng thiết bị công nghệ (SmartTech Store)' "
        "đã hoàn thành đầy đủ, chi tiết và nghiêm túc toàn bộ 5 phần nội dung theo đúng cấu trúc đề cương yêu cầu của môn học "
        "Phân tích Thiết kế Hệ thống Thông tin (PTTKHTTT):"
    )
    add_bullet(doc, "Đã khảo sát hiện trạng thực tế, xác định mục tiêu và phạm vi hệ thống cho mô hình chuỗi cửa hàng bán lẻ công nghệ.", "1. Tổng quan & Giới thiệu: ")
    add_bullet(doc, "Đã mô hình hóa 5 quy trình nghiệp vụ cốt lõi bằng văn bản và Biểu đồ hoạt động UML (Activity Diagrams); xây dựng Biểu đồ Ca sử dụng (Use Case Diagrams) tổng quát và chi tiết; lập bảng đặc tả chuẩn 6 ca sử dụng nòng cốt và đặc tả yêu cầu phi chức năng FURPS+.", "2. Xác định yêu cầu: ")
    add_bullet(doc, "Đã phân tích kiến trúc theo mô hình BCE (Boundary - Control - Entity), xây dựng Mô hình miền (Domain Model), các Biểu đồ tuần tự pha phân tích và làm rõ các cơ chế phân tích.", "3. Phân tích hệ thống: ")
    add_bullet(doc, "Đã thiết kế 5 hệ thống con và giao diện, phân tầng gói thiết kế, mô hình tiến trình đa nhiệm, Biểu đồ tuần tự pha thiết kế chi tiết đến mức hàm/phương thức, Biểu đồ lớp chi tiết, Thiết kế CSDL hoàn chỉnh (ERD, chuẩn hóa 3NF, 10 bảng từ điển dữ liệu) và hệ thống Bản mẫu giao diện (UI Wireframes).", "4. Thiết kế hệ thống: ")
    add_bullet(doc, "Hệ thống đáp ứng xuất sắc tiêu chí 'Thông minh' một cách thực tế, không tốn kém chi phí thông qua 4 cơ chế then chốt: (1) Tự động gợi ý phụ kiện tương thích (Combo cross-sell), (2) Thanh toán VietQR động chính xác từng đồng, (3) Tra cứu và điều chuyển kho chuỗi thời gian thực, (4) Cảnh báo thiết bị tồn kho lâu ngày (Aging Stock) và kích hoạt bảo hành điện tử tự động.", "5. Tính thông minh & Tính khả thi: ")
    
    add_p(doc, 
        "Hướng phát triển tiếp theo của đồ án là hiện thực hóa mã nguồn (Implementation) phần mềm bằng các công nghệ phổ biến "
        "như Spring Boot (Java) hoặc Node.js/TypeScript kết hợp React/Vue cho quầy POS và CSDL PostgreSQL, "
        "hướng tới việc triển khai thử nghiệm tại một chuỗi cửa hàng bán lẻ công nghệ thực tế."
    )

def main():
    print("Initializing document...")
    doc = create_base_document()
    
    print("Building Cover Page...")
    build_cover_page(doc)
    
    print("Building Chapter 1: Giới thiệu...")
    build_chapter_1(doc)
    
    print("Building Chapter 2: Tổng quan về hệ thống...")
    build_chapter_2(doc)
    
    print("Building Chapter 3: Xác định yêu cầu...")
    build_chapter_3(doc)
    
    print("Building Chapter 4: Phân tích...")
    build_chapter_4(doc)
    
    print("Building Chapter 5: Thiết kế...")
    build_chapter_5(doc)
    
    print("Building Conclusion...")
    build_conclusion(doc)
    
    output_filename = "BaoCao_PTTKHTTT_DeTai20_SmartTechStore.docx"
    doc.save(output_filename)
    print(f"SUCCESS: Document successfully created and saved to '{output_filename}'!")

if __name__ == "__main__":
    main()
