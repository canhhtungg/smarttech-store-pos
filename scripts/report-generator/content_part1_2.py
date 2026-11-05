"""
Module for Cover Page, Chapter 1 (Giới thiệu), and Chapter 2 (Tổng quan về hệ thống).
"""
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from doc_builder import (
    add_title, add_heading_1, add_heading_2, add_heading_3,
    add_p, add_bullet, add_callout, add_code_block, create_styled_table,
    COLOR_PRIMARY, COLOR_SECONDARY, COLOR_TEXT, COLOR_MUTED
)

def build_cover_page(doc):
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(20)
    p_inst.paragraph_format.space_after = Pt(2)
    r1 = p_inst.add_run("BỘ GIÁO DỤC VÀ ĐÀO TẠO\n")
    r1.font.name = "Times New Roman"
    r1.font.size = Pt(12)
    r1.font.bold = True
    r2 = p_inst.add_run("HỌC VIỆN KỸ THUẬT MẬT MÃ\n")
    r2.font.name = "Times New Roman"
    r2.font.size = Pt(13)
    r2.font.bold = True
    r2.font.color.rgb = COLOR_PRIMARY
    r3 = p_inst.add_run("KHOA CÔNG NGHỆ THÔNG TIN")
    r3.font.name = "Times New Roman"
    r3.font.size = Pt(12)
    r3.font.bold = True
    
    p_divider = doc.add_paragraph()
    p_divider.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_divider.paragraph_format.space_before = Pt(4)
    p_divider.paragraph_format.space_after = Pt(80)
    r_div = p_divider.add_run("-------------------***-------------------")
    r_div.font.name = "Times New Roman"
    r_div.font.size = Pt(11)
    r_div.font.color.rgb = COLOR_MUTED
    
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(10)
    r_sub = p_sub.add_run("BÁO CÁO ĐỒ ÁN MÔN HỌC\nPHÂN TÍCH THIẾT KẾ HỆ THỐNG THÔNG TIN")
    r_sub.font.name = "Times New Roman"
    r_sub.font.size = Pt(15)
    r_sub.font.bold = True
    r_sub.font.color.rgb = COLOR_SECONDARY
    
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(15)
    p_title.paragraph_format.space_after = Pt(100)
    r_t1 = p_title.add_run("ĐỀ TÀI 20:\n")
    r_t1.font.name = "Times New Roman"
    r_t1.font.size = Pt(16)
    r_t1.font.bold = True
    r_t1.font.color.rgb = COLOR_PRIMARY
    
    r_t2 = p_title.add_run("PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG BÁN HÀNG THÔNG MINH\nCHO CHUỖI CỬA HÀNG THIẾT BỊ CÔNG NGHỆ\n(SMARTTECH STORE)")
    r_t2.font.name = "Times New Roman"
    r_t2.font.size = Pt(19)
    r_t2.font.bold = True
    r_t2.font.color.rgb = COLOR_PRIMARY
    
    # Information Box
    p_info = doc.add_paragraph()
    p_info.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_info.paragraph_format.left_indent = Inches(1.2)
    p_info.paragraph_format.line_spacing = 1.3
    p_info.paragraph_format.space_after = Pt(100)
    
    r_info = p_info.add_run(
        "Giảng viên hướng dẫn:    TS. Nguyễn Văn Hướng\n"
        "Nhóm sinh viên thực hiện: Nhóm Đồ án 20\n"
        "Thành viên nhóm:         1. Nguyễn Văn An  (Trưởng nhóm)\n"
        "                         2. Trần Thị Bình  (Thành viên)\n"
        "                         3. Lê Hoàng Cường (Thành viên)\n"
        "                         4. Phạm Minh Đức  (Thành viên)\n"
        "Lớp chuyên ngành:        AT19 - Công nghệ thông tin\n"
        "Khóa đào tạo:            2022 - 2027"
    )
    r_info.font.name = "Times New Roman"
    r_info.font.size = Pt(11.5)
    r_info.font.color.rgb = COLOR_TEXT
    
    p_foot = doc.add_paragraph()
    p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_foot.paragraph_format.space_before = Pt(40)
    r_foot = p_foot.add_run("HÀ NỘI, NĂM 2026")
    r_foot.font.name = "Times New Roman"
    r_foot.font.size = Pt(12)
    r_foot.font.bold = True
    
    doc.add_page_break()

