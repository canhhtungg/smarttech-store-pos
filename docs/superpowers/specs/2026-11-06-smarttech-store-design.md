# Thiết kế Kỹ thuật: Hệ thống Bán hàng Thông minh SmartTech Store (Đề tài 20)

## 1. Mục đích & Bối cảnh (Intent & Why)
Hiện thực hóa phần mềm hoàn chỉnh dựa trên tài liệu đặc tả **Đồ án Phân tích Thiết kế Hệ thống Thông tin — Đề tài 20 (`BaoCao_PTTKHTTT_DeTai20_SmartTechStore.docx`)** cho chuỗi cửa hàng bán lẻ Điện thoại, Laptop và Phụ kiện (**SmartTech Store**).

Mục tiêu kép của hệ thống:
1. **Phục vụ bảo vệ đồ án môn học:** Cấu trúc mã nguồn phản ánh trung thực kiến trúc phân tầng hướng đối tượng (`Controller -> Service -> Repository`) và lược đồ Cơ sở dữ liệu chuẩn 3NF trong báo cáo Word.
2. **Chi phí 0 đồng & Dễ triển khai Demo tối đa:** Chạy ngay ở máy cá nhân chỉ với 1 lệnh (`npm run dev`), đồng thời đẩy mã nguồn lên **GitHub** và triển khai trực tuyến miễn phí trên **Vercel** để giảng viên và sinh viên có thể mở link trải nghiệm, quét thử mã VietQR thật trên điện thoại.

---

## 2. Mục tiêu, Phi mục tiêu & Điều cần tránh (Goals, Non-Goals, Anti-Goals)

### Goals (Mục tiêu cần đạt)
- **Đầy đủ 6 cơ chế "Thông minh" từ báo cáo:**
  1. **Quản lý định danh kép (IMEI vs SKU) & Khóa mềm chống bán trùng:** Quét mã IMEI 15 số cho điện thoại/laptop, tự động khóa mềm tạm thời (TTL 10 phút) khi đưa vào giỏ hàng; quản lý phụ kiện theo mã SKU và số lượng tồn.
  2. **Gợi ý phụ kiện tương thích (Smart Accessory Cross-sell):** Khi chọn/quét thiết bị chính, tự động truy vấn ma trận tương thích và hiển thị danh sách phụ kiện phù hợp kèm mức chiết khấu Combo (15%–20%).
  3. **Thanh toán VietQR động chuẩn Napas EMVCo (Offline-capable):** Tự động tính toán chuỗi TLV chuẩn EMVCo kèm mã kiểm tra `CRC16-CCITT (0x1021)` và vẽ mã QR trực tiếp bằng thư viện cục bộ (không phụ thuộc Internet hay API bên thứ ba), điền sẵn chính xác Ngân hàng, Số tài khoản, Tổng tiền thanh toán đến từng đồng và Mã hóa đơn.
  4. **Định giá Thu cũ đổi mới (Smart Trade-in) & Tích điểm hội viên:** Tích chọn bộ câu hỏi thẩm định nhanh ngoại quan/pin để tự động tính mức trợ giá thu máy cũ trừ thẳng vào hóa đơn; tích và tiêu điểm theo SĐT khách hàng.
  5. **Bảo hành điện tử tự động (Automated E-Warranty):** Tự động sinh hồ sơ bảo hành ngay khi hoàn tất hóa đơn; cho phép tra cứu thời hạn & lịch sử tiếp nhận bảo hành qua mã IMEI hoặc SĐT.
  6. **Tra cứu kho chuỗi, Điều chuyển nội bộ & Cảnh báo hàng tồn lâu (Aging Stock):** Xem tồn kho tức thời trên 3 chi nhánh (*Cầu Giấy, Đống Đa, Hà Đông*), lập/duyệt/nhận phiếu điều chuyển máy, và tự động gắn nhãn cảnh báo Vàng (45–59 ngày) / Đỏ (≥60 ngày) kèm nút áp dụng giảm giá xả kho 1-click.
- **Tối ưu thao tác thuyết trình Demo:** Hỗ trợ cả đăng nhập phân quyền RBAC chuẩn lẫn **Thanh chuyển đổi nhanh Vai trò & Chi nhánh (Demo Role Switcher)** ngay trên thanh công cụ để sinh viên không mất thời gian đăng xuất/nhập mật khẩu nhiều lần khi đứng trên bục báo cáo.

