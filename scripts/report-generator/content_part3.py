"""
Module for Chapter 3: Xác định yêu cầu (Requirements Determination).
Includes Business Processes (with Activity Diagrams), Use Case Models (Diagrams & Standard Specs), and Supplementary Specs.
"""
from docx.shared import Inches, Pt, RGBColor
from doc_builder import (
    add_heading_1, add_heading_2, add_heading_3,
    add_p, add_bullet, add_callout, add_code_block, create_styled_table,
    add_use_case_spec_table
)

def build_chapter_3(doc):
    add_heading_1(doc, "3. XÁC ĐỊNH YÊU CẦU")
    
    add_heading_2(doc, "3.1. Các quy trình nghiệp vụ (Business Processes)")
    add_p(doc, 
        "Hệ thống SmartTech Store vận hành dựa trên 5 quy trình nghiệp vụ cốt lõi phản ánh chính xác đặc thù "
        "của chuỗi bán lẻ thiết bị công nghệ hiện đại. Dưới đây là mô tả chi tiết bằng văn bản và mô hình hóa bằng biểu đồ hoạt động UML (Activity Diagrams):"
    )
    
    # ----------------------------------------------------
    # Quy trình 1
    # ----------------------------------------------------
    add_heading_3(doc, "3.1.1. Quy trình Bán hàng tại quầy (Smart POS Checkout) & Thanh toán QR động")
    add_p(doc, 
        "Mô tả quy trình nghiệp vụ dưới dạng văn bản:\n"
        "1. Khách hàng lựa chọn dòng máy muốn mua (ví dụ: iPhone 15 Pro Max 256GB Titan Tự nhiên).\n"
        "2. Thu ngân lấy máy từ tủ trưng bày/kho và dùng máy quét mã 2D quét số IMEI trên vỏ hộp.\n"
        "3. Hệ thống kiểm tra hợp lệ của mã IMEI: xác thực máy đang ở trạng thái 'Sẵn sàng bán' tại chính chi nhánh đó.\n"
        "4. Động cơ thông minh (Smart Recommendation Engine) tự động phân tích model máy và đẩy danh sách 'Phụ kiện tương thích' "
        "lên màn hình POS (Củ sạc 20W chính hãng, Kính cường lực đúng model máy, Ốp lưng chống sốc, Gói bảo hành rơi vỡ VIP).\n"
        "5. Thu ngân tư vấn, nếu khách đồng ý mua kèm, thu ngân quét mã vạch SKU của phụ kiện. Hệ thống tự động tính giá ưu đãi combo.\n"
        "6. Thu ngân nhập Số điện thoại của khách hàng để tra cứu hoặc tạo mới hồ sơ thành viên (áp dụng điểm thưởng nếu có).\n"
        "7. Khách chọn hình thức 'Thanh toán chuyển khoản'. Hệ thống tự động phát sinh mã VietQR động chứa chính xác số tiền cần thanh toán và mã hóa đơn.\n"
        "8. Khách hàng mở ứng dụng ngân hàng quét mã và xác nhận chuyển khoản. Hệ thống nhận thông báo thanh toán thành công (hoặc thu ngân xác nhận).\n"
        "9. Hệ thống tự động: In hóa đơn nhiệt K80, chuyển trạng thái IMEI sang 'Đã bán', trừ số lượng tồn kho phụ kiện, "
        "và tự động kích hoạt Bản ghi Bảo hành điện tử gắn liền với IMEI và SĐT khách hàng."
    )
    
    act1_puml = """
@startuml
skinparam backgroundColor #FFFFFF
|#EFF6FF|Thu ngân (Cashier)|
|#F0FDF4|Hệ thống Smart POS|
|#FEFCE8|Cổng VietQR / Ngân hàng|
|#FFF7ED|Khách hàng (Customer)|

|Thu ngân (Cashier)|
start
:Lấy máy & quét mã IMEI trên vỏ hộp;

|Hệ thống Smart POS|
:Kiểm tra trạng thái IMEI trong kho chi nhánh;
if (Hợp lệ & Sẵn sàng bán?) then (Hợp lệ)
    :Khóa mềm IMEI trong giỏ hàng;
    :Kích hoạt Smart Recommendation Engine;
    :Lọc danh sách phụ kiện tương thích theo model máy;
    :Hiển thị danh sách gợi ý kèm ưu đãi Combo lên màn hình;
else (Không hợp lệ)
    :Báo lỗi (Máy đã bán hoặc không thuộc kho);
    stop
endif

|Thu ngân (Cashier)|
:Tư vấn phụ kiện cho khách;
if (Khách chọn mua kèm phụ kiện?) then (Có)
    :Quét mã SKU phụ kiện;
    |Hệ thống Smart POS|
    :Tự động áp dụng giá chiết khấu combo;
else (Không)
endif

|Thu ngân (Cashier)|
:Nhập SĐT khách hàng;
|Hệ thống Smart POS|
:Tra cứu lịch sử & tính điểm tích lũy;
:Hiển thị tổng số tiền thanh toán;

|Thu ngân (Cashier)|
:Chọn phương thức 'Thanh toán VietQR';

|Hệ thống Smart POS|
:Gọi thuật toán sinh payload VietQR (chuẩn EMVCo);
:Tạo chuỗi dữ liệu (BIN + STK + Số tiền + Mã đơn);
:Hiển thị mã Dynamic VietQR trên màn hình phụ;

|Khách hàng (Customer)|
:Mở Mobile Banking quét mã VietQR;
:Kiểm tra thông tin (Số tiền & Tên cửa hàng tự điền);
:Xác nhận chuyển tiền trên điện thoại;

|Cổng VietQR / Ngân hàng|
:Xử lý giao dịch liên ngân hàng;
:Gửi tín hiệu xác nhận thanh toán thành công;

|Hệ thống Smart POS|
:Ghi nhận đơn hàng thành công;
:Cập nhật trạng thái IMEI: 'Đã bán';
:Trừ tồn kho phụ kiện;
:Tự động kích hoạt Bảo hành điện tử (E-Warranty);
:Lệnh in hóa đơn nhiệt K80;

|Thu ngân (Cashier)|
:Bàn giao máy, phụ kiện và hóa đơn cho khách;
stop
@enduml
"""
    add_code_block(doc, act1_puml, "Biểu đồ hoạt động UML: Bán hàng tại quầy & Thanh toán VietQR động")

    # ----------------------------------------------------
    # Quy trình 2
    # ----------------------------------------------------
    add_heading_3(doc, "3.1.2. Quy trình Tra cứu tồn kho chuỗi & Điều chuyển nội bộ (Inter-branch Transfer)")
    add_p(doc, 
        "Mô tả quy trình nghiệp vụ dưới dạng văn bản:\n"
        "1. Khách hàng tại Cửa hàng A yêu cầu mua một sản phẩm cụ thể (ví dụ: MacBook Air M2 16GB Midnight), nhưng Cửa hàng A đã hết hàng.\n"
        "2. Nhân viên Cửa hàng A mở chức năng 'Tra cứu tồn kho chuỗi'. Hệ thống hiển thị số lượng máy sẵn sàng bán tại từng chi nhánh cùng khoảng cách địa lý.\n"
        "3. Nhân viên Cửa hàng A thấy Cửa hàng B còn 2 máy, lập 'Phiếu yêu cầu điều chuyển máy'.\n"
        "4. Hệ thống thông báo tức thời đến màn hình làm việc của Quản lý Cửa hàng B.\n"
        "5. Quản lý Cửa hàng B duyệt yêu cầu. Thủ kho Cửa hàng B lấy máy, quét xác nhận mã IMEI xuất kho.\n"
        "6. Trạng thái máy được hệ thống chuyển thành 'Đang luân chuyển' (không ai ở cửa hàng khác có thể bán chiếc máy này).\n"
        "7. Nhân viên vận chuyển giao máy tới Cửa hàng A. Thủ kho Cửa hàng A kiểm tra ngoại quan, quét mã IMEI để xác nhận nhập kho.\n"
        "8. Trạng thái máy chuyển thành 'Sẵn sàng bán' tại Cửa hàng A, sẵn sàng giao cho khách."
    )
    
    act2_puml = """
@startuml
skinparam backgroundColor #FFFFFF
|#EFF6FF|Cửa hàng yêu cầu (A)|
|#F0FDF4|Hệ thống SmartTech|
|#FEFCE8|Cửa hàng chuyển (B)|

|Cửa hàng yêu cầu (A)|
start
:Tra cứu tồn kho sản phẩm trên toàn chuỗi;

|Hệ thống SmartTech|
:Truy vấn CSDL tập trung;
:Trả về danh sách các chi nhánh còn máy sẵn bán;

|Cửa hàng yêu cầu (A)|
:Chọn Cửa hàng B & Lập 'Phiếu yêu cầu điều chuyển';

|Hệ thống SmartTech|
:Gửi thông báo chờ duyệt tới Cửa hàng B;

|Cửa hàng chuyển (B)|
:Quản lý Cửa hàng B kiểm tra và Phê duyệt;
:Thủ kho B lấy máy trong tủ và quét mã IMEI xuất;

|Hệ thống SmartTech|
:Khóa máy và đổi trạng thái IMEI: 'Đang luân chuyển';
:In biên bản bàn giao vận chuyển;

|Cửa hàng chuyển (B)|
:Bàn giao máy cho nhân viên giao hàng;

|Cửa hàng yêu cầu (A)|
:Nhận gói hàng vật lý;
:Thủ kho A mở hộp, kiểm tra máy và quét mã IMEI nhập;

|Hệ thống SmartTech|
:Xác thực mã IMEI khớp với Phiếu điều chuyển;
:Đổi chi nhánh sở hữu máy thành Cửa hàng A;
:Cập nhật trạng thái IMEI: 'Sẵn sàng bán';
:Ghi nhận hoàn tất phiếu điều chuyển;

|Cửa hàng yêu cầu (A)|
:Thông báo cho khách hàng tới nhận máy;
stop
@enduml
"""
    add_code_block(doc, act2_puml, "Biểu đồ hoạt động UML: Tra cứu tồn kho chuỗi và Điều chuyển hàng nội bộ")

    # ----------------------------------------------------
    # Quy trình 3, 4, 5
    # ----------------------------------------------------
    add_heading_3(doc, "3.1.3. Quy trình Nhập kho quản lý theo dải IMEI và Phụ kiện theo số lượng")
    add_p(doc, 
        "Hệ thống phân biệt rõ ràng 2 luồng nhập kho:\n"
        "- Đối với Thiết bị giá trị cao (Điện thoại, Laptop): Thủ kho mở đơn đặt hàng NCC, dán danh sách hoặc dùng máy quét "
        "quét lần lượt từng mã IMEI. Hệ thống tự động kiểm tra tính hợp lệ (độ dài 15 chữ số của IMEI, kiểm tra trùng lặp trên toàn hệ thống). "
        "Mỗi mã IMEI được tạo thành một bản ghi riêng biệt với trạng thái ban đầu là 'Sẵn sàng bán'.\n"
        "- Đối với Phụ kiện (Ốp lưng, cáp sạc, dán màn hình): Thủ kho quét mã vạch SKU và nhập số lượng thực tế nhận được. "
        "Hệ thống tự động cộng dồn vào bảng tồn kho phụ kiện của chi nhánh tương ứng."
    )
    
    add_heading_3(doc, "3.1.4. Quy trình Tiếp nhận và Tra cứu bảo hành điện tử (E-Warranty)")
    add_p(doc, 
        "Khi khách hàng đem máy đến yêu cầu bảo hành hoặc sửa chữa:\n"
        "1. Kỹ thuật viên tiếp nhận máy, quét mã IMEI trên khay sim/thân máy hoặc nhập SĐT khách hàng.\n"
        "2. Hệ thống truy vấn tức thời và hiển thị: Ngày mua, chi nhánh bán, thời hạn bảo hành chính hãng còn lại, "
        "gói bảo hành mở rộng (nếu có), và lịch sử các lần tiếp nhận dịch vụ trước đây.\n"
        "3. Nếu còn hạn bảo hành, kỹ thuật viên lập 'Phiếu tiếp nhận dịch vụ', ghi nhận tình trạng lỗi và in biên nhận cho khách.\n"
        "4. Trạng thái máy được cập nhật thành 'Đang bảo hành' trong cơ sở dữ liệu."
    )
    
    add_heading_3(doc, "3.1.5. Quy trình Thẩm định & Định giá Thu cũ đổi mới (Trade-in)")
    add_p(doc, 
        "Nhằm kích cầu khách hàng nâng cấp lên máy mới, hệ thống tích hợp công cụ định giá thu cũ nhanh:\n"
        "1. Thu ngân chọn model máy cũ của khách trong danh mục hỗ trợ thu cũ (ví dụ: iPhone 12 Pro 128GB).\n"
        "2. Thu ngân tích chọn bảng câu hỏi tình trạng vật lý (Màn hình nguyên bản? Pin > 80%? Viền không cấn móp? Khóa iCloud đã thoát?).\n"
        "3. Hệ thống tự động tính ra 'Số tiền trợ giá thu cũ' dựa trên bảng công thức khấu hao đã cấu hình trước.\n"
        "4. Số tiền này được tự động đưa vào mục 'Khấu trừ thu cũ' trong đơn hàng mua máy mới của khách."
    )

    add_heading_2(doc, "3.2. Các mô hình ca sử dụng (Use Case Models)")
    
    add_heading_3(doc, "3.2.1. Biểu đồ ca sử dụng mức tổng quát của hệ thống (General Use Case Diagram)")
    add_p(doc, 
        "Biểu đồ ca sử dụng tổng quát thể hiện các ranh giới chức năng của hệ thống và các tương tác của 4 tác nhân chính: "
        "Thu ngân / Nhân viên bán hàng, Thủ kho / Kỹ thuật viên, Quản lý chi nhánh, Quản trị viên chuỗi, cùng Tác nhân ngoài là Cổng VietQR Gateway."
    )
    
    uc_general_puml = """
@startuml
skinparam backgroundColor #FFFFFF
skinparam packageStyle rectangle
left to right direction

actor "Thu ngân / Bán hàng" as Cashier
actor "Thủ kho / Kỹ thuật" as Keeper
actor "Quản lý chi nhánh" as StoreManager
actor "Quản trị viên chuỗi" as Admin
actor "Cổng Napas / VietQR" as VietQRGateway <<Secondary System>>

rectangle "HỆ THỐNG BÁN HÀNG THÔNG MINH (SMARTTECH STORE)" {
    
    package "Phân hệ Bán hàng & Thu ngân (POS)" {
        usecase "UC01: Bán hàng tại quầy" as UC01
        usecase "UC01.1: Gợi ý phụ kiện tương thích" as UC01_1
        usecase "UC02: Thanh toán VietQR động" as UC02
        usecase "UC07: Định giá Thu cũ đổi mới" as UC07
    }
    
    package "Phân hệ Quản lý Kho & Thiết bị IMEI" {
        usecase "UC03: Tra cứu & Điều chuyển kho chuỗi" as UC03
        usecase "UC04: Nhập kho thiết bị (IMEI/SKU)" as UC04
        usecase "UC08: Kiểm kê tồn kho chi nhánh" as UC08
    }
    
    package "Phân hệ Khách hàng & Bảo hành điện tử" {
        usecase "UC05: Tra cứu & Kích hoạt bảo hành" as UC05
        usecase "UC09: Quản lý điểm thưởng hội viên" as UC09
    }
    
    package "Phân hệ Quản trị chuỗi & Báo cáo thông minh" {
        usecase "UC06: Cảnh báo hàng tồn lâu (Aging Stock)" as UC06
        usecase "UC10: Quản lý danh mục & Quy tắc gợi ý" as UC10
        usecase "UC11: Xem báo cáo doanh thu chuỗi" as UC11
    }
}

' Relations for Cashier
Cashier --> UC01
Cashier --> UC02
Cashier --> UC07
Cashier --> UC05

' Relations for Keeper
Keeper --> UC03
Keeper --> UC04
Keeper --> UC08
Keeper --> UC05

' Relations for Store Manager
StoreManager --> UC03
StoreManager --> UC11
StoreManager --> UC06

' Relations for Admin
Admin --> UC10
Admin --> UC11
Admin --> UC06

' Includes & Extends
UC01 ..> UC01_1 : <<include>>
UC01 ..> UC02 : <<include>>
UC01 ..> UC07 : <<extend>>
UC01 ..> UC05 : <<include>>
UC02 --> VietQRGateway : <<interact>>

@enduml
"""
    add_code_block(doc, uc_general_puml, "Biểu đồ Ca sử dụng mức tổng quát toàn hệ thống (General Use Case Diagram)")

    add_heading_3(doc, "3.2.2. Phân rã biểu đồ ca sử dụng theo phân hệ chi tiết")
    add_p(doc, "Hệ thống được phân rã thành 4 phân hệ chức năng chuyên biệt:")
    add_bullet(doc, "Bao gồm các ca sử dụng phục vụ tạo đơn, quét mã IMEI, chọn phụ kiện gợi ý, tính giá combo, sinh mã VietQR động và in hóa đơn.", "1. Phân hệ Bán hàng & Thu ngân (POS): ")
    add_bullet(doc, "Bao gồm các ca sử dụng nhập kho theo dải IMEI, nhập phụ kiện theo số lượng, tra cứu tồn kho chuỗi tức thời và thực hiện quy trình điều chuyển máy.", "2. Phân hệ Quản lý Kho & Thiết bị IMEI: ")
    add_bullet(doc, "Bao gồm các ca sử dụng tự động kích hoạt bảo hành, tra cứu thông tin bảo hành bằng SĐT/IMEI, tiếp nhận máy bảo hành và tích lũy điểm thưởng thành viên.", "3. Phân hệ Khách hàng & Bảo hành điện tử: ")
    add_bullet(doc, "Bao gồm thiết lập bảng quy tắc phụ kiện tương thích theo model máy, quét và phát cảnh báo hàng tồn lâu (Aging Stock) quá 60 ngày, và trực quan hóa doanh thu chuỗi.", "4. Phân hệ Quản trị chuỗi & Báo cáo thông minh: ")

    add_heading_3(doc, "3.2.3. Bảng đặc tả chi tiết từng ca sử dụng cốt lõi")
    add_p(doc, 
        "Dưới đây là bảng đặc tả chi tiết 6 ca sử dụng nòng cốt nhất của hệ thống, "
        "được trình bày đúng theo biểu mẫu chuẩn được yêu cầu trong đề cương đồ án:"
    )

    # Spec 1: UC01
    spec_uc01 = {
        "Use Case": "UC01: Bán hàng tại quầy và Gợi ý phụ kiện thông minh",
        "Actor": "Thu ngân / Nhân viên bán hàng (Cashier)",
        "Brief Description": "Cho phép thu ngân tạo đơn hàng bán lẻ tại quầy, quét mã IMEI của điện thoại/laptop, tiếp nhận danh sách phụ kiện tương thích được hệ thống tự động gợi ý, áp dụng ưu đãi combo và chuyển sang bước thanh toán.",
        "Pre-Conditions": "Thu ngân đã đăng nhập thành công vào hệ thống POS tại chi nhánh. Thiết bị (IMEI) và phụ kiện có sẵn trong kho với trạng thái 'Sẵn sàng bán'.",
        "Basic Flows": (
            "1. Thu ngân chọn chức năng 'Tạo đơn hàng mới' trên màn hình POS.\n"
            "2. Thu ngân dùng máy quét 2D quét mã IMEI trên hộp thiết bị điện thoại/laptop.\n"
            "3. Hệ thống kiểm tra hợp lệ của IMEI: xác nhận mã tồn tại, thuộc kho chi nhánh hiện tại và trạng thái là 'Sẵn sàng bán'.\n"
            "4. Hệ thống đưa thiết bị vào giỏ hàng và khóa mềm tạm thời IMEI đó (tránh nhân viên khác chọn trùng).\n"
            "5. Động cơ gợi ý (Recommendation Engine) phân tích model thiết bị và tự động tải danh sách 'Phụ kiện tương thích' lên bảng gợi ý (ví dụ: Củ sạc 20W, kính cường lực, ốp lưng chống sốc).\n"
            "6. Thu ngân tư vấn các phụ kiện gợi ý cho khách hàng. Nếu khách đồng ý mua, thu ngân bấm chọn hoặc quét mã SKU của phụ kiện.\n"
            "7. Hệ thống tự động áp dụng chính sách chiết khấu mua kèm Combo phụ kiện và tính lại tổng tiền giỏ hàng.\n"
            "8. Thu ngân nhập SĐT của khách để áp dụng quyền lợi hội viên và tích điểm.\n"
            "9. Thu ngân bấm nút 'Tiến hành thanh toán' (chuyển tiếp sang ca sử dụng UC02)."
        ),
        "Alternative Flows": (
            "- 3a. Mã IMEI không hợp lệ hoặc không thuộc chi nhánh: Hệ thống phát âm thanh cảnh báo lỗi và hiển thị lý do (Đã bán / Sai kho). Đơn hàng không tiếp nhận mã này.\n"
            "- 3b. Mã IMEI đang bị khóa bởi ca bán hàng khác: Hệ thống thông báo máy đang được xử lý ở quầy khác. Thu ngân lấy máy khác.\n"
            "- 6a. Khách hàng từ chối mua phụ kiện: Thu ngân bỏ qua bảng gợi ý và chuyển thẳng sang bước thanh toán thiết bị chính."
        ),
        "Post-Conditions": "Giỏ hàng được tạo thành công, thiết bị IMEI được khóa tạm thời, tổng giá trị đơn hàng được tính toán chính xác để chuyển sang thanh toán.",
        "Special Requirements": "Thời gian phân tích và hiển thị danh sách phụ kiện tương thích không được vượt quá 300ms kể từ khi quét mã IMEI."
    }
    add_use_case_spec_table(doc, spec_uc01)

    # Spec 2: UC02
    spec_uc02 = {
        "Use Case": "UC02: Thanh toán đơn hàng qua mã VietQR động",
        "Actor": "Thu ngân, Khách hàng, Cổng thanh toán VietQR / Napas",
        "Brief Description": "Hệ thống tự động sinh mã QR động chuẩn EMVCo chứa chính xác số tiền tổng hóa đơn và nội dung chuyển khoản để khách hàng quét thanh toán nhanh qua ứng dụng ngân hàng.",
        "Pre-Conditions": "Đơn hàng đã được chốt danh sách sản phẩm và tổng tiền thanh toán (từ UC01). Cửa hàng đã cấu hình thông tin tài khoản ngân hàng thụ hưởng.",
        "Basic Flows": (
            "1. Thu ngân chọn hình thức thanh toán 'Chuyển khoản QR Động'.\n"
            "2. Hệ thống tổng hợp các tham số: Mã ngân hàng (BIN), Số tài khoản cửa hàng, Số tiền cần thu (amount), Mã hóa đơn (orderId).\n"
            "3. Hệ thống tạo chuỗi dữ liệu chuẩn EMVCo (VietQR) và render thành ảnh mã QR trên màn hình phụ hướng về phía khách hàng.\n"
            "4. Khách hàng mở ứng dụng ngân hàng bất kỳ trên điện thoại và quét mã QR.\n"
            "5. Ứng dụng ngân hàng tự động điền đúng Số tài khoản, Tên chủ tài khoản, Số tiền chính xác và Nội dung CK (Mã đơn hàng).\n"
            "6. Khách hàng bấm xác nhận chuyển khoản trên điện thoại.\n"
            "7. Hệ thống POS nhận tín hiệu thông báo giao dịch thành công từ Ngân hàng (hoặc thu ngân đối soát tin nhắn báo có và bấm 'Xác nhận đã nhận tiền').\n"
            "8. Hệ thống đánh dấu đơn hàng 'Đã thanh toán', cập nhật trạng thái IMEI thành 'Đã bán', trừ tồn kho phụ kiện, tự động kích hoạt bảo hành điện tử (UC05) và in hóa đơn nhiệt."
        ),
        "Alternative Flows": (
            "- 6a. Khách hàng đổi ý muốn thanh toán bằng Tiền mặt: Thu ngân hủy màn hình QR, chọn 'Tiền mặt', nhập số tiền khách đưa, hệ thống tính tiền thối và hoàn tất đơn.\n"
            "- 7a. Quá 3 phút không nhận được tiền: Hệ thống cảnh báo giao dịch chờ quá lâu, cho phép thu ngân bấm 'Tạo lại mã QR' hoặc hủy giao dịch giải phóng khóa IMEI."
        ),
        "Post-Conditions": "Hóa đơn được lưu trữ với trạng thái Đã thanh toán, tiền về tài khoản cửa hàng, máy in bill in hóa đơn cho khách.",
        "Special Requirements": "Mã VietQR phải tương thích 100% với ứng dụng di động của hơn 40 ngân hàng thương mại tại Việt Nam."
    }
    add_use_case_spec_table(doc, spec_uc02)

    # Spec 3: UC03
    spec_uc03 = {
        "Use Case": "UC03: Tra cứu và Điều chuyển thiết bị giữa các chi nhánh",
        "Actor": "Nhân viên bán hàng (Cửa hàng yêu cầu), Quản lý chi nhánh (Cửa hàng chuyển), Thủ kho",
        "Brief Description": "Cho phép tra cứu tồn kho sản phẩm trên toàn bộ các chi nhánh của chuỗi theo thời gian thực và thực hiện quy trình điều chuyển máy từ chi nhánh còn hàng về chi nhánh có khách cần mua.",
        "Pre-Conditions": "Nhân viên đã đăng nhập hệ thống. Chi nhánh chuyển còn ít nhất 1 thiết bị ở trạng thái 'Sẵn sàng bán'.",
        "Basic Flows": (
            "1. Nhân viên mở giao diện 'Tra cứu kho chuỗi', nhập tên dòng máy hoặc cấu hình cần tìm.\n"
            "2. Hệ thống hiển thị danh sách các chi nhánh có sẵn máy, kèm số lượng và khoảng cách.\n"
            "3. Nhân viên chọn chi nhánh gần nhất và bấm 'Tạo yêu cầu điều chuyển', nhập lý do 'Chuyển hàng bán cho khách'.\n"
            "4. Hệ thống gửi thông báo tức thời đến tài khoản Quản lý của chi nhánh chuyển.\n"
            "5. Quản lý chi nhánh chuyển xem xét và bấm 'Phê duyệt điều chuyển'.\n"
            "6. Thủ kho chi nhánh chuyển lấy máy, quét mã IMEI để xác nhận đóng gói xuất kho.\n"
            "7. Hệ thống đổi trạng thái mã IMEI thành 'Đang luân chuyển' và in phiếu giao hàng nội bộ.\n"
            "8. Khi kiện hàng đến chi nhánh yêu cầu, thủ kho tại đây kiểm tra niêm phong và quét mã IMEI.\n"
            "9. Hệ thống kiểm tra khớp mã, chuyển quyền sở hữu máy về chi nhánh nhận và cập nhật trạng thái thành 'Sẵn sàng bán'."
        ),
        "Alternative Flows": (
            "- 5a. Quản lý chi nhánh chuyển từ chối (do máy đã có khách tại chỗ đặt cọc): Nhập lý do từ chối. Hệ thống thông báo lại cho chi nhánh yêu cầu để chọn chi nhánh khác.\n"
            "- 9a. Quét mã IMEI nhận không khớp với phiếu xuất: Hệ thống phát cảnh báo sai lệch hàng hóa và gửi thông báo khẩn cấp cho Quản lý cả hai chi nhánh để đối soát."
        ),
        "Post-Conditions": "Thiết bị được chuyển chi nhánh sở hữu thành công trong CSDL, trạng thái máy cập nhật chính xác, lịch sử luân chuyển được ghi nhật ký.",
        "Special Requirements": "Trong suốt thời gian luân chuyển, mã IMEI phải bị khóa, không được phép xuất hiện trong danh sách bán của bất kỳ chi nhánh nào."
    }
    add_use_case_spec_table(doc, spec_uc03)

    # Spec 4: UC04
    spec_uc04 = {
        "Use Case": "UC04: Nhập kho thiết bị theo dải mã IMEI",
        "Actor": "Thủ kho / Kỹ thuật viên (Store Keeper)",
        "Brief Description": "Tiếp nhận lô hàng thiết bị điện thoại, laptop mới từ nhà phân phối, quét hoặc nhập danh sách dải mã IMEI để ghi nhận vào hệ thống kho chi nhánh.",
        "Pre-Conditions": "Thủ kho đăng nhập tài khoản có quyền Quản lý kho. Lô hàng có chứng từ/hóa đơn nhập kho hợp lệ từ nhà cung cấp.",
        "Basic Flows": (
            "1. Thủ kho chọn chức năng 'Lập phiếu nhập kho thiết bị'.\n"
            "2. Chọn Nhà phân phối (ví dụ: Apple VN, Synnex FPT) và chọn Model sản phẩm tương ứng.\n"
            "3. Thủ kho dùng máy quét mã vạch quét liên tục dải mã IMEI trên từng vỏ hộp máy (hoặc dán danh sách IMEI từ file Excel của NCC).\n"
            "4. Hệ thống kiểm tra định dạng từng mã IMEI: đúng 15 chữ số, kiểm tra không bị trùng lặp với bất kỳ mã nào đã có trong CSDL.\n"
            "5. Hệ thống hiển thị số lượng máy đã quét hợp lệ và bảng danh sách chi tiết các mã.\n"
            "6. Thủ kho nhập giá nhập kho cho từng model và kiểm tra số lượng khớp với biên bản giao nhận.\n"
            "7. Thủ kho bấm nút 'Xác nhận nhập kho'.\n"
            "8. Hệ thống lưu phiếu nhập, tự động tạo các bản ghi mới trong bảng thiết bị với trạng thái 'Sẵn sàng bán' và gán với chi nhánh hiện tại."
        ),
        "Alternative Flows": (
            "- 4a. Phát hiện mã IMEI bị trùng lặp trong hệ thống: Hệ thống báo đỏ dòng mã đó, phát âm thanh cảnh báo và loại khỏi danh sách nhập.\n"
            "- 4b. Mã IMEI sai định dạng (thiếu số, chứa ký tự chữ): Hệ thống thông báo lỗi định dạng để thủ kho kiểm tra lại."
        ),
        "Post-Conditions": "Lô máy được ghi nhận thành công vào kho, các mã IMEI sẵn sàng được tìm kiếm và bán trên quầy POS.",
        "Special Requirements": "Hỗ trợ nhập nhanh 100 mã IMEI trong vòng dưới 2 giây bằng cơ chế Bulk Insert tối ưu CSDL."
    }
    add_use_case_spec_table(doc, spec_uc04)

    # Spec 5: UC05
    spec_uc05 = {
        "Use Case": "UC05: Kích hoạt và Tra cứu bảo hành điện tử (E-Warranty)",
        "Actor": "Thu ngân (Tự động kích hoạt), Kỹ thuật viên / Khách hàng (Tra cứu)",
        "Brief Description": "Tự động kích hoạt hồ sơ bảo hành điện tử khi bán máy và hỗ trợ tra cứu toàn bộ thông tin bảo hành, lịch sử mua hàng, sửa chữa thông qua mã IMEI hoặc SĐT.",
        "Pre-Conditions": "Thiết bị đã được bán thành công (từ UC02) hoặc khách hàng mang máy đến trung tâm dịch vụ.",
        "Basic Flows (Luồng Tra cứu)": (
            "1. Kỹ thuật viên (hoặc Khách hàng trên Web Portal) truy cập chức năng 'Tra cứu bảo hành'.\n"
            "2. Nhập mã IMEI của máy hoặc Số điện thoại mua hàng.\n"
            "3. Hệ thống kiểm tra trong bảng Bảo hành điện tử và hiển thị kết quả:\n"
            "   - Tên dòng máy, màu sắc, số IMEI/Serial.\n"
            "   - Ngày mua hàng và Chi nhánh mua hàng.\n"
            "   - Thời hạn bảo hành tiêu chuẩn (ví dụ: 12 tháng kể từ ngày bán).\n"
            "   - Trạng thái bảo hành: Còn hạn / Hết hạn.\n"
            "   - Lịch sử các lần bảo hành/sửa chữa trước đây (ngày tiếp nhận, lỗi, linh kiện thay thế).\n"
            "4. Nếu khách yêu cầu bảo hành, kỹ thuật viên bấm 'Tạo phiếu tiếp nhận bảo hành' và in biên nhận."
        ),
        "Alternative Flows": (
            "- 3a. Không tìm thấy mã IMEI trong hệ thống: Hệ thống thông báo 'Thiết bị không thuộc hệ thống SmartTech Store hoặc chưa được kích hoạt bán lẻ'.\n"
            "- 3b. Thiết bị đã hết thời hạn bảo hành: Hệ thống hiển thị thông báo hết hạn và gợi ý chuyển sang dịch vụ sửa chữa tính phí."
        ),
        "Post-Conditions": "Thông tin bảo hành được hiển thị minh bạch, hỗ trợ tạo phiếu tiếp nhận bảo hành nhanh chóng.",
        "Special Requirements": "Cổng tra cứu Web Portal cho khách hàng phải được mở công khai, tốc độ phản hồi kết quả < 200ms."
    }
    add_use_case_spec_table(doc, spec_uc05)

    # Spec 6: UC06
    spec_uc06 = {
        "Use Case": "UC06: Cảnh báo hàng tồn lâu ngày (Aging Stock) và Xem báo cáo doanh thu chuỗi",
        "Actor": "Quản trị viên chuỗi (Admin), Quản lý chi nhánh (Store Manager)",
        "Brief Description": "Tự động rà soát số ngày lưu kho của từng thiết bị IMEI, phát cảnh báo đối với các dòng máy tồn kho trên 60 ngày để đề xuất giảm giá xả hàng và cung cấp báo cáo doanh thu đa chi nhánh.",
        "Pre-Conditions": "Người dùng đăng nhập với quyền Quản lý hoặc Quản trị chuỗi.",
        "Basic Flows": (
            "1. Người dùng truy cập phân hệ 'Báo cáo & Phân tích thông minh'.\n"
            "2. Hệ thống tự động tính toán số ngày tồn kho = Ngày hiện tại - Ngày nhập kho của từng IMEI đang 'Sẵn sàng bán'.\n"
            "3. Hệ thống hiển thị danh mục 'Cảnh báo hàng tồn lâu' (Aging Stock List), phân loại màu sắc: Vàng (45-60 ngày), Đỏ (trên 60 ngày).\n"
            "4. Động cơ thông minh gợi ý hành động: 'Đề xuất xả hàng giảm giá 10%' hoặc 'Điều chuyển về chi nhánh có sức tiêu thụ cao hơn'.\n"
            "5. Người dùng xem bảng điều khiển (Dashboard) doanh thu: tổng doanh thu chuỗi, doanh thu theo từng chi nhánh, tỷ lệ đóng góp của phụ kiện combo, biểu đồ mặt hàng bán chạy nhất.\n"
            "6. Người dùng có thể lọc theo khoảng thời gian và xuất báo cáo ra định dạng Excel/PDF."
        ),
        "Alternative Flows": (
            "- 4a. Quản trị viên duyệt áp dụng mức giảm giá xả hàng: Hệ thống tự động cập nhật giá khuyến mãi mới cho các mã IMEI đó trên toàn hệ thống POS."
        ),
        "Post-Conditions": "Ban giám đốc nắm bắt chính xác dòng tiền, hạn chế tối đa rủi ro tồn kho công nghệ lỗi thời.",
        "Special Requirements": "Tiến trình quét tính toán ngày tồn kho chạy nền định kỳ mỗi ngày một lần vào lúc 00:00 đêm."
    }
    add_use_case_spec_table(doc, spec_uc06)

    add_heading_2(doc, "3.3. Các đặc tả bổ sung (Supplementary Specifications)")
    
    add_heading_3(doc, "3.3.1. Các yêu cầu phi chức năng (Non-Functional Requirements - FURPS+)")
    add_p(doc, "Các yêu cầu phi chức năng được phân loại theo mô hình chuẩn FURPS+:")
    
    nfr_headers = ["Nhóm yêu cầu (FURPS+)", "Mã yêu cầu", "Nội dung đặc tả chi tiết"]
    nfr_data = [
        ["Functionality (Chức năng)", "NFR-F01", "Kiểm soát tính đơn nhất tuyệt đối của mã IMEI; không cho phép 2 thiết bị có cùng mã IMEI tồn tại trong hệ thống."],
        ["Functionality (Chức năng)", "NFR-F02", "Tính toán giá trị giỏ hàng, thuế VAT, giảm giá combo phụ kiện và điểm tích lũy chính xác 100% đến từng đơn vị VNĐ."],
        ["Usability (Khả năng sử dụng)", "NFR-U01", "Giao diện POS tối ưu hóa cho màn hình cảm ứng 15-21 inch, hỗ trợ phím tắt bàn phím (F1-F12) cho các thao tác thanh toán nhanh."],
        ["Usability (Khả năng sử dụng)", "NFR-U02", "Thời gian đào tạo một nhân viên thu ngân mới sử dụng thành thạo hệ thống không quá 30 phút."],
        ["Reliability (Độ tin cậy)", "NFR-R01", "Hệ thống cam kết độ sẵn sàng (Uptime) đạt tối thiểu 99.5% trong giờ hoạt động bán lẻ (từ 08:00 đến 22:00 hàng ngày)."],
        ["Reliability (Độ tin cậy)", "NFR-R02", "Cơ sở dữ liệu tự động sao lưu định kỳ (Automated Backup) mỗi ngày một lần vào lúc 01:00 sáng và lưu trữ phân tán."],
        ["Performance (Hiệu năng)", "NFR-P01", "Thời gian phản hồi khi quét mã IMEI tra cứu trạng thái sản phẩm dưới 200 mili-giây."],
        ["Performance (Hiệu năng)", "NFR-P02", "Thời gian tạo chuỗi và hiển thị mã VietQR động không quá 500 mili-giây."],
        ["Performance (Hiệu năng)", "NFR-P03", "Hệ thống chịu tải đồng thời tối thiểu 100 giao dịch bán hàng song song từ tất cả các chi nhánh."],
        ["Supportability (Khả năng bảo trì)", "NFR-S01", "Hệ thống hỗ trợ thêm mới một chi nhánh cửa hàng vào chuỗi trong vòng 5 phút chỉ bằng cấu hình tham số."],
        ["Security (Bảo mật)", "NFR-SEC01", "Mật khẩu người dùng được mã hóa một chiều bằng thuật toán BCrypt với Salt. Xác thực API qua chuẩn JSON Web Token (JWT)."]
    ]
    create_styled_table(doc, nfr_headers, nfr_data, [1.4, 0.9, 4.2], "Bảng đặc tả các yêu cầu phi chức năng FURPS+")

    add_heading_3(doc, "3.3.2. Các yêu cầu hệ thống (System Requirements)")
    add_bullet(doc, "Máy tính quầy thu ngân (POS PC) cấu hình tối thiểu Intel Core i3, RAM 8GB, SSD 256GB, kết nối mạng LAN/Wi-Fi ổn định.", "Phần cứng tại chi nhánh: ")
    add_bullet(doc, "Máy quét mã vạch 2D đa hướng (hỗ trợ quét mã vạch SKU trên vỏ hộp và quét mã QR trên màn hình điện thoại).", "Thiết bị ngoại vi: ")
    add_bullet(doc, "Máy in nhiệt hóa đơn khổ K80 (80mm) tốc độ in tối thiểu 200mm/s kết nối qua cổng USB hoặc mạng LAN.", "Thiết bị in ấn: ")
    add_bullet(doc, "Màn hình phụ dành cho khách hàng (Customer Display Screen 10-12 inch) dùng để hiển thị giỏ hàng và mã VietQR động.", "Thiết bị hiển thị: ")
    add_bullet(doc, "Máy chủ trung tâm (Cloud VPS / Dedicated Server) hệ điều hành Ubuntu Linux/Windows Server, tối thiểu 4 Core CPU, RAM 16GB, SSD NVMe.", "Hạ tầng máy chủ: ")