def build_chapter_1(doc):
    add_heading_1(doc, "1. GIỚI THIỆU")
    
    add_heading_2(doc, "1.1. Mục đích tài liệu")
    add_p(doc, 
        "Tài liệu này được biên soạn nhằm mục đích đặc tả chi tiết các yêu cầu nghiệp vụ, yêu cầu hệ thống "
        "và đưa ra các mô hình phân tích, thiết kế hướng đối tượng (OOAD) hoàn chỉnh cho Hệ thống Bán hàng thông minh "
        "dành cho chuỗi cửa hàng kinh doanh thiết bị công nghệ (điện thoại, laptop, máy tính bảng và phụ kiện) "
        "mang thương hiệu SmartTech Store."
    )
    add_p(doc, 
        "Tài liệu đóng vai trò là cơ sở kỹ thuật thống nhất giữa các bên liên quan, bao gồm: "
        "Giảng viên hướng dẫn chuyên môn, nhóm kỹ sư phát triển phần mềm, chuyên viên kiểm thử chất lượng (QA/QC), "
        "và cán bộ quản lý nghiệp vụ bán lẻ. Mọi biểu đồ phân tích và thiết kế trong tài liệu tuân thủ nghiêm ngặt "
        "chuẩn ký hiệu của Ngôn ngữ mô hình hóa thống nhất (UML 2.5) và phương pháp luận phát triển hướng đối tượng."
    )
    
    add_heading_2(doc, "1.2. Phạm vi tài liệu")
    add_p(doc, 
        "Phạm vi của tài liệu bao trùm toàn bộ chu trình nghiệp vụ quản lý và bán hàng tại một chuỗi bán lẻ thiết bị công nghệ "
        "với quy mô từ 3 đến 20 chi nhánh cửa hàng kết hợp kênh đặt hàng trực tuyến (Omnichannel). Cụ thể bao gồm:"
    )
    add_bullet(doc, "Tối ưu hóa quy trình bán hàng tại quầy (Smart POS) với khả năng quét định danh duy nhất (Mã IMEI/Serial) của điện thoại, laptop và quét mã vạch SKU đối với các loại phụ kiện.", "Nghiệp vụ Bán lẻ tại quầy: ")
    add_bullet(doc, "Tự động phân tích sản phẩm chính đang bán để gợi ý tức thời các phụ kiện tương thích (củ sạc, ốp lưng, kính cường lực, balo, chuột không dây) và áp dụng giá ưu đãi mua kèm combo.", "Tính năng Gợi ý thông minh: ")
    add_bullet(doc, "Tự động sinh mã VietQR động theo tiêu chuẩn EMVCo chứa chính xác số tiền tổng hóa đơn và mã định danh giao dịch, giúp khách hàng quét thanh toán nhanh chóng mà không cần nhập số tiền thủ công.", "Thanh toán QR động: ")
    add_bullet(doc, "Tra cứu dữ liệu kho tập trung giữa các chi nhánh, tự động phát hiện hàng sắp hết để đề xuất phiếu điều chuyển giữa các cửa hàng hoặc sinh đề xuất nhập kho từ nhà cung cấp.", "Quản trị Kho chuỗi tập trung: ")
    add_bullet(doc, "Tự động kích hoạt bản ghi bảo hành điện tử ngay khi hóa đơn được thanh toán thành công, hỗ trợ tra cứu lịch sử sửa chữa/bảo hành tức thời qua số IMEI hoặc số điện thoại.", "Bảo hành điện tử (E-Warranty): ")
    add_bullet(doc, "Theo dõi vòng đời sản phẩm theo thời gian thực, phát cảnh báo đối với các dòng máy tồn kho lâu ngày (trên 60 hoặc 90 ngày) và tự động đề xuất phương án xả hàng/giảm giá.", "Cảnh báo hàng tồn lâu (Aging Stock): ")
    
    add_heading_2(doc, "1.3. Từ điển thuật ngữ (Glossary)")
    add_p(doc, "Bảng dưới đây giải thích chi tiết các thuật ngữ nghiệp vụ và kỹ thuật được sử dụng xuyên suốt tài liệu:")
    
    glossary_headers = ["Thuật ngữ", "Tên đầy đủ / Tiếng Anh", "Định nghĩa và Ý nghĩa trong hệ thống"]
    glossary_data = [
        ["POS", "Point of Sale", "Điểm bán hàng / Thiết bị & phần mềm thu ngân dùng để tạo đơn, quét mã và thanh toán."],
        ["IMEI", "International Mobile Equipment Identity", "Mã số nhận dạng thiết bị di động quốc tế (15 chữ số) duy nhất cho từng máy điện thoại."],
        ["Serial Number", "Serial Number (S/N)", "Số sê-ri định danh duy nhất cho từng chiếc laptop, linh kiện phần cứng công nghệ."],
        ["SKU", "Stock Keeping Unit", "Mã đơn vị lưu kho dùng để quản lý hàng hóa theo loại số lượng (áp dụng cho phụ kiện)."],
        ["VietQR", "Vietnam National QR Code Standard", "Chuẩn mã phản hồi nhanh quốc gia xây dựng trên chuẩn EMVCo của Napas phục vụ chuyển khoản liên ngân hàng."],
        ["EMVCo", "Europay, MasterCard, Visa Standard", "Tổ chức tiêu chuẩn thanh toán thẻ và mã QR quốc tế được ứng dụng trong tích hợp thanh toán."],
        ["E-Warranty", "Electronic Warranty", "Bảo hành điện tử, quản lý thời hạn và lịch sử bảo hành dựa trên số IMEI và SĐT khách hàng."],
        ["Cross-selling", "Cross-selling (Bán chéo)", "Kỹ thuật gợi ý khách hàng mua thêm các sản phẩm phụ trợ (phụ kiện) tương thích với sản phẩm chính."],
        ["Trade-in", "Trade-in (Thu cũ đổi mới)", "Nghiệp vụ định giá và thu mua lại thiết bị cũ của khách hàng để khấu trừ vào tiền mua máy mới."],
        ["Aging Stock", "Aging Inventory / Hàng tồn lâu", "Chỉ số đo lường số ngày sản phẩm nằm trong kho kể từ khi nhập, dùng để cảnh báo xả hàng công nghệ."],
        ["Safety Stock", "Safety Stock / Tồn kho an toàn", "Mức tồn kho tối thiểu cần duy trì tại mỗi chi nhánh để tránh đứt gãy hàng hóa."],
        ["BCE", "Boundary - Control - Entity", "Mẫu kiến trúc phân tích hướng đối tượng phân định rõ Giao diện, Điều khiển và Thực thể dữ liệu."],
        ["3NF", "Third Normal Form", "Dạng chuẩn 3 trong thiết kế cơ sở dữ liệu quan hệ, loại bỏ hoàn toàn dư thừa và dị thường dữ liệu."]
    ]
    create_styled_table(doc, glossary_headers, glossary_data, [1.1, 1.9, 3.5], "Từ điển thuật ngữ hệ thống SmartTech Store")