### Non-Goals (Ngoài phạm vi)
- Không tích hợp cổng đối soát biến động số dư tự động có thu phí từ ngân hàng (thay bằng nút xác nhận đã nhận tiền `F12` của thu ngân trên màn hình VietQR).
- Không tích hợp hãng vận chuyển bên thứ ba (GHN, Viettel Post) hay hóa đơn điện tử cơ quan thuế.
- Không xây dựng ứng dụng di động gốc (Native iOS/Android) rời; giao diện Web được thiết kế Responsive dùng tốt trên cả máy POS màn hình rộng và điện thoại.

### Anti-Goals (Điều tuyệt đối tránh)
- **Lỗi `SQLITE_READONLY` trên Vercel:** File CSDL nằm trong thư mục đóng gói của Vercel Serverless không cho phép ghi trực tiếp. Phải xử lý triệt để để các thao tác *Tạo hóa đơn, Nhập IMEI, Điều chuyển kho, Giảm giá xả hàng* trên link Vercel hoạt động trơn tru không báo lỗi 500.
- **Phụ thuộc hạ tầng phức tạp:** Không bắt người dùng phải cài PostgreSQL hay bật Docker Desktop mới chạy được ở máy cá nhân.

---

## 3. Các phương án Kiến trúc đã cân nhắc (Approaches Considered)

1. **Phương án 1 (Đã chọn): Next.js Full-stack (App Router, TypeScript, Tailwind CSS) + LibSQL/SQLite (`@libsql/client`)**
   - *Ưu điểm:* Gom trọn Frontend và Backend phân tầng OOP trong một dự án duy nhất; tốn 0đ; chạy local bằng 1 lệnh `npm run dev`; tương thích gốc với Vercel; hỗ trợ song song file SQLite cục bộ, `/tmp` copy-on-write trên Vercel Serverless (0 cấu hình), và Turso Cloud LibSQL miễn phí nếu muốn lưu trữ đám mây lâu dài.
   - *Đánh đổi:* Khóa mềm IMEI được lưu bằng trường thời gian `locked_until` trong CSDL thay vì dựng máy chủ Redis riêng (giúp tiết kiệm chi phí về 0đ và loại bỏ phụ thuộc Redis).
2. **Phương án 2 (Loại): Python FastAPI + React (Vite)**
   - *Lý do loại:* Cần chạy 2 tiến trình riêng biệt và phải triển khai Backend ở nền tảng khác ngoài Vercel hoặc cấu hình Serverless Python phức tạp hơn khi demo.
3. **Phương án 3 (Loại): Docker Compose + PostgreSQL 16 + Redis**
   - *Lý do loại:* Nặng máy khi demo trên laptop và không có dịch vụ PostgreSQL + Redis miễn phí vĩnh viễn không ngủ đông dễ gắn trực tiếp mà không cần đăng ký thêm nhiều tài khoản bên thứ ba.

---

## 4. Thiết kế Chi tiết Hệ thống (Detailed Architecture)

### 4.1. Chiến lược Cơ sở dữ liệu Kép (Dual-Mode Zero-Cost SQLite)
Sử dụng `@libsql/client` với cơ chế tự động thích ứng môi trường *(Quyết định kỹ thuật của Builder)*:
- **Môi trường Local (`NODE_ENV !== 'production'` và không chạy trên Vercel):** Lưu trữ bền vững tại `./data/smarttech.db`. Tự động khởi tạo bảng và nạp dữ liệu mẫu (Seed) ở lần chạy đầu tiên.
- **Môi trường Vercel Serverless:**
  - Nếu có biến môi trường `TURSO_DATABASE_URL` (+ `TURSO_AUTH_TOKEN`): Kết nối thẳng tới Cloud SQLite để lưu vĩnh viễn.
  - Nếu chưa cấu hình biến ngoài (mặc định khi vừa deploy xong): Tự động khởi tạo/sao chép dữ liệu mẫu vào `/tmp/smarttech.db` (thư mục cho phép đọc/ghi trên Vercel Lambda) chỉ trong <50ms. Mọi giao dịch mua bán, trừ kho, kích hoạt bảo hành trong buổi bảo vệ đồ án đều thực thi SQL thật (`BEGIN TRANSACTION ... COMMIT`) mượt mà.
- Trang Cài đặt có nút **"Khôi phục dữ liệu mẫu ban đầu (Reset Demo Data)"** giúp đưa toàn bộ kho IMEI và hóa đơn về trạng thái chuẩn trước mỗi buổi thuyết trình.

