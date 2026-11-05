"""
Module for Chapter 4: Phân tích (Analysis).
Includes Architectural Analysis (BCE Pattern, Domain Model), Use Case Realizations (Analysis Sequence Diagrams), and Analysis Mechanisms.
"""
from docx.shared import Inches, Pt, RGBColor
from doc_builder import (
    add_heading_1, add_heading_2, add_heading_3,
    add_p, add_bullet, add_callout, add_code_block, create_styled_table,
    COLOR_PRIMARY, COLOR_SECONDARY, COLOR_TEXT, COLOR_MUTED
)

def build_chapter_4(doc):
    add_heading_1(doc, "4. PHÂN TÍCH (ANALYSIS)")
    
    add_heading_2(doc, "4.1. Phân tích kiến trúc")
    
    add_heading_3(doc, "4.1.1. Kiến trúc hệ thống mức phân tích (Mô hình BCE)")
    add_p(doc, 
        "Trong giai đoạn phân tích hướng đối tượng (OOA), hệ thống SmartTech Store áp dụng mẫu kiến trúc chuẩn "
        "Boundary - Control - Entity (BCE) theo phương pháp luận RUP. Mẫu kiến trúc này giúp phân tách rạch ròi "
        "giữa biểu diễn giao diện người dùng, logic xử lý nghiệp vụ điều khiển và cấu trúc dữ liệu miền bài toán:"
    )
    add_bullet(doc, "Đại diện cho các điểm tiếp xúc giữa tác nhân (người dùng, hệ thống ngoài) với hệ thống. Bao gồm: Màn hình bán hàng POS, Màn hình kho, Cổng tra cứu bảo hành Web Portal và Giao diện tích hợp VietQR Gateway.", "Lớp Biên (Boundary Classes): ")
    add_bullet(doc, "Đóng gói các quy tắc nghiệp vụ, điều phối luồng thực thi và các thuật toán thông minh (tính tiền, gợi ý combo phụ kiện, tính ngày tồn kho, sinh mã VietQR).", "Lớp Điều khiển (Control Classes): ")
    add_bullet(doc, "Mô hình hóa các thực thể dữ liệu nghiệp vụ có tính bền vững, lưu trữ thông tin thực tế trong thế giới thực như Chi nhánh, Nhân viên, Sản phẩm, Thiết bị IMEI, Hóa đơn, Bảo hành điện tử.", "Lớp Thực thể (Entity Classes): ")

    add_heading_3(doc, "4.1.2. Mô hình miền (Domain Model / Conceptual Class Diagram)")
    add_p(doc, 
        "Mô hình miền phản ánh chính xác cấu trúc nghiệp vụ bán lẻ công nghệ, trong đó điểm đặc trưng là "
        "sự phân tách rạch ròi giữa khái niệm Sản phẩm (Model chung) với Thiết bị IMEI (Từng cá thể máy vật lý duy nhất), "
        "cùng bảng quan hệ phụ kiện tương thích để phục vụ cơ chế gợi ý thông minh:"
    )
    
    domain_puml = """
@startuml
skinparam backgroundColor #FFFFFF
skinparam classAttributeIconSize 0
skinparam classFontStyle bold

class ChiNhanh {
    - maChiNhanh: String
    - tenChiNhanh: String
    - diaChi: String
    - soDienThoai: String
}

class NhanVien {
    - maNhanVien: String
    - hoTen: String
    - soDienThoai: String
    - chucVu: String
    - matKhau: String
}

class KhachHang {
    - maKhachHang: String
    - soDienThoai: String
    - hoTen: String
    - diemTichLuy: Integer
    - hangThanhVien: String
}

abstract class SanPham {
    - maSanPham: String
    - tenSanPham: String
    - thuongHieu: String
    - loaiSanPham: String
    - giaNiemYet: Double
    - thoiGianBaoHanhThang: Integer
}

class DienThoaiLaptop {
    - mauSac: String
    - dungLuongBoNho: String
    - cauHinhChipRam: String
}

class PhuKien {
    - maSKU: String
    - loaiPhuKien: String
    - congSuatKetNoi: String
}

class ThietBiIMEI {
    - maIMEI: String
    - soSerial: String
    - trangThai: String
    - ngayNhapKho: Date
    - giaNhap: Double
}

class TonKhoPhuKien {
    - soLuongTon: Integer
    - mucTonAnToan: Integer
}

class PhuKienTuongThich {
    - maSanPhamChinh: String
    - maPhuKien: String
    - mucDoUuTien: Integer
    - phanTramGiamGiaCombo: Double
}

class HoaDon {
    - maHoaDon: String
    - ngayLap: DateTime
    - tongTienHang: Double
    - tienGiamGia: Double
    - tongThanhToan: Double
    - phuongThucThanhToan: String
    - trangThaiDon: String
    - maGiaoDichVietQR: String
}

class ChiTietHoaDon {
    - soLuong: Integer
    - donGiaBan: Double
    - tienGiamGia: Double
    - thanhTien: Double
}

class BaoHanhDienTu {
    - maBaoHanh: String
    - ngayKichHoat: Date
    - ngayHetHan: Date
    - trangThaiBaoHanh: String
}

class PhieuDieuChuyen {
    - maPhieuChuyen: String
    - ngayTao: DateTime
    - trangThaiChuyen: String
    - ghiChu: String
}

' Inheritance
SanPham <|-- DienThoaiLaptop
SanPham <|-- PhuKien

' Associations
ChiNhanh "1" -- "0..*" NhanVien : làm việc tại >
ChiNhanh "1" -- "0..*" ThietBiIMEI : lưu trữ tại kho >
ChiNhanh "1" -- "0..*" TonKhoPhuKien : quản lý tồn >
PhuKien "1" -- "0..*" TonKhoPhuKien : có tồn kho >

DienThoaiLaptop "1" -- "0..*" ThietBiIMEI : có các cá thể máy >
DienThoaiLaptop "1" -- "0..*" PhuKienTuongThich : xác lập quy tắc >
PhuKien "1" -- "0..*" PhuKienTuongThich : là phụ kiện gợi ý >

NhanVien "1" -- "0..*" HoaDon : lập >
KhachHang "0..1" -- "0..*" HoaDon : mua >
ChiNhanh "1" -- "0..*" HoaDon : phát sinh tại >

HoaDon "1" *-- "1..*" ChiTietHoaDon : bao gồm >
ChiTietHoaDon "0..1" -- "0..1" ThietBiIMEI : gán thiết bị bán >
ChiTietHoaDon "0..1" -- "0..1" PhuKien : gán phụ kiện bán >

ThietBiIMEI "1" -- "0..1" BaoHanhDienTu : kích hoạt >
HoaDon "1" -- "0..*" BaoHanhDienTu : tạo >

ChiNhanh "1" -- "0..*" PhieuDieuChuyen : kho xuất >
ChiNhanh "1" -- "0..*" PhieuDieuChuyen : kho nhập >
PhieuDieuChuyen "1" -- "1..*" ThietBiIMEI : điều chuyển >

@enduml
"""
    add_code_block(doc, domain_puml, "Mô hình miền (Domain Model / Conceptual Class Diagram)")

    add_p(doc, "Mô tả chi tiết các thực thể cốt lõi trong mô hình miền:")
    add_bullet(doc, "Mô hình hóa dòng sản phẩm tổng quát. Phân lớp thành 2 nhóm: DienThoaiLaptop (quản lý theo từng mã IMEI) và PhuKien (quản lý tồn kho theo số lượng SKU).", "Thực thể SanPham (Sản phẩm): ")
    add_bullet(doc, "Đại diện cho từng chiếc điện thoại/laptop vật lý duy nhất. Thuộc tính quan trọng nhất là mã IMEI (15 số), ngày nhập kho (dùng tính tuổi tồn kho Aging Stock), và trạng thái máy (Sẵn sàng bán, Đang luân chuyển, Đã bán, Bảo hành).", "Thực thể ThietBiIMEI: ")
    add_bullet(doc, "Bảng tri thức cấu hình sẵn quy tắc bán kèm. Ví dụ: Dòng iPhone 15 Pro Max được liên kết với Củ sạc Apple 20W, Ốp MagSafe, Kính JCPAL với mức chiết khấu Combo 15%.", "Thực thể PhuKienTuongThich: ")
    add_bullet(doc, "Lưu trữ thông tin giao dịch, tổng tiền, phương thức (VietQR / Tiền mặt) và mã tham chiếu giao dịch ngân hàng.", "Thực thể HoaDon: ")
    add_bullet(doc, "Gắn chặt với mã IMEI và SĐT khách hàng, lưu trữ ngày kích hoạt và ngày hết hạn bảo hành, đảm bảo khách không cần giữ hóa đơn giấy.", "Thực thể BaoHanhDienTu: ")

    add_heading_2(doc, "4.2. Phân tích ca sử dụng (Use Case Analysis)")
    
    add_heading_3(doc, "4.2.1. Hiện thực hóa ca sử dụng: Bán hàng tại quầy & Thanh toán VietQR động")
    add_p(doc, 
        "Biểu đồ tuần tự phân tích (Analysis Sequence Diagram) áp dụng mẫu BCE mô tả sự tương tác "
        "giữa Thu ngân, Lớp biên giao diện POS, Lớp điều khiển đơn hàng, Động cơ gợi ý, và các Lớp thực thể dữ liệu:"
    )
    
    seq_sale_puml = """
@startuml
skinparam backgroundColor #FFFFFF
actor "Thu ngân" as Cashier
boundary "frmPOSCheckout" as POSView
control "OrderController" as OrderCtrl
control "RecommendationEngine" as RecEngine
entity "ThietBiIMEI" as IMEIEnt
entity "PhuKienTuongThich" as RuleEnt
entity "HoaDon" as InvoiceEnt
entity "BaoHanhDienTu" as WarrantyEnt
boundary "VietQRGateway" as QRView

Cashier -> POSView : Quét mã IMEI thiết bị
POSView -> OrderCtrl : processScanIMEI(maIMEI)
OrderCtrl -> IMEIEnt : findByIMEI(maIMEI)
IMEIEnt --> OrderCtrl : thietBiInfo (Model, TrangThai)

alt TrangThai == 'SanSangBan'
    OrderCtrl -> IMEIEnt : setTrangThai('KhoaTamThoi')
    OrderCtrl -> RecEngine : getCompatibleAccessories(modelId)
    RecEngine -> RuleEnt : queryRules(modelId)
    RuleEnt --> RecEngine : listAccessoriesWithDiscount
    RecEngine --> OrderCtrl : listGoiY
    OrderCtrl --> POSView : displayCartItem & showRecommendations(listGoiY)
    
    opt Khách đồng ý mua phụ kiện combo
        Cashier -> POSView : Chọn phụ kiện gợi ý (SKU)
        POSView -> OrderCtrl : addAccessory(maSKU)
        OrderCtrl --> POSView : recalculateTotalWithComboDiscount()
    end
    
    Cashier -> POSView : Chọn thanh toán 'VietQR'
    POSView -> OrderCtrl : requestDynamicVietQR(orderTotal)
    OrderCtrl -> QRView : generateVietQRPayload(bin, stk, amount, orderId)
    QRView --> POSView : displayQRCodeImage(qrData)
    
    Cashier -> POSView : Xác nhận khách đã chuyển tiền
    POSView -> OrderCtrl : finalizePayment()
    OrderCtrl -> InvoiceEnt : createInvoice(paidStatus=True)
    OrderCtrl -> IMEIEnt : setTrangThai('DaBan')
    OrderCtrl -> WarrantyEnt : activateEWarranty(maIMEI, phone, 12_months)
    OrderCtrl --> POSView : printReceipt() & showSuccess()
else IMEI không sẵn sàng
    OrderCtrl --> POSView : showError("Máy không hợp lệ hoặc đã bán!")
end
@enduml
"""
    add_code_block(doc, seq_sale_puml, "Biểu đồ tuần tự pha phân tích: Bán hàng, Gợi ý phụ kiện & Thanh toán VietQR (BCE)")

    add_heading_3(doc, "4.2.2. Hiện thực hóa ca sử dụng: Điều chuyển thiết bị giữa hai chi nhánh")
    add_p(doc, "Biểu đồ tuần tự phân tích mô tả luồng điều chuyển thiết bị giữa Cửa hàng yêu cầu và Cửa hàng chuyển:")
    
    seq_trans_puml = """
@startuml
skinparam backgroundColor #FFFFFF
actor "Nhân viên yêu cầu" as Requester
boundary "frmTransferRequest" as TransView
control "TransferController" as TransCtrl
entity "ThietBiIMEI" as IMEIEnt
entity "PhieuDieuChuyen" as TransEnt
actor "Quản lý duyệt" as Approver

Requester -> TransView : Tra cứu tồn kho chuỗi(modelId)
TransView -> TransCtrl : searchCrossStoreInventory(modelId)
TransCtrl -> IMEIEnt : findAvailableByModelGroupBranch()
IMEIEnt --> TransCtrl : listAvailableBranches
TransCtrl --> TransView : displayBranchStockList()

Requester -> TransView : Chọn Chi nhánh B & Bấm 'Tạo yêu cầu chuyển'
TransView -> TransCtrl : submitTransferRequest(fromBranchB, toBranchA, modelId)
TransCtrl -> TransEnt : createTicket(status='Pending')
TransCtrl --> TransView : notifySuccess()

Approver -> TransView : Xem danh sách yêu cầu & Duyệt
TransView -> TransCtrl : approveTransfer(ticketId, maIMEIXuat)
TransCtrl -> IMEIEnt : lockAndSetStatus(maIMEI, 'DangLuanChuyen')
TransCtrl -> TransEnt : updateStatus('InTransit')
TransCtrl --> TransView : printTransferBill()
@enduml
"""
    add_code_block(doc, seq_trans_puml, "Biểu đồ tuần tự pha phân tích: Điều chuyển thiết bị giữa các chi nhánh (BCE)")

    add_heading_3(doc, "4.2.3. Hiện thực hóa ca sử dụng: Cảnh báo hàng tồn lâu ngày (Aging Stock)")
    add_p(doc, "Biểu đồ tuần tự phân tích mô tả cơ chế quét định kỳ và cảnh báo thiết bị tồn kho quá hạn:")
    
    seq_aging_puml = """
@startuml
skinparam backgroundColor #FFFFFF
actor "Hệ thống tự động / Cron" as Scheduler
control "StockAgingController" as AgingCtrl
entity "ThietBiIMEI" as IMEIEnt
entity "ChiNhanh" as BranchEnt
boundary "AdminDashboardView" as DashboardView
actor "Quản trị viên" as Admin

Scheduler -> AgingCtrl : runDailyStockAgingCheck()
AgingCtrl -> IMEIEnt : findActiveDevicesInStock()
loop Duyệt từng máy đang ở kho
    AgingCtrl -> AgingCtrl : daysInStock = today - ngayNhapKho
    alt daysInStock >= 60 ngày
        AgingCtrl -> AgingCtrl : markLevel('RED_ALERT_60')
    else daysInStock >= 45 ngày
        AgingCtrl -> AgingCtrl : markLevel('YELLOW_ALERT_45')
    end
end
AgingCtrl --> DashboardView : pushAgingSummaryStats()

Admin -> DashboardView : Xem báo cáo hàng tồn lâu
DashboardView --> Admin : Hiển thị danh sách thiết bị cảnh báo đỏ
Admin -> DashboardView : Bấm 'Áp dụng đề xuất giảm giá xả hàng 10%'
DashboardView -> AgingCtrl : applyClearanceDiscount(listIMEI, 0.10)
AgingCtrl -> IMEIEnt : updateDiscountPrice()
AgingCtrl --> DashboardView : showUpdateSuccess()
@enduml
"""
    add_code_block(doc, seq_aging_puml, "Biểu đồ tuần tự pha phân tích: Cảnh báo hàng tồn lâu ngày (Aging Stock)")

    add_heading_2(doc, "4.3. Các cơ chế phân tích (Analysis Mechanisms)")
    add_p(doc, 
        "Trong pha phân tích, các yêu cầu kỹ thuật trừu tượng được gom nhóm thành các Cơ chế phân tích (Analysis Mechanisms). "
        "Bảng dưới đây mô tả chi tiết các cơ chế này cùng các đặc tính định lượng:"
    )
    
    mech_headers = ["Cơ chế phân tích", "Mô tả nghiệp vụ cần giải quyết", "Các đặc tính kỹ thuật cần đáp ứng"]
    mech_data = [
        [
            "Nhận thực & Phân quyền (Security / Auth)",
            "Xác định danh tính nhân viên đăng nhập tại từng chi nhánh và giới hạn quyền hạn truy cập chức năng.",
            "Phân quyền dựa trên vai trò (RBAC): Thu ngân, Thủ kho, Quản lý chi nhánh, Quản trị viên chuỗi. Khóa tài khoản sau 5 lần gõ sai."
        ],
        [
            "Lưu trữ bền vững (Persistence)",
            "Lưu trữ toàn bộ danh mục sản phẩm, dải mã IMEI, tồn kho phụ kiện, lịch sử hóa đơn và bảo hành điện tử.",
            "Cơ sở dữ liệu quan hệ tuân thủ tính chất ACID (Atomicity, Consistency, Isolation, Durability), chuẩn hóa 3NF."
        ],
        [
            "Khóa tương tranh (Concurrency Control)",
            "Ngăn chặn triệt để hiện tượng 2 thu ngân tại 2 quầy hoặc 2 chi nhánh khác nhau cùng chọn bán hoặc chuyển 1 chiếc máy IMEI.",
            "Cơ chế Khóa bi quan mềm (Pessimistic Soft-Locking) trên bản ghi IMEI trong bộ nhớ đệm với thời gian hết hạn (TTL 10 phút)."
        ],
        [
            "Tích hợp thanh toán ngoài (External Payment)",
            "Sinh mã QR động chứa số tài khoản, số tiền và mã hóa đơn theo chuẩn quốc gia VietQR để khách hàng quét trả tiền.",
            "Tạo chuỗi dữ liệu theo định dạng Tag-Length-Value (TLV) chuẩn EMVCo Napas; xử lý trong thời gian dưới 500ms."
        ],
        [
            "Gợi ý bán kèm thông minh (Smart Recommendation)",
            "Tự động truy xuất danh mục phụ kiện phù hợp về mặt vật lý và công suất với thiết bị chính đang được quét.",
            "Truy vấn bảng quy tắc tương thích kết hợp mức giảm giá combo; thời gian suy luận và hiển thị < 200ms."
        ],
        [
            "Lập lịch tác vụ nền (Task Scheduling)",
            "Tự động tính toán số ngày tồn kho của tất cả các máy trong chuỗi và phát sinh cảnh báo hàng ế định kỳ.",
            "Tiến trình chạy ngầm không gây nghẽn hiệu năng CSDL vào giờ bán hàng cao điểm; tự động thực thi lúc 00:00 hàng ngày."
        ]
    ]
    create_styled_table(doc, mech_headers, mech_data, [1.5, 2.5, 2.5], "Bảng đặc tả các cơ chế phân tích của hệ thống")