def build_chapter_2(doc):
    add_heading_1(doc, "2. TỔNG QUAN VỀ HỆ THỐNG")
    
    add_heading_2(doc, "2.1. Khảo sát hiện trạng")
    add_p(doc, 
        "Trong bối cảnh thị trường bán lẻ thiết bị công nghệ số (điện thoại thông minh, laptop, phụ kiện) "
        "tại Việt Nam cạnh tranh vô cùng khốc liệt, các chuỗi bán lẻ lớn như Thế Giới Di Động, FPT Shop, CellphoneS "
        "đã đầu tư hàng triệu USD để xây dựng các hệ thống ERP nội bộ đắt đỏ. Trong khi đó, các chuỗi cửa hàng vừa và nhỏ "
        "(từ 3 đến 10 cửa hàng) thường sử dụng các phần mềm SaaS đại trà như KiotViet, Sapo POS, Haravan, hoặc sổ sách/Excel."
    )
    add_p(doc, "Bảng so sánh khảo sát hiện trạng các giải pháp phần mềm trên thị trường:")
    
    survey_headers = ["Tiêu chí khảo sát", "Hệ thống SaaS phổ thông (KiotViet, Sapo)", "Hệ thống ERP lớn (MWG, FPT Shop)", "Hệ thống SmartTech Store (Đề xuất)"]
    survey_data = [
        [
            "Nghiệp vụ giải quyết",
            "Bán hàng bán lẻ chung (tạp hóa, thời trang, ăn uống), quản lý tồn kho theo số lượng đơn thuần.",
            "Bao trùm toàn bộ chuỗi cung ứng, tài chính kế toán, nhân sự, bán lẻ công nghệ quy mô lớn.",
            "Tập trung chuyên sâu vào chuỗi bán lẻ thiết bị số: quản lý từng mã IMEI, phụ kiện tương thích, bảo hành điện tử."
        ],
        [
            "Dịch vụ cung cấp",
            "Tạo đơn bán hàng, in bill, báo cáo doanh thu cơ bản, quét mã vạch SKU thông thường.",
            "Bán hàng đa kênh, quản lý IMEI, trả góp, thu cũ đổi mới, bảo hành toàn diện, BI nâng cao.",
            "Smart POS quét IMEI, tự động sinh VietQR đúng số tiền, gợi ý combo phụ kiện, tra cứu tồn kho chuỗi, định giá thu cũ."
        ],
        [
            "Môi trường vận hành",
            "Điện toán đám mây công cộng (Public Cloud Multi-tenant), trình duyệt Web và App di động.",
            "Hạ tầng Private Cloud kết hợp On-premise Data Center, chi phí bản quyền và vận hành cực kỳ đắt đỏ.",
            "Mô hình Client-Server hiện đại: POS Client nhẹ tại chi nhánh kết nối về Central Web API Server & Central DB."
        ],
        [
            "Ưu điểm",
            "Triển khai nhanh, giao diện thân thiện, chi phí thuê bao tháng thấp.",
            "Khả năng mở rộng không giới hạn, xử lý hàng triệu giao dịch, bảo mật cấp doanh nghiệp.",
            "Chi phí đầu tư hợp lý, tối ưu cho đồ án môn học, tích hợp đầy đủ tính năng thông minh đặc thù đồ công nghệ."
        ],
        [
            "Hạn chế",
            "Xử lý IMEI còn yếu, không tự gợi ý phụ kiện tương thích theo model máy, chưa tự sinh VietQR động theo chuẩn Napas.",
            "Hệ thống cồng kềnh, quy trình phê duyệt phức tạp, đòi hỏi đội ngũ IT vận hành chuyên trách đông đảo.",
            "Cần duy trì kết nối Internet ổn định để đồng bộ trạng thái khóa IMEI giữa các chi nhánh."
        ]
    ]
    create_styled_table(doc, survey_headers, survey_data, [1.3, 1.8, 1.8, 1.8], "So sánh hiện trạng các hệ thống bán hàng trên thị trường")
    
    add_p(doc, 
        "Từ kết quả khảo sát trên, việc nghiên cứu, phân tích và thiết kế một Hệ thống Bán hàng thông minh (SmartTech Store) "
        "kết hợp các cơ chế tự động hóa: gợi ý phụ kiện, cảnh báo tồn kho chuỗi, thanh toán QR động và kích hoạt bảo hành điện tử "
        "là vô cùng cấp thiết, mang tính ứng dụng thực tiễn cao và rất phù hợp với quy mô một đồ án tốt nghiệp/môn học chuyên ngành CNTT."
    )
    
    add_heading_2(doc, "2.2. Mục tiêu hệ thống")
    add_p(doc, "Hệ thống SmartTech Store hướng đến các mục tiêu chiến lược cụ thể sau:")
    add_bullet(doc, "Rút ngắn thời gian tạo đơn và thanh toán cho một chiếc điện thoại/laptop xuống dưới 45 giây (bao gồm quét IMEI, chọn phụ kiện, sinh mã VietQR và in hóa đơn).", "Tối ưu tốc độ giao dịch: ")
    add_bullet(doc, "Tăng 25% doanh thu phụ kiện thông qua cơ chế tự động gợi ý danh sách phụ kiện tương thích (ốp lưng, dán màn hình, củ sạc nhanh) ngay khi quét dòng máy chính.", "Gia tăng giá trị đơn hàng (AOV): ")
    add_bullet(doc, "Triệt tiêu 100% tình trạng sai sót số tiền chuyển khoản nhờ mã QR động điền sẵn số tiền chính xác và nội dung đơn hàng.", "Chính xác hóa thanh toán: ")
    add_bullet(doc, "Kiểm soát chính xác trạng thái từng chiếc máy theo số IMEI (Đang ở kho chi nhánh nào, Đang luân chuyển, Đã bán, Đang bảo hành), chấm dứt hiện tượng thất thoát.", "Minh bạch tồn kho chuỗi: ")
    add_bullet(doc, "Giảm 30% tỷ lệ đọng vốn do máy tồn kho lâu ngày nhờ cơ chế cảnh báo tự động sản phẩm vượt quá 60 ngày lưu kho.", "Giảm thiểu rủi ro đọng vốn: ")
    add_bullet(doc, "Thay thế hoàn toàn phiếu bảo hành giấy bằng hệ thống bảo hành điện tử tra cứu nhanh qua SĐT hoặc mã IMEI.", "Hiện đại hóa chăm sóc khách hàng: ")

    add_heading_2(doc, "2.3. Phạm vi hệ thống")
    
    add_heading_3(doc, "2.3.1. Các tác nhân người dùng cuối (End Users)")
    add_p(doc, "Hệ thống phục vụ 5 nhóm người dùng tương tác trực tiếp:")
    add_bullet(doc, "Thực hiện tạo đơn hàng tại quầy POS, quét mã IMEI/SKU, tiếp nhận gợi ý phụ kiện, sinh mã VietQR, xác nhận thanh toán và in hóa đơn cho khách.", "1. Thu ngân / Nhân viên bán hàng (Cashier / Sales): ")
    add_bullet(doc, "Quản lý việc nhập kho thiết bị theo dải IMEI từ nhà phân phối, nhập phụ kiện theo số lượng, thực hiện đóng gói và bàn giao máy trong quy trình điều chuyển giữa các chi nhánh.", "2. Kỹ thuật viên / Thủ kho chi nhánh (Store Keeper / Technician): ")
    add_bullet(doc, "Theo dõi doanh số bán hàng trong ca, duyệt các yêu cầu điều chuyển hàng đi/đến chi nhánh, quản lý nhân sự ca trực và tiếp nhận khiếu nại khách hàng.", "3. Quản lý chi nhánh (Store Manager): ")
    add_bullet(doc, "Quản lý danh mục sản phẩm, thiết lập bảng quy tắc gợi ý phụ kiện tương thích, phân bổ giá bán đồng bộ trên toàn chuỗi, giám sát cảnh báo hàng tồn lâu và phân tích báo cáo doanh thu chuỗi.", "4. Quản trị viên chuỗi / Ban giám đốc (Chain Administrator): ")
    add_bullet(doc, "Tương tác quét mã VietQR để thanh toán tại quầy, nhận hóa đơn điện tử qua Zalo/SMS, và tự tra cứu thời hạn bảo hành qua Web Portal của cửa hàng.", "5. Khách hàng (Customer): ")
    
    add_heading_3(doc, "2.3.2. Các bên liên quan (Stakeholders)")
    add_bullet(doc, "Các nhà phân phối chính hãng (Apple Việt Nam, Samsung, FPT Synnex, Digiworld) cung cấp danh sách dải số IMEI khi xuất hàng.", "Nhà phân phối thiết bị: ")
    add_bullet(doc, "Hệ thống ngân hàng thương mại và Cổng trung gian Napas/VietQR cung cấp dịch vụ phân giải mã QR và nhận thông báo thanh toán tức thời.", "Đối tác Tài chính / Ngân hàng: ")
    add_bullet(doc, "Các trung tâm bảo hành ủy quyền chính hãng (AASP, Samsung Care) tiếp nhận các ca bảo hành phần cứng nghiêm trọng từ hệ thống.", "Trung tâm bảo hành đối tác: ")
    
    add_heading_3(doc, "2.3.3. Kiến trúc tổng quan hệ thống (Overall System Architecture)")
    add_p(doc, 
        "Hệ thống được thiết kế theo kiến trúc 3 tầng tập trung (Centralized 3-Tier Architecture) hiện đại, "
        "đảm bảo tính nhất quán dữ liệu giữa các chi nhánh và tính sẵn sàng cao:"
    )
    
    arch_plantuml = """
@startuml
skinparam backgroundColor #FFFFFF
skinparam componentStyle uml2
skinparam packageStyle rectangle

package "CÁC CHI NHÁNH CỬA HÀNG (STORES)" {
    node "Chi nhánh Cầu Giấy" {
        [Smart POS Client 1]
        [Máy in Bill K80 & Máy quét 2D]
    }
    node "Chi nhánh Đống Đa" {
        [Smart POS Client 2]
    }
    node "Chi nhánh Hà Đông" {
        [Smart POS Client 3]
    }
}

package "INTERNET / MẠNG NGOÀI" {
    actor "Khách hàng" as Customer
    component "Cổng Napas / VietQR Gateway" as VietQR
}

package "HẠ TẦNG MÁY CHỦ TRUNG TÂM (CENTRAL CLOUD/DATA CENTER)" {
    component "Load Balancer & API Gateway" as APIGateway
    
    package "TẦNG ỨNG DỤNG (APPLICATION SERVER)" {
        [POS & Order Service]
        [Inventory & IMEI Service]
        [Smart Recommendation Engine]
        [E-Warranty Service]
        [Aging Stock & Report Service]
    }
    
    package "TẦNG DỮ LIỆU (DATABASE SERVER)" {
        database "Central Relational DB (PostgreSQL)" as DB
        database "In-Memory Cache (Redis)" as Cache
    }
}

[Smart POS Client 1] --> APIGateway : HTTPS / RESTful API
[Smart POS Client 2] --> APIGateway : HTTPS / RESTful API
[Smart POS Client 3] --> APIGateway : HTTPS / RESTful API
Customer --> APIGateway : Tra cứu bảo hành (Web Portal)

APIGateway --> [POS & Order Service]
APIGateway --> [Inventory & IMEI Service]
APIGateway --> [Smart Recommendation Engine]
APIGateway --> [E-Warranty Service]
APIGateway --> [Aging Stock & Report Service]

[POS & Order Service] --> VietQR : Generate Dynamic QR (EMVCo)
[POS & Order Service] --> DB
[Inventory & IMEI Service] --> DB
[Smart Recommendation Engine] --> DB
[E-Warranty Service] --> DB
[Aging Stock & Report Service] --> DB

[POS & Order Service] ..> Cache : Khóa giữ máy IMEI tạm thời
@enduml
"""
    add_code_block(doc, arch_plantuml, "Sơ đồ kiến trúc tổng thể hệ thống SmartTech Store (PlantUML)")
    
    add_callout(doc, 
        "Kiến trúc tập trung (Centralized Database) qua kết nối HTTPS bảo mật giúp tất cả các cửa hàng chi nhánh "
        "luôn nhìn thấy trạng thái tồn kho máy chính xác đến từng mili-giây. Khi thu ngân tại Chi nhánh Cầu Giấy quét một mã IMEI, "
        "hệ thống lập tức kích hoạt cơ chế khóa mềm (Pessimistic Soft-lock) trong Cache để ngăn chặn nhân viên ở chi nhánh khác bán nhầm.",
        "ĐẶC ĐIỂM THIẾT KẾ THÔNG MINH CỐT LÕI"
    )