### 4.2. Lược đồ Cơ sở dữ liệu (11 bảng chuẩn 3NF bám sát Chương 5.7 Báo cáo)
1. `tbl_ChiNhanh`: `ma_chi_nhanh` (PK), `ten_chi_nhanh`, `dia_chi`, `so_dien_thoai`.
2. `tbl_NhanVien`: `ma_nhan_vien` (PK), `ma_chi_nhanh` (FK), `ho_ten`, `chuc_vu` (`Cashier` | `Keeper` | `Manager` | `Admin`), `tai_khoan`, `so_dien_thoai`, `mat_khau_hash`.
3. `tbl_SanPham`: `ma_san_pham` (PK), `ten_san_pham`, `thuong_hieu`, `loai_san_pham` (`DienThoai` | `Laptop` | `PhuKien`), `cau_hinh_tom_tat`, `gia_niem_yet`, `gia_khuyen_mai` (nullable — phục vụ xả kho Aging Stock), `thoi_gian_bao_hanh_thang`.
4. `tbl_ThietBi_IMEI`: `ma_imei` (PK, đúng 15 chữ số), `ma_san_pham` (FK), `ma_chi_nhanh` (FK), `so_serial`, `trang_thai` (`SanSangBan` | `KhoaTamThoi` | `DangLuanChuyen` | `DaBan` | `BaoHanh`), `ngay_nhap_kho`, `gia_nhap`, `locked_by` (nullable), `locked_until` (nullable ISO timestamp — tự động hết hạn khóa mềm sau 10 phút).
5. `tbl_TonKho_PhuKien`: `id` (PK), `ma_san_pham` (FK), `ma_chi_nhanh` (FK), `so_luong_ton`, `muc_ton_an_toan` (UNIQUE theo cặp sản phẩm + chi nhánh).
6. `tbl_PhuKien_TuongThich`: `id` (PK), `ma_sp_chinh` (FK), `ma_sp_phu_kien` (FK), `muc_do_uu_tien`, `phan_tram_giam_combo`.
7. `tbl_KhachHang`: `ma_khach_hang` (PK), `so_dien_thoai` (UNIQUE), `ho_ten`, `diem_tich_luy`, `hang_thanh_vien` (`ThanhVien` | `Bac` | `Vang` | `KimCuong`).
8. `tbl_HoaDon`: `ma_hoa_don` (PK), `ma_chi_nhanh` (FK), `ma_nhan_vien` (FK), `ma_khach_hang` (FK, nullable), `ngay_lap`, `tong_tien_hang`, `tien_giam_combo`, `tien_giam_diem`, `tien_thu_cu`, `mo_ta_thu_cu` (nullable), `tong_thanh_toan`, `phuong_thuc_tt` (`VietQR` | `TienMat` | `The`), `ma_giao_dich_qr`, `trang_thai_don`.
9. `tbl_ChiTietHoaDon`: `id` (PK), `ma_hoa_don` (FK), `ma_san_pham` (FK), `ma_imei` (FK, nullable), `so_luong`, `don_gia_ban`, `tien_giam_combo`, `thanh_tien`.
10. `tbl_BaoHanh_DienTu`: `ma_bao_hanh` (PK), `ma_imei` (FK), `ma_hoa_don` (FK), `so_dien_thoai_khach`, `ngay_kich_hoat`, `ngay_het_han`, `trang_thai_bao_hanh`, `lich_su_tiep_nhan` (JSON danh sách các lần tiếp nhận kiểm tra/sửa chữa).
11. `tbl_PhieuDieuChuyen`: `ma_phieu_chuyen` (PK), `ma_chi_nhanh_xuat` (FK), `ma_chi_nhanh_nhap` (FK), `ma_san_pham` (FK), `ma_imei` (FK, gán khi duyệt xuất), `nguoi_yeu_cau`, `nguoi_duyet` (nullable), `ngay_tao`, `ngay_cap_nhat`, `trang_thai` (`Pending` | `InTransit` | `Completed` | `Rejected`), `ghi_chu`.
*(Bổ sung bảng cấu hình nhỏ `tbl_CauHinhHeThong` lưu Ngân hàng BIN, Số tài khoản, Tên chủ tài khoản nhận VietQR để người dùng đổi trực tiếp trên UI).*

