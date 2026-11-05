"""
Module for Chapter 5: Thiết kế (Design).
Includes Subsystems & Interfaces, Design Packages, Design/Implementation Mechanisms,
Process Model, Design Sequence Diagrams, Detailed Class Diagrams, Database Design (ERD, 3NF, Data Dictionary),
and UI Mockups / Wireframes.
"""
from docx.shared import Inches, Pt, RGBColor
from doc_builder import (
    add_heading_1, add_heading_2, add_heading_3,
    add_p, add_bullet, add_callout, add_code_block, create_styled_table,
    COLOR_PRIMARY, COLOR_SECONDARY, COLOR_TEXT, COLOR_MUTED
)

def build_chapter_5(doc):
    add_heading_1(doc, "5. THIẾT KẾ (DESIGN)")
    
    add_heading_2(doc, "5.1. Các hệ thống con và các giao diện (Subsystems & Interfaces)")
    add_p(doc, 
        "Hệ thống SmartTech Store được phân rã thành 5 hệ thống con (Subsystems) độc lập về mặt logic, "
        "giao tiếp với nhau thông qua các giao diện lập trình (Interfaces) được định nghĩa chặt chẽ:"
    )
    
    subsys_headers = ["Hệ thống con (Subsystem)", "Giao diện cung cấp (Provided Interface)", "Mô tả trách nhiệm và chức năng"]
    subsys_data = [
        [
            "POS & Sales Subsystem",
            "IPOSService\nISmartRecommendationService",
            "Xử lý quét mã IMEI/SKU, tính tiền, áp dụng chiết khấu combo phụ kiện và điều phối quy trình thanh toán."
        ],
        [
            "Inventory & IMEI Subsystem",
            "IInventoryService\nIIMEITrackerService",
            "Quản lý vòng đời mã IMEI từng máy, kiểm soát tồn kho phụ kiện, thực hiện xuất/nhập kho và điều chuyển chuỗi."
        ],
        [
            "E-Warranty & Customer Subsystem",
            "IEWarrantyService\nICustomerService",
            "Tự động kích hoạt bảo hành điện tử sau bán, tra cứu lịch sử bảo hành theo IMEI/SĐT và quản lý điểm hội viên."
        ],
        [
            "Reporting & BI Subsystem",
            "IReportingService\nIAgingStockAlertService",
            "Thực hiện thống kê doanh thu đa chi nhánh, quét tính toán tuổi tồn kho và phát cảnh báo hàng tồn lâu (Aging Stock)."
        ],
        [
            "Payment Gateway Subsystem",
            "IVietQRService",
            "Đóng gói thuật toán sinh chuỗi payload EMVCo Napas chuẩn quốc gia và render mã VietQR động chứa số tiền chính xác."
        ]
    ]
    create_styled_table(doc, subsys_headers, subsys_data, [1.8, 2.1, 2.6], "Danh mục các hệ thống con và giao diện định nghĩa")

    add_heading_2(doc, "5.2. Các gói thiết kế (Design Packages) và mối quan hệ giữa chúng")
    add_p(doc, 
        "Hệ thống áp dụng mô hình phân tầng chuẩn 4 tầng (Layered Architecture): Tầng Giao diện (Presentation), "
        "Tầng Điều khiển (Application/Controller), Tầng Nghiệp vụ (Domain/Service), và Tầng Truy cập Dữ liệu (Infrastructure/Data Access):"
    )
    
    pkg_puml = """
@startuml
skinparam backgroundColor #FFFFFF
skinparam packageStyle rectangle

package "Presentation Layer (Tầng Giao diện)" {
    [POS Client UI]
    [Store Inventory UI]
    [Admin BI Dashboard UI]
    [Customer Web Portal]
}

package "Controller Layer (Tầng Điều khiển)" {
    [POSController]
    [InventoryController]
    [WarrantyController]
    [ReportController]
}

package "Service Layer (Tầng Nghiệp vụ & Dịch vụ)" {
    [OrderService]
    [RecommendationService]
    [IMEITrackerService]
    [WarrantyService]
    [AgingStockService]
    [VietQRPayloadBuilder]
}

package "Repository Layer (Tầng Truy xuất Dữ liệu)" {
    [SanPhamRepository]
    [ThietBiIMEIRepository]
    [HoaDonRepository]
    [BaoHanhRepository]
    [ChiNhanhRepository]
}

database "PostgreSQL Central DB" as DB
database "Redis In-Memory Cache" as Cache

[POS Client UI] --> [POSController]
[Store Inventory UI] --> [InventoryController]
[Admin BI Dashboard UI] --> [ReportController]
[Customer Web Portal] --> [WarrantyController]

[POSController] --> [OrderService]
[POSController] --> [RecommendationService]
[InventoryController] --> [IMEITrackerService]
[WarrantyController] --> [WarrantyService]
[ReportController] --> [AgingStockService]

[OrderService] --> [VietQRPayloadBuilder]
[OrderService] --> [ThietBiIMEIRepository]
[OrderService] --> [HoaDonRepository]
[OrderService] --> [BaoHanhRepository]
[RecommendationService] --> [SanPhamRepository]
[IMEITrackerService] --> [ThietBiIMEIRepository]
[AgingStockService] --> [ThietBiIMEIRepository]

[ThietBiIMEIRepository] --> DB
[HoaDonRepository] --> DB
[BaoHanhRepository] --> DB
[SanPhamRepository] --> DB
[ChiNhanhRepository] --> DB

[OrderService] ..> Cache : Soft-lock IMEI (TTL 10m)
@enduml
"""
    add_code_block(doc, pkg_puml, "Biểu đồ các gói thiết kế (Package Diagram)")

    add_heading_2(doc, "5.3. Các cơ chế thiết kế và cơ chế triển khai tương ứng")
    add_p(doc, 
        "Bảng ánh xạ chi tiết giữa các cơ chế phân tích (Analysis Mechanisms) sang cơ chế thiết kế "
        "và các giải pháp công nghệ triển khai thực tế:"
    )
    
    mapping_headers = ["Cơ chế phân tích", "Cơ chế thiết kế (Design Pattern / Architecture)", "Cơ chế triển khai (Implementation Technology)"]
    mapping_data = [
        [
            "Nhận thực (Authentication)",
            "Token-based Security Pattern với chuẩn JWT (JSON Web Token) và mã hóa mật khẩu một chiều.",
            "Spring Security 6.x / Express.js JWT middleware kết hợp thuật toán mã hóa mật khẩu BCrypt (Salt = 12)."
        ],
        [
            "Lưu trữ (Persistence)",
            "Data Mapper / Repository Pattern kết hợp Object-Relational Mapping (ORM) đảm bảo tính toàn vẹn giao dịch.",
            "PostgreSQL 16 Relational Database Engine kết hợp ORM Hibernate (Java Spring Boot) hoặc Prisma (Node.js/TypeScript)."
        ],
        [
            "Khóa tương tranh (Concurrency)",
            "Pessimistic Soft-Locking Pattern với cơ chế thời gian sống giới hạn (TTL).",
            "Redis In-Memory Key-Value: Sử dụng lệnh `SET lock:imei:{maIMEI} {userId} NX EX 600` để khóa mềm mã IMEI trong 10 phút."
        ],
        [
            "Thanh toán QR (VietQR)",
            "Builder Pattern đóng gói chuỗi payload EMVCo (Napas Specification) và Factory Pattern tạo mã QR.",
            "Thư viện mã nguồn mở `vietqr` sinh chuỗi TLV (Tag-Length-Value); thư viện `qrcode` render ảnh QR dưới dạng Data URL/Base64."
        ],
        [
            "Gợi ý bán kèm (Recommendation)",
            "Strategy Pattern kết hợp Rule-based Evaluation Engine tra cứu bảng ma trận tương thích.",
            "Truy vấn SQL tối ưu kết hợp Indexing trên bảng `tbl_PhuKien_TuongThich`, lưu đệm cấu hình phụ kiện trong In-memory Memory Cache."
        ],
        [
            "Lập lịch nền (Scheduling)",
            "Cron Scheduler / Background Worker Pattern chạy độc lập ngoài luồng người dùng.",
            "Spring Boot `@Scheduled(cron = '0 0 0 * * ?')` hoặc Node.js `node-cron` quét CSDL lúc 00:00 hàng ngày."
        ]
    ]
    create_styled_table(doc, mapping_headers, mapping_data, [1.5, 2.5, 2.5], "Bảng ánh xạ cơ chế phân tích sang thiết kế và triển khai")

    add_heading_2(doc, "5.4. Mô hình tiến trình của hệ thống (Process Model)")
    add_p(doc, 
        "Hệ thống SmartTech Store vận hành theo mô hình tiến trình đa luồng (Multi-threaded & Asynchronous Architecture):"
    )
    add_bullet(doc, "Mỗi yêu cầu từ quầy POS (quét IMEI, thanh toán) được xử lý trong một tiểu trình riêng biệt trong Thread Pool của Web Server, đảm bảo quầy thu ngân này thao tác không làm chậm quầy thu ngân khác.", "Tiến trình phục vụ bán hàng (Synchronous Web Request Thread): ")
    add_bullet(doc, "Khi khách bấm thanh toán VietQR, một tác vụ bất đồng bộ (Asynchronous Task) lắng nghe kết quả qua cơ chế Polling hoặc Webhook từ Ngân hàng để cập nhật trạng thái đơn hàng ngay lập tức khi tiền về tài khoản.", "Tiến trình đồng bộ thanh toán: ")
    add_bullet(doc, "Sau khi đơn hàng hoàn tất, các tác vụ in hóa đơn, gửi tin nhắn SMS kích hoạt bảo hành cho khách hàng được đẩy vào Hàng đợi thông điệp (Background Task Queue) để xử lý ngầm, giúp giao diện POS phản hồi ngay lập tức cho thu ngân.", "Tiến trình hậu mãi chạy ngầm: ")
    add_bullet(doc, "Một tiến trình ngầm (Daemon Cron Job) tự động kích hoạt vào lúc 00:00 hàng ngày để quét toàn bộ CSDL thiết bị, tính toán số ngày lưu kho và phát sinh cảnh báo Aging Stock.", "Tiến trình quét tồn kho định kỳ: ")

    add_heading_2(doc, "5.5. Các biểu đồ tuần tự pha thiết kế (Design Sequence Diagrams)")
    
    add_heading_3(doc, "5.5.1. Biểu đồ tuần tự thiết kế: Bán hàng, Gợi ý phụ kiện và Thanh toán VietQR")
    add_p(doc, 
        "Biểu đồ tuần tự thiết kế chi tiết hóa lời gọi hàm, danh sách tham số truyền và kiểu dữ liệu trả về "
        "giữa các tầng UI, Controller, Service, Repository và Database:"
    )
    
    seq_design_sale_puml = """
@startuml
skinparam backgroundColor #FFFFFF
autonumber
actor "Thu ngân" as User
boundary ":POSScreen" as UI
control ":POSController" as Controller
control ":OrderService" as OrderSvc
control ":RecommendationService" as RecSvc
control ":VietQRService" as QRSvc
entity ":ThietBiIMEIRepository" as IMEIRepo
entity ":HoaDonRepository" as OrderRepo
entity ":BaoHanhRepository" as WarrantyRepo
database ":PostgreSQL" as DB

User -> UI : scanIMEI("356892110294812")
UI -> Controller : handleScanIMEI(imeiStr: String, branchId: String)
Controller -> OrderSvc : validateAndLockIMEI(imeiStr, branchId)
OrderSvc -> IMEIRepo : findByIMEI(imeiStr)
IMEIRepo -> DB : SELECT * FROM tbl_ThietBi_IMEI WHERE ma_imei = ?
DB --> IMEIRepo : DeviceRecord(modelId="IP15PM", status="SanSangBan")
IMEIRepo --> OrderSvc : deviceEntity

OrderSvc -> IMEIRepo : updateStatus(imeiStr, "KhoaTamThoi")
IMEIRepo -> DB : UPDATE tbl_ThietBi_IMEI SET trang_thai = 'KhoaTamThoi'
OrderSvc -> RecSvc : getCompatibleAccessories("IP15PM")
RecSvc -> DB : SELECT * FROM tbl_PhuKien_TuongThich WHERE ma_sp_chinh = 'IP15PM'
DB --> RecSvc : List<AccessoryRuleDTO>
RecSvc --> OrderSvc : listAccessories
OrderSvc --> Controller : CartResponseDTO(device, listAccessories)
Controller --> UI : renderCartAndRecommendations()

User -> UI : selectAccessory(sku="AP-20W-CHARGER")
UI -> Controller : addAccessoryToCart(sku)
Controller -> OrderSvc : calculateTotalWithComboDiscount()
OrderSvc --> Controller : updatedTotal: 34,500,000 VND
Controller --> UI : refreshTotalDisplay(34,500,000 VND)

User -> UI : clickPaymentVietQR()
UI -> Controller : requestVietQRPayment(orderId, 34500000)
Controller -> QRSvc : buildPayload(bin="970422", stk="19036788899", amount=34500000, addInfo="HD10293")
QRSvc --> Controller : qrDataURL: "data:image/png;base64,iVBORw0KG..."
Controller --> UI : displayDynamicQRCode(qrDataURL)

User -> UI : confirmPaymentReceived()
UI -> Controller : processPaymentSuccess(orderId)
Controller -> OrderSvc : completeOrder(orderId)
OrderSvc -> OrderRepo : saveInvoice(orderDTO)
OrderRepo -> DB : INSERT INTO tbl_HoaDon VALUES (...)
OrderSvc -> IMEIRepo : updateStatus(imeiStr, "DaBan")
IMEIRepo -> DB : UPDATE tbl_ThietBi_IMEI SET trang_thai = 'DaBan'
OrderSvc -> WarrantyRepo : createEWarranty(imeiStr, phone, 12)
WarrantyRepo -> DB : INSERT INTO tbl_BaoHanh_DienTu VALUES (...)
OrderSvc --> Controller : OrderReceiptDTO
Controller --> UI : triggerPrintInvoice() & showSuccessDialog()
@enduml
"""
    add_code_block(doc, seq_design_sale_puml, "Biểu đồ tuần tự pha thiết kế: Bán hàng tại quầy & Thanh toán VietQR (Design Sequence)")

    add_heading_3(doc, "5.5.2. Biểu đồ tuần tự thiết kế: Lập và duyệt phiếu điều chuyển kho")
    add_p(doc, "Biểu đồ mô tả chi tiết phương thức điều chuyển thiết bị giữa 2 chi nhánh:")
    
    seq_design_trans_puml = """
@startuml
skinparam backgroundColor #FFFFFF
autonumber
actor "Quản lý Cửa hàng B" as Manager
boundary ":TransferScreen" as UI
control ":TransferController" as Controller
control ":InventoryService" as InvSvc
entity ":PhieuDieuChuyenRepository" as TransRepo
entity ":ThietBiIMEIRepository" as IMEIRepo
database ":PostgreSQL" as DB

Manager -> UI : approveTransfer(ticketId="TRF-001", exportIMEI="356892110294812")
UI -> Controller : handleApprove(ticketId, exportIMEI)
Controller -> InvSvc : executeExportTransfer(ticketId, exportIMEI)
InvSvc -> IMEIRepo : updateDeviceStatus(exportIMEI, "DangLuanChuyen")
IMEIRepo -> DB : UPDATE tbl_ThietBi_IMEI SET trang_thai = 'DangLuanChuyen'
InvSvc -> TransRepo : updateTicketStatus(ticketId, "InTransit", exportIMEI)
TransRepo -> DB : UPDATE tbl_PhieuDieuChuyen SET trang_thai = 'InTransit', ma_imei = ?
TransRepo --> InvSvc : success
InvSvc --> Controller : TransferResponseDTO("Đã xuất kho, hàng đang luân chuyển")
Controller --> UI : showPrintWaybillDialog()
@enduml
"""
    add_code_block(doc, seq_design_trans_puml, "Biểu đồ tuần tự pha thiết kế: Phê duyệt và Xuất kho điều chuyển")

    add_heading_2(doc, "5.6. Biểu đồ lớp thiết kế chi tiết cho các hệ thống con")
    add_p(doc, 
        "Biểu đồ lớp thiết kế chi tiết hóa cấu trúc các lớp Service, Controller, Model và Repository, "
        "thể hiện đầy đủ tên thuộc tính, kiểu dữ liệu, các phương thức và phạm vi truy cập (+ public, - private, # protected):"
    )
    
    detailed_class_puml = """
@startuml
skinparam backgroundColor #FFFFFF
skinparam classAttributeIconSize 0

class POSController {
    - orderService: OrderService
    - recommendationService: RecommendationService
    - vietQRService: VietQRService
    + handleScanIMEI(imei: String, branchId: String): ResponseEntity
    + addAccessoryToCart(orderId: String, sku: String): ResponseEntity
    + requestVietQRPayment(orderId: String, amount: Double): ResponseEntity
    + confirmPayment(orderId: String): ResponseEntity
}

class OrderService {
    - imeiRepo: ThietBiIMEIRepository
    - orderRepo: HoaDonRepository
    - warrantyRepo: BaoHanhRepository
    - redisClient: RedisCacheClient
    + validateAndLockIMEI(imei: String, branchId: String): DeviceDTO
    + calculateTotalWithComboDiscount(orderId: String): Double
    + completeOrder(orderId: String): OrderReceiptDTO
}

class RecommendationService {
    - spRepo: SanPhamRepository
    + getCompatibleAccessories(modelId: String): List<AccessoryRuleDTO>
    + calculateComboDiscount(deviceModelId: String, listSKU: List<String>): Double
}

class VietQRService {
    - napasBinCode: String
    - defaultAccountNo: String
    + buildPayload(bin: String, stk: String, amount: Double, addInfo: String): String
    + generateQRCodeImageBase64(payload: String): String
}

class ThietBiIMEIRepository {
    + findByIMEI(maIMEI: String): DeviceEntity
    + updateStatus(maIMEI: String, newStatus: String): Boolean
    + updateBranch(maIMEI: String, newBranchId: String): Boolean
    + findAgingDevices(minDays: Integer): List<DeviceEntity>
}

class HoaDonRepository {
    + saveInvoice(invoice: InvoiceEntity): InvoiceEntity
    + findById(orderId: String): InvoiceEntity
    + getRevenueStats(branchId: String, fromDate: Date, toDate: Date): RevenueDTO
}

class BaoHanhRepository {
    + createEWarranty(warranty: EWarrantyEntity): Boolean
    + findByIMEIOrPhone(keyword: String): List<EWarrantyEntity>
}

POSController --> OrderService
POSController --> RecommendationService
POSController --> VietQRService
OrderService --> ThietBiIMEIRepository
OrderService --> HoaDonRepository
OrderService --> BaoHanhRepository

@enduml
"""
    add_code_block(doc, detailed_class_puml, "Biểu đồ lớp chi tiết (Detailed Class Diagram)")

    add_heading_2(doc, "5.7. Thiết kế cơ sở dữ liệu (Database Design)")
    
    add_heading_3(doc, "5.7.1. Sơ đồ thực thể liên kết (ERD)")
    add_p(doc, 
        "Sơ đồ ERD mô hình hóa toàn bộ cấu trúc dữ liệu quan hệ, thể hiện rõ ràng các khóa chính (PK), "
        "khóa ngoại (FK) và mối quan hệ giữa các bảng:"
    )
    
    erd_puml = """
@startuml
skinparam backgroundColor #FFFFFF
skinparam linetype ortho

entity "tbl_ChiNhanh" as ChiNhanh {
    * ma_chi_nhanh : VARCHAR(10) <<PK>>
    --
    ten_chi_nhanh : VARCHAR(100)
    dia_chi : VARCHAR(255)
    so_dien_thoai : VARCHAR(15)
}

entity "tbl_NhanVien" as NhanVien {
    * ma_nhan_vien : VARCHAR(10) <<PK>>
    --
    ma_chi_nhanh : VARCHAR(10) <<FK>>
    ho_ten : VARCHAR(100)
    chuc_vu : VARCHAR(50)
    so_dien_thoai : VARCHAR(15)
    mat_khau_hash : VARCHAR(255)
}

entity "tbl_SanPham" as SanPham {
    * ma_san_pham : VARCHAR(20) <<PK>>
    --
    ten_san_pham : VARCHAR(150)
    thuong_hieu : VARCHAR(50)
    loai_san_pham : VARCHAR(20)
    gia_niem_yet : NUMERIC(12,2)
    thoi_gian_bao_hanh_thang : INT
}

entity "tbl_ThietBi_IMEI" as ThietBi {
    * ma_imei : VARCHAR(15) <<PK>>
    --
    ma_san_pham : VARCHAR(20) <<FK>>
    ma_chi_nhanh : VARCHAR(10) <<FK>>
    so_serial : VARCHAR(50)
    trang_thai : VARCHAR(20)
    ngay_nhap_kho : DATE
    gia_nhap : NUMERIC(12,2)
}

entity "tbl_TonKho_PhuKien" as TonKhoPK {
    * id : INT <<PK, Auto>>
    --
    ma_san_pham : VARCHAR(20) <<FK>>
    ma_chi_nhanh : VARCHAR(10) <<FK>>
    so_luong_ton : INT
    muc_ton_an_toan : INT
}

entity "tbl_PhuKien_TuongThich" as TuongThich {
    * id : INT <<PK, Auto>>
    --
    ma_sp_chinh : VARCHAR(20) <<FK>>
    ma_sp_phu_kien : VARCHAR(20) <<FK>>
    muc_do_uu_tien : INT
    phan_tram_giam_combo : NUMERIC(5,2)
}

entity "tbl_KhachHang" as KhachHang {
    * ma_khach_hang : VARCHAR(10) <<PK>>
    --
    so_dien_thoai : VARCHAR(15) <<UNIQUE>>
    ho_ten : VARCHAR(100)
    diem_tich_luy : INT
    hang_thanh_vien : VARCHAR(20)
}

entity "tbl_HoaDon" as HoaDon {
    * ma_hoa_don : VARCHAR(20) <<PK>>
    --
    ma_chi_nhanh : VARCHAR(10) <<FK>>
    ma_nhan_vien : VARCHAR(10) <<FK>>
    ma_khach_hang : VARCHAR(10) <<FK>>
    ngay_lap : TIMESTAMP
    tong_tien_hang : NUMERIC(12,2)
    tien_giam_gia : NUMERIC(12,2)
    tong_thanh_toan : NUMERIC(12,2)
    phuong_thuc_tt : VARCHAR(20)
    ma_giao_dich_qr : VARCHAR(50)
    trang_thai_don : VARCHAR(20)
}

entity "tbl_ChiTietHoaDon" as ChiTietHD {
    * id : INT <<PK, Auto>>
    --
    ma_hoa_don : VARCHAR(20) <<FK>>
    ma_san_pham : VARCHAR(20) <<FK>>
    ma_imei : VARCHAR(15) <<FK, NULL>>
    so_luong : INT
    don_gia_ban : NUMERIC(12,2)
    tien_giam_combo : NUMERIC(12,2)
    thanh_tien : NUMERIC(12,2)
}

entity "tbl_BaoHanh_DienTu" as BaoHanh {
    * ma_bao_hanh : VARCHAR(20) <<PK>>
    --
    ma_imei : VARCHAR(15) <<FK>>
    ma_hoa_don : VARCHAR(20) <<FK>>
    so_dien_thoai_khach : VARCHAR(15)
    ngay_kich_hoat : DATE
    ngay_het_han : DATE
    trang_thai_bao_hanh : VARCHAR(20)
}

entity "tbl_PhieuDieuChuyen" as DieuChuyen {
    * ma_phieu_chuyen : VARCHAR(20) <<PK>>
    --
    ma_chi_nhanh_xuat : VARCHAR(10) <<FK>>
    ma_chi_nhanh_nhap : VARCHAR(10) <<FK>>
    ma_imei : VARCHAR(15) <<FK>>
    ngay_tao : TIMESTAMP
    trang_thai : VARCHAR(20)
    ghi_chu : VARCHAR(255)
}

ChiNhanh ||--o{ NhanVien
ChiNhanh ||--o{ ThietBi
ChiNhanh ||--o{ TonKhoPK
ChiNhanh ||--o{ HoaDon
ChiNhanh ||--o{ DieuChuyen : "Kho xuất"
ChiNhanh ||--o{ DieuChuyen : "Kho nhập"

SanPham ||--o{ ThietBi
SanPham ||--o{ TonKhoPK
SanPham ||--o{ TuongThich : "SP Chính"
SanPham ||--o{ TuongThich : "Phụ kiện"
SanPham ||--o{ ChiTietHD

KhachHang ||--o{ HoaDon
NhanVien ||--o{ HoaDon
HoaDon ||--|{ ChiTietHD
HoaDon ||--o{ BaoHanh

ThietBi ||--o| ChiTietHD
ThietBi ||--o| BaoHanh
ThietBi ||--o{ DieuChuyen
@enduml
"""
    add_code_block(doc, erd_puml, "Sơ đồ quan hệ thực thể (Entity-Relationship Diagram - ERD)")

    add_heading_3(doc, "5.7.2. Lược đồ CSDL quan hệ chuẩn hóa 3NF (Third Normal Form)")
    add_p(doc, 
        "Tất cả các bảng trong hệ thống đã được chuẩn hóa đạt Chuẩn 3 (3NF): "
        "Không chứa các thuộc tính lặp (1NF), mọi thuộc tính không khóa đều phụ thuộc đầy đủ vào toàn bộ khóa chính (2NF), "
        "và không có sự phụ thuộc bắc cầu giữa các thuộc tính không khóa (3NF)."
    )

    add_heading_3(doc, "5.7.3. Từ điển dữ liệu (Data Dictionary) chi tiết 10 bảng cốt lõi")
    add_p(doc, "Dưới đây là đặc tả kỹ thuật chi tiết các bảng trong cơ sở dữ liệu:")
    
    # Bảng 1: Chi nhánh
    dict1_h = ["Tên cột", "Kiểu dữ liệu", "Khóa", "Null?", "Mô tả ý nghĩa"]
    dict1_d = [
        ["ma_chi_nhanh", "VARCHAR(10)", "PK", "No", "Mã định danh chi nhánh (VD: CN-CG, CN-DD, CN-HD)"],
        ["ten_chi_nhanh", "VARCHAR(100)", "-", "No", "Tên chi nhánh (VD: Cửa hàng Cầu Giấy)"],
        ["dia_chi", "VARCHAR(255)", "-", "No", "Địa chỉ chi nhánh"],
        ["so_dien_thoai", "VARCHAR(15)", "-", "No", "Số điện thoại hotline chi nhánh"]
    ]
    create_styled_table(doc, dict1_h, dict1_d, [1.4, 1.3, 0.7, 0.7, 2.4], "Từ điển dữ liệu: tbl_ChiNhanh")

    # Bảng 2: Sản phẩm
    dict2_d = [
        ["ma_san_pham", "VARCHAR(20)", "PK", "No", "Mã định danh dòng sản phẩm (VD: IP15PM, MB-AIR-M2, AP-20W)"],
        ["ten_san_pham", "VARCHAR(150)", "-", "No", "Tên sản phẩm đầy đủ"],
        ["thuong_hieu", "VARCHAR(50)", "-", "No", "Hãng sản xuất (Apple, Samsung, Asus, Anker)"],
        ["loai_san_pham", "VARCHAR(20)", "-", "No", "Phân loại: 'DienThoai', 'Laptop', 'PhuKien'"],
        ["gia_niem_yet", "NUMERIC(12,2)", "-", "No", "Giá bán lẻ niêm yết (VNĐ)"],
        ["thoi_gian_bao_hanh_thang", "INT", "-", "No", "Số tháng bảo hành tiêu chuẩn (VD: 12)"]
    ]
    create_styled_table(doc, dict1_h, dict2_d, [1.4, 1.3, 0.7, 0.7, 2.4], "Từ điển dữ liệu: tbl_SanPham")

    # Bảng 3: Thiết bị IMEI
    dict3_d = [
        ["ma_imei", "VARCHAR(15)", "PK", "No", "Mã IMEI duy nhất (15 chữ số) của từng máy"],
        ["ma_san_pham", "VARCHAR(20)", "FK", "No", "Tham chiếu đến tbl_SanPham(ma_san_pham)"],
        ["ma_chi_nhanh", "VARCHAR(10)", "FK", "No", "Tham chiếu chi nhánh hiện đang lưu giữ máy"],
        ["so_serial", "VARCHAR(50)", "-", "Yes", "Số Serial phần cứng (đặc biệt với Laptop)"],
        ["trang_thai", "VARCHAR(20)", "-", "No", "'SanSangBan', 'KhoaTamThoi', 'DangLuanChuyen', 'DaBan', 'BaoHanh'"],
        ["ngay_nhap_kho", "DATE", "-", "No", "Ngày máy nhập về kho (dùng tính tuổi tồn kho Aging)"],
        ["gia_nhap", "NUMERIC(12,2)", "-", "No", "Giá vốn nhập kho từ nhà phân phối"]
    ]
    create_styled_table(doc, dict1_h, dict3_d, [1.4, 1.3, 0.7, 0.7, 2.4], "Từ điển dữ liệu: tbl_ThietBi_IMEI")

    # Bảng 4: Phụ kiện tương thích
    dict4_d = [
        ["id", "INT", "PK", "No", "Khóa tự tăng"],
        ["ma_sp_chinh", "VARCHAR(20)", "FK", "No", "Model máy chính (VD: IP15PM)"],
        ["ma_sp_phu_kien", "VARCHAR(20)", "FK", "No", "Model phụ kiện gợi ý (VD: AP-20W, OP-IP15PM)"],
        ["muc_do_uu_tien", "INT", "-", "No", "Thứ tự ưu tiên hiển thị gợi ý (1: Cao nhất, 2, 3...)"],
        ["phan_tram_giam_combo", "NUMERIC(5,2)", "-", "No", "% giảm giá nếu khách mua kèm (VD: 15.00 = 15%)"]
    ]
    create_styled_table(doc, dict1_h, dict4_d, [1.4, 1.3, 0.7, 0.7, 2.4], "Từ điển dữ liệu: tbl_PhuKien_TuongThich")

    # Bảng 5: Hóa đơn
    dict5_d = [
        ["ma_hoa_don", "VARCHAR(20)", "PK", "No", "Mã hóa đơn duy nhất (VD: HD20261106-001)"],
        ["ma_chi_nhanh", "VARCHAR(10)", "FK", "No", "Chi nhánh phát sinh hóa đơn"],
        ["ma_nhan_vien", "VARCHAR(10)", "FK", "No", "Thu ngân lập hóa đơn"],
        ["ma_khach_hang", "VARCHAR(10)", "FK", "Yes", "Mã khách hàng thành viên (nếu có)"],
        ["ngay_lap", "TIMESTAMP", "-", "No", "Thời gian thanh toán hóa đơn"],
        ["tong_tien_hang", "NUMERIC(12,2)", "-", "No", "Tổng tiền hàng trước giảm giá"],
        ["tien_giam_gia", "NUMERIC(12,2)", "-", "No", "Tổng số tiền chiết khấu / giảm combo"],
        ["tong_thanh_toan", "NUMERIC(12,2)", "-", "No", "Số tiền thực tế khách cần thanh toán"],
        ["phuong_thuc_tt", "VARCHAR(20)", "-", "No", "'VietQR', 'TienMat', 'The'"],
        ["ma_giao_dich_qr", "VARCHAR(50)", "-", "Yes", "Mã tham chiếu giao dịch chuyển khoản VietQR"],
        ["trang_thai_don", "VARCHAR(20)", "-", "No", "'ChoThanhToan', 'DaThanhToan', 'DaHuy'"]
    ]
    create_styled_table(doc, dict1_h, dict5_d, [1.4, 1.3, 0.7, 0.7, 2.4], "Từ điển dữ liệu: tbl_HoaDon")

    # Bảng 6: Chi tiết hóa đơn
    dict6_d = [
        ["id", "INT", "PK", "No", "Khóa tự tăng"],
        ["ma_hoa_don", "VARCHAR(20)", "FK", "No", "Tham chiếu tbl_HoaDon"],
        ["ma_san_pham", "VARCHAR(20)", "FK", "No", "Tham chiếu tbl_SanPham"],
        ["ma_imei", "VARCHAR(15)", "FK", "Yes", "Mã IMEI của máy bán (NULL nếu là phụ kiện)"],
        ["so_luong", "INT", "-", "No", "Số lượng bán (Luôn = 1 với máy IMEI)"],
        ["don_gia_ban", "NUMERIC(12,2)", "-", "No", "Đơn giá niêm yết tại thời điểm bán"],
        ["tien_giam_combo", "NUMERIC(12,2)", "-", "No", "Tiền giảm giá combo phụ kiện (nếu có)"],
        ["thanh_tien", "NUMERIC(12,2)", "-", "No", "Thành tiền = (đơn giá - giảm giá) * số lượng"]
    ]
    create_styled_table(doc, dict1_h, dict6_d, [1.4, 1.3, 0.7, 0.7, 2.4], "Từ điển dữ liệu: tbl_ChiTietHoaDon")

    # Bảng 7: Bảo hành điện tử
    dict7_d = [
        ["ma_bao_hanh", "VARCHAR(20)", "PK", "No", "Mã hồ sơ bảo hành (VD: BH-356892110294812)"],
        ["ma_imei", "VARCHAR(15)", "FK", "No", "Tham chiếu đến mã IMEI của thiết bị"],
        ["ma_hoa_don", "VARCHAR(20)", "FK", "No", "Hóa đơn mua máy gốc"],
        ["so_dien_thoai_khach", "VARCHAR(15)", "-", "No", "SĐT khách hàng để tra cứu nhanh"],
        ["ngay_kich_hoat", "DATE", "-", "No", "Ngày mua/kích hoạt bảo hành"],
        ["ngay_het_han", "DATE", "-", "No", "Ngày hết hạn bảo hành"],
        ["trang_thai_bao_hanh", "VARCHAR(20)", "-", "No", "'ConHan', 'HetHan', 'DangTiepNhan'"]
    ]
    create_styled_table(doc, dict1_h, dict7_d, [1.4, 1.3, 0.7, 0.7, 2.4], "Từ điển dữ liệu: tbl_BaoHanh_DienTu")

    # Bảng 8: Phiếu điều chuyển
    dict8_d = [
        ["ma_phieu_chuyen", "VARCHAR(20)", "PK", "No", "Mã phiếu điều chuyển (VD: TRF-202611-001)"],
        ["ma_chi_nhanh_xuat", "VARCHAR(10)", "FK", "No", "Chi nhánh gửi máy đi"],
        ["ma_chi_nhanh_nhap", "VARCHAR(10)", "FK", "No", "Chi nhánh tiếp nhận máy"],
        ["ma_imei", "VARCHAR(15)", "FK", "No", "Mã IMEI của thiết bị được chuyển"],
        ["ngay_tao", "TIMESTAMP", "-", "No", "Thời gian lập phiếu"],
        ["trang_thai", "VARCHAR(20)", "-", "No", "'Pending', 'Approved', 'InTransit', 'Completed', 'Rejected'"],
        ["ghi_chu", "VARCHAR(255)", "-", "Yes", "Lý do chuyển hoặc ghi chú niêm phong"]
    ]
    create_styled_table(doc, dict1_h, dict8_d, [1.4, 1.3, 0.7, 0.7, 2.4], "Từ điển dữ liệu: tbl_PhieuDieuChuyen")

    add_heading_2(doc, "5.8. Bản mẫu các giao diện (UI Mockups / Wireframes)")
    add_p(doc, 
        "Dưới đây là bản thiết kế phác thảo giao diện (Wireframes) trực quan của các màn hình then chốt trong hệ thống:"
    )

    add_heading_3(doc, "5.8.1. Màn hình Bán hàng POS thông minh & Gợi ý phụ kiện kèm theo")
    pos_mockup = """
+----------------------------------------------------------------------------------------------------------+
|  SMARTTECH STORE POS - CHI NHÁNH CẦU GIẤY             | Thu ngân: Nguyễn Văn An (Ca sáng)  | [Đăng xuất] |
+----------------------------------------------------------------------------------------------------------+
| [ Ô QUÉT MÃ IMEI / TÊN MÁY: [ 356892110294812            ] (F2: Quét) ] [ + Thêm máy ]                   |
+-----------------------------------------------------------+----------------------------------------------+
| GIỎ HÀNG ĐANG CHỌN (ĐƠN #HD-10293)                        | ★ GỢI Ý PHỤ KIỆN TƯƠNG THÍCH (COMBO DISCOUNT)|
+-----------------------------------------------------------+----------------------------------------------+
| 1. iPhone 15 Pro Max 256GB Titan Tự nhiên                 | Phát hiện máy: iPhone 15 Pro Max 256GB       |
|    - IMEI: 356892110294812 [✓ Sẵn sàng bán]               | Gợi ý mua kèm ưu đãi (Tiết kiệm đến 20%):     |
|    - Giá: 32,990,000 đ                                    |                                              |
|                                                           | [X] Củ sạc Apple 20W Type-C Chính hãng        |
| 2. Củ sạc Apple 20W Type-C (Mua kèm Combo)                |     Giá gốc: 550,000 đ -> Giảm còn: 440,000 đ|
|    - SKU: AP-20W [Giảm combo: -110,000 đ]                 |     [+ Đã thêm vào giỏ]                      |
|    - Giá bán: 440,000 đ                                   |                                              |
|                                                           | [ ] Kính cường lực KingKong Chống nhìn trộm   |
| 3. Kính cường lực KingKong (Mua kèm Combo)                |     Giá gốc: 250,000 đ -> Giảm còn: 190,000 đ|
|    - SKU: CL-KK-15PM [Giảm combo: -60,000 đ]              |     [+ Chọn mua]                             |
|    - Giá bán: 190,000 đ                                   |                                              |
|                                                           | [ ] Ốp lưng MagSafe Trong suốt chống ố vàng   |
|                                                           |     Giá gốc: 390,000 đ -> Giảm còn: 290,000 đ|
|                                                           |     [+ Chọn mua]                             |
+-----------------------------------------------------------+----------------------------------------------+
| Khách hàng: [ 0988 123 456 ] - Anh Tuấn (Hạng Vàng: 150 điểm) | Tổng tiền hàng:          33,790,000 đ        |
| Ghi chú đơn: [                                          ] | Giảm giá combo:            -170,000 đ        |
|                                                           | Dùng 100 điểm:             -100,000 đ        |
|                                                           | -------------------------------------------- |
|                                                           | TỔNG THANH TOÁN:         33,520,000 đ        |
+-----------------------------------------------------------+----------------------------------------------+
| [ F8: TIỀN MẶT ]   | [ F9: THẺ POS ]   | [ F10: THANH TOÁN VIETQR ĐỘNG ★ ]   | [ ESC: HỦY ĐƠN HÀNG ]      |
+----------------------------------------------------------------------------------------------------------+
"""
    add_code_block(doc, pos_mockup, "Bản mẫu giao diện: Màn hình Bán hàng POS thông minh & Bảng gợi ý phụ kiện")

    add_heading_3(doc, "5.8.2. Màn hình Popup Sinh mã VietQR động có sẵn số tiền")
    qr_mockup = """
+-----------------------------------------------------------------------------------+
|               POPUP THANH TOÁN CHUYỂN KHOẢN QUA MÃ VIETQR ĐỘNG                    |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|           +-------------------------------+   ĐƠN HÀNG: #HD-10293                 |
|           |  ###########################  |   Khách hàng: Anh Tuấn (0988 123 456) |
|           |  ##       ##   ##  ##     ##  |   ----------------------------------  |
|           |  ##  ###  ##   ####    #  ##  |   Ngân hàng: MB Bank (Quân Đội)       |
|           |  ##  ###  ##   ##   #  #  ##  |   Số TK:     098812399999             |
|           |  ##       ##   #   #   #  ##  |   Chủ TK:    SMARTTECH STORE CAU GIAY |
|           |  ###########   # # # #######  |   ----------------------------------  |
|           |  ##   # # ## #  # ##   #  ##  |   SỐ TIỀN THANH TOÁN:                 |
|           |  #  #   #  #####   #  ### ##  |   >>> 33,520,000 VNĐ <<<              |
|           |  ##       ## # #   # #    ##  |   (Đã tự động điền sẵn số tiền)       |
|           |  ##  ###  ##  ### # ##    ##  |   ----------------------------------  |
|           |  ##  ###  ##   #   # #    ##  |   Nội dung CK: HD10293                |
|           |  ##       ##    # ##  #   ##  |   Thời gian chờ: 02:45s               |
|           |  ###########################  |                                       |
|           +-------------------------------+                                       |
|             (Quét bằng mọi App Ngân hàng)                                         |
|                                                                                   |
|  [ ✓ ĐÃ NHẬN TIỀN THÀNH CÔNG (F12) ]      |      [ ĐỔI SANG TIỀN MẶT ]            |
+-----------------------------------------------------------------------------------+
"""
    add_code_block(doc, qr_mockup, "Bản mẫu giao diện: Popup hiển thị mã VietQR động có sẵn số tiền thanh toán")

    add_heading_3(doc, "5.8.3. Màn hình Dashboard Báo cáo Doanh thu & Cảnh báo tồn kho lâu (Aging Stock)")
    dashboard_mockup = """
+----------------------------------------------------------------------------------------------------------+
| SMARTTECH STORE - BẢNG ĐIỀU KHIỂN QUẢN TRỊ CHUỖI & PHÂN TÍCH KINH DOANH              | Admin: Giám đốc   |
+----------------------------------------------------------------------------------------------------------+
| DOANH THU HÔM NAY        | TỔNG ĐƠN HÀNG          | TỶ LỆ KÈM PHỤ KIỆN      | CẢNH BÁO HÀNG TỒN LÂU      |
| 145,800,000 đ (+12%)     | 18 Đơn hàng            | 72.5% (Mục tiêu 65%)    | 5 Máy (>60 Ngày) [XỬ LÝ]   |
+--------------------------+------------------------+-------------------------+----------------------------+
| BIỂU ĐỒ DOANH THU THEO CHI NHÁNH                  | TOP DÒNG MÁY BÁN CHẠY NHẤT HÔM NAY                   |
| 1. Cầu Giấy : [=======================] 78.5 tr   | 1. iPhone 15 Pro Max 256GB :  6 máy                  |
| 2. Đống Đa  : [==================]     45.2 tr   | 2. MacBook Air M2 16GB     :  3 máy                  |
| 3. Hà Đông  : [============]           22.1 tr   | 3. Samsung Galaxy S24 Ultra:  2 máy                  |
+---------------------------------------------------+------------------------------------------------------+
| DANH SÁCH THIẾT BỊ CẢNH BÁO TỒN KHO LÂU NGÀY (AGING STOCK ALERT)                                         |
+------------------+---------------------+--------------+------------+--------------+----------------------+
| Mã IMEI          | Dòng sản phẩm       | Chi nhánh    | Ngày nhập  | Tuổi tồn kho | Đề xuất hành động    |
+------------------+---------------------+--------------+------------+--------------+----------------------+
| 352918220194812  | iPhone 14 128GB Đỏ  | Hà Đông      | 05/08/2026 | 93 ngày [ĐỎ] | [Giảm giá 10% xả kho]|
| 354817290192831  | iPad Air 5 64GB     | Đống Đa      | 20/08/2026 | 78 ngày [ĐỎ] | [Chuyển về Cầu Giấy] |
| 862918201928391  | Vivo V29e 256GB     | Cầu Giấy     | 12/09/2026 | 55 ngày [VÀNG| [Tặng kèm combo sạc] |
+------------------+---------------------+--------------+------------+--------------+----------------------+
"""
    add_code_block(doc, dashboard_mockup, "Bản mẫu giao diện: Dashboard Báo cáo Doanh thu & Cảnh báo hàng tồn lâu")

    add_callout(doc, 
        "Hệ thống bản mẫu giao diện (UI Wireframes) được tối ưu hóa đặc thù cho ngành thiết bị công nghệ: "
        "Màn hình POS tập trung thao tác phím tắt và quét mã; Popup VietQR động giảm tải hoàn toàn lỗi nhập sai tiền; "
        "Bảng cảnh báo Aging Stock giúp Ban giám đốc chủ động luân chuyển hoặc xả hàng kịp thời trước khi máy rớt giá.",
        "KẾT LUẬN THIẾT KẾ GIAO DIỆN"
    )