### 4.3. Kiến trúc Phân tầng Hướng đối tượng (OOP Layered Architecture)
Đặt trong `src/server/` để giảng viên dễ đối chiếu trực tiếp với biểu đồ lớp Chương 5:
- **`src/server/repositories/`**: Tách riêng từng lớp Repository thực thi truy vấn SQL tham số hóa chống SQL Injection (`ThietBiIMEIRepository`, `SanPhamRepository`, `HoaDonRepository`, `BaoHanhRepository`, `PhieuDieuChuyenRepository`, `KhachHangRepository`, `CauHinhRepository`).
- **`src/server/services/`**:
  - `VietQRService`: Đóng gói chuẩn EMVCo Napas (`ID 00`="01", `ID 01`="12" dynamic QR, `ID 38` GUID `A000000727` + Napas BIN + STK + `QRIBFTTA`, `ID 53`="704", `ID 54`=số tiền nguyên dương, `ID 58`="VN", `ID 62`=mã hóa đơn không dấu, `ID 63`=CRC16-CCITT đa thức `0x1021` khởi tạo `0xFFFF`) và xuất ảnh QR Base64/SVG bằng thư viện `qrcode`.
  - `RecommendationService`: Truy vấn danh sách phụ kiện tương thích của tất cả các dòng máy đang nằm trong giỏ hàng, kiểm tra tồn kho thực tế tại chi nhánh hiện tại và tính chiết khấu Combo.
  - `TradeInService`: Định giá máy cũ dựa trên giá trần thu mua của dòng máy trừ đi tỷ lệ khấu hao theo 4 tiêu chí kiểm định nhanh (Màn hình, Dung lượng Pin, Ngoại quan viền/vỏ, Chức năng/Tài khoản ẩn).
  - `OrderService`: Kiểm tra và khóa mềm IMEI (`validateAndLockIMEI`), giải phóng các khóa quá hạn 10 phút, chốt đơn hàng trong một Transaction nguyên tử (lưu hóa đơn -> đổi IMEI sang `DaBan` -> trừ tồn kho phụ kiện -> cộng/trừ điểm hội viên -> kích hoạt `BaoHanhDienTu` với quy đổi 100.000đ = 1 điểm tích lũy, 1 điểm = 1.000đ khi tiêu điểm).
  - `InventoryService`: Nhập kho hàng loạt theo danh sách mã IMEI (kiểm tra chuẩn 15 chữ số và không trùng trên toàn hệ thống), nhập bổ sung phụ kiện SKU, và điều phối luồng 3 bước điều chuyển chi nhánh (`createRequest` -> `approveAndExport` -> `confirmReceive` / `rejectRequest`).
  - `WarrantyService`: Tra cứu hồ sơ bảo hành theo mã IMEI hoặc SĐT khách hàng và ghi nhận phiếu tiếp nhận bảo hành mới (đổi trạng thái thiết bị sang `BaoHanh` khi đang giữ máy sửa, trả về `DaBan` khi hoàn tất trả khách).
  - `AgingStockService`: Tính tuổi lưu kho `(Hôm nay - ngay_nhap_kho)` cho toàn bộ máy `SanSangBan`, phân loại Vàng (45–59 ngày) và Đỏ (≥60 ngày), áp dụng mức giảm giá xả kho trực tiếp lên dòng sản phẩm hoặc thiết bị và tổng hợp số liệu Dashboard doanh thu chuỗi.
- **`src/app/api/`**: Các Route Handlers đóng vai trò lớp Controller mỏng, kiểm tra đầu vào và trả JSON chuẩn hóa.

### 4.4. Cấu trúc Giao diện Người dùng (Frontend Screens)
Thiết kế theo quy chuẩn từ skill `ui-ux-pro-max` và `frontend-design` (giao diện sáng rõ, độ tương phản cao chuẩn quầy thu ngân chuyên nghiệp, hỗ trợ phím tắt bàn phím):
1. **Thanh điều hướng chung (Topbar & Sidebar):** Hiển thị Chi nhánh hiện tại, Nhân viên đang trực, nút chuyển nhanh Vai trò/Chi nhánh phục vụ Demo (hoặc màn hình Đăng nhập đầy đủ).
2. **`/pos` — Màn hình Bán hàng Smart POS (Màn hình chính):**
   - Cột trái (60%): Ô quét/chọn nhanh mã IMEI hoặc tìm sản phẩm (`F2`), danh sách giỏ hàng, khung nhập SĐT hội viên + dùng điểm, nút mở hộp thoại **Thu cũ đổi mới (Trade-in)**.
   - Cột phải (40%): Khay **"★ Gợi ý phụ kiện tương thích (Ưu đãi Combo)"** tự động cập nhật theo máy trong giỏ, bảng tổng kết tiền rõ ràng, và dãy nút thanh toán (`F8: Tiền mặt`, `F10: VietQR Động`).
   - **Modal VietQR Động:** Hiển thị mã QR lớn rõ nét, thông tin Ngân hàng / STK / Số tiền chính xác / Nội dung CK, bộ đếm ngược thời gian khóa máy, nút `Xác nhận đã nhận tiền (F12)` -> Chuyển sang **Bản xem trước Hóa đơn nhiệt K80 & Chứng nhận Bảo hành điện tử** (có nút In thực tế `window.print()`).
3. **`/inventory` — Quản lý Kho & Nhập dải IMEI:** Xem danh sách từng cá thể máy theo IMEI tại chi nhánh, lọc theo trạng thái, nhập lô IMEI mới (hỗ trợ dán nhiều dòng cùng lúc, báo đỏ ngay mã trùng hoặc sai 15 số) và nhập số lượng phụ kiện SKU (cảnh báo khi chạm ngưỡng `muc_ton_an_toan`).
4. **`/transfers` — Tra cứu Kho chuỗi & Điều chuyển nội bộ:** Bảng ma trận tồn kho trực quan của cả 3 chi nhánh (*Cầu Giấy, Đống Đa, Hà Đông*), tạo yêu cầu chuyển máy từ chi nhánh còn hàng, duyệt chọn mã IMEI xuất kho và quét IMEI xác nhận nhận hàng.
5. **`/warranty` — Cổng Tra cứu & Tiếp nhận Bảo hành điện tử:** Giao diện kép vừa cho khách hàng tra cứu công khai qua IMEI/SĐT, vừa cho Kỹ thuật viên lập biên nhận bảo hành mới.
6. **`/dashboard` — Quản trị chuỗi & Cảnh báo Hàng tồn lâu (Aging Stock):** Các thẻ KPI tổng quan, biểu đồ so sánh doanh thu 3 chi nhánh, tỷ lệ đơn bán kèm phụ kiện Combo, và bảng **Aging Stock Alert** gắn nhãn Vàng/Đỏ kèm nút **"Giảm giá xả kho 10%"** 1-click.
7. **`/settings` — Cấu hình Hệ thống & VietQR:** Cho phép nhập Mã ngân hàng (Vietcombank, MB Bank, Techcombank, VietinBank, BIDV, ACB...), Số tài khoản và Tên chủ tài khoản thật của sinh viên để test quét VietQR thực tế + Nút Reset dữ liệu mẫu.

---

## 5. Cấu trúc Tổ chức Repo, GitHub & Vercel
- Tổ chức dự án gọn gàng: Giữ file báo cáo `BaoCao_PTTKHTTT_DeTai20_SmartTechStore.docx` và các script tạo báo cáo vào thư mục `docs/report/` (hoặc giữ file `.docx` ở gốc repo để dễ tải), khởi tạo ứng dụng Next.js ngay tại gốc kho lưu trữ `c:\Users\a\Desktop\PTTKHT` để Vercel tự động nhận diện Next.js chuẩn xác 100% mà không cần chỉnh Root Directory.
- Loại trừ `.venv/`, `node_modules/`, `.next/`, `data/*.db`, `.env*` trong `.gitignore`.
- **Đẩy lên GitHub:** Khởi tạo Git, tạo repository mới (ví dụ `smarttech-store-pos`) trên tài khoản GitHub của người dùng thông qua GitHub CLI (`gh`) / GitHub MCP và đẩy nhánh `main` lên.
- **Triển khai lên Vercel:** Liên kết repo và triển khai bằng Vercel CLI / Vercel Plugin theo đúng quy trình `deploy-to-vercel`, trả về đường link trực tuyến hoạt động ngay.

## 6. Phần dành cho kỹ sư thực thi quyết định (Left to the Builder)
- Lựa chọn chính xác bảng màu chi tiết, cặp font chữ tiếng Việt sắc nét (hỗ trợ đầy đủ dấu tiếng Việt như `Be Vietnam Pro` / `Plus Jakarta Sans` + `JetBrains Mono` cho mã IMEI và số tiền) thông qua công cụ `ui-ux-pro-max`.
- Chi tiết danh sách 15–20 sản phẩm công nghệ và 30+ mã IMEI mẫu sát thực tế thị trường Việt Nam năm 2026 (có sẵn các máy nhập từ 50 ngày và 85 ngày trước để bảng Aging Stock có dữ liệu Vàng/Đỏ ngay khi mở lên).
- Bộ kiểm thử tự động (Vitest) cho các lớp Service trọng tâm (`VietQRService`, `OrderService`, `RecommendationService`, `AgingStockService`, `InventoryService`).
