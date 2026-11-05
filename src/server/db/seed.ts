import type { Client, InStatement } from "@libsql/client";

function daysAgoDate(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function daysFromNowDate(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function hoursAgoISO(hours: number): string {
  const d = new Date(Date.now() - hours * 3600 * 1000);
  return d.toISOString();
}

export async function seedInitialData(db: Client): Promise<void> {
  const statements: InStatement[] = [
    // 1. Chi nhánh chuỗi cửa hàng
    {
      sql: "INSERT INTO tbl_ChiNhanh (ma_chi_nhanh, ten_chi_nhanh, dia_chi, so_dien_thoai) VALUES (?, ?, ?, ?)",
      args: ["CN-CG", "SmartTech Cầu Giấy", "144 Xuân Thủy, Cầu Giấy, Hà Nội", "02438881111"],
    },
    {
      sql: "INSERT INTO tbl_ChiNhanh (ma_chi_nhanh, ten_chi_nhanh, dia_chi, so_dien_thoai) VALUES (?, ?, ?, ?)",
      args: ["CN-DD", "SmartTech Đống Đa", "18 Thái Hà, Đống Đa, Hà Nội", "02438882222"],
    },
    {
      sql: "INSERT INTO tbl_ChiNhanh (ma_chi_nhanh, ten_chi_nhanh, dia_chi, so_dien_thoai) VALUES (?, ?, ?, ?)",
      args: ["CN-HD", "SmartTech Hà Đông", "102 Trần Phú, Hà Đông, Hà Nội", "02438883333"],
    },

    // 2. Nhân sự các vai trò (RBAC)
    {
      sql: "INSERT INTO tbl_NhanVien (ma_nhan_vien, ma_chi_nhanh, ho_ten, chuc_vu, tai_khoan, so_dien_thoai, mat_khau_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: ["NV-001", "CN-CG", "Nguyễn Văn An", "Cashier", "cashier.cg", "0901112233", "demo123"],
    },
    {
      sql: "INSERT INTO tbl_NhanVien (ma_nhan_vien, ma_chi_nhanh, ho_ten, chuc_vu, tai_khoan, so_dien_thoai, mat_khau_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: ["NV-002", "CN-CG", "Trần Thị Bình", "Keeper", "keeper.cg", "0901112244", "demo123"],
    },
    {
      sql: "INSERT INTO tbl_NhanVien (ma_nhan_vien, ma_chi_nhanh, ho_ten, chuc_vu, tai_khoan, so_dien_thoai, mat_khau_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: ["NV-003", "CN-DD", "Lê Hoàng Cường", "Manager", "manager.dd", "0901112255", "demo123"],
    },
    {
      sql: "INSERT INTO tbl_NhanVien (ma_nhan_vien, ma_chi_nhanh, ho_ten, chuc_vu, tai_khoan, so_dien_thoai, mat_khau_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: ["NV-004", "CN-CG", "Phạm Minh Đức", "Admin", "admin.chain", "0901112266", "demo123"],
    },
    {
      sql: "INSERT INTO tbl_NhanVien (ma_nhan_vien, ma_chi_nhanh, ho_ten, chuc_vu, tai_khoan, so_dien_thoai, mat_khau_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: ["NV-005", "CN-HD", "Hoàng Thu Hà", "Manager", "manager.hd", "0901112277", "demo123"],
    },

    // 3. Danh mục Sản phẩm (Điện thoại, Laptop, Phụ kiện)
    {
      sql: "INSERT INTO tbl_SanPham VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["IP16PM-256", "iPhone 16 Pro Max 256GB Titan Tự Nhiên", "Apple", "DienThoai", "A18 Pro | 8GB | 256GB | 6.9\"", 33990000, null, 12],
    },
    {
      sql: "INSERT INTO tbl_SanPham VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["IP15PM-256", "iPhone 15 Pro Max 256GB Titan Xanh", "Apple", "DienThoai", "A17 Pro | 8GB | 256GB | 6.7\"", 28990000, null, 12],
    },
    {
      sql: "INSERT INTO tbl_SanPham VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["SS-S24U-256", "Samsung Galaxy S24 Ultra 5G 256GB", "Samsung", "DienThoai", "Snapdragon 8 Gen 3 | 12GB | 256GB", 26490000, null, 12],
    },
    {
      sql: "INSERT INTO tbl_SanPham VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["IP14-128", "iPhone 14 128GB Đỏ (Product RED)", "Apple", "DienThoai", "A15 Bionic | 6GB | 128GB | 6.1\"", 15990000, null, 12],
    },
    {
      sql: "INSERT INTO tbl_SanPham VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["MB-AIR-M3", "MacBook Air 13 inch M3 16GB/256GB Midnight", "Apple", "Laptop", "Apple M3 8-Core | RAM 16GB | SSD 256GB", 27490000, null, 12],
    },
    {
      sql: "INSERT INTO tbl_SanPham VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["ASUS-ZEN14", "ASUS Zenbook 14 OLED Ultra 5 16GB/512GB", "ASUS", "Laptop", "Core Ultra 5 125H | 16GB | 512GB | OLED 3K", 24990000, null, 24],
    },
    {
      sql: "INSERT INTO tbl_SanPham VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["IPAD-AIR6", "iPad Air 6 M2 11 inch WiFi 128GB Xám", "Apple", "Laptop", "Apple M2 | 8GB | 128GB | Liquid Retina", 16490000, null, 12],
    },
    // Phụ kiện SKU
    {
      sql: "INSERT INTO tbl_SanPham VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["PK-AP-20W", "Củ sạc nhanh Apple 20W USB-C Chính hãng", "Apple", "PhuKien", "USB-C Power Delivery 20W", 550000, null, 12],
    },
    {
      sql: "INSERT INTO tbl_SanPham VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["PK-CL-IPPM", "Kính cường lực KingKong Chống nhìn trộm iPhone Pro Max", "KingKong", "PhuKien", "Độ cứng 9H | Viền vát 3D", 290000, null, 1],
    },
    {
      sql: "INSERT INTO tbl_SanPham VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["PK-OP-MAGSAFE", "Ốp lưng MagSafe Trong suốt Chống ố vàng", "Apple", "PhuKien", "Tích hợp vòng từ tính MagSafe", 490000, null, 6],
    },
    {
      sql: "INSERT INTO tbl_SanPham VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["PK-SS-45W", "Bộ sạc siêu nhanh Samsung 45W kèm cáp C-to-C 5A", "Samsung", "PhuKien", "Super Fast Charging 2.0 45W", 950000, null, 12],
    },
    {
      sql: "INSERT INTO tbl_SanPham VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["PK-ANKER-65W", "Củ sạc nhanh Anker Nano II 65W GaN II", "Anker", "PhuKien", "Sạc nhanh Laptop & Điện thoại 65W", 890000, null, 18],
    },
    {
      sql: "INSERT INTO tbl_SanPham VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["PK-LOGI-MX3S", "Chuột không dây Logitech MX Master 3S Silent", "Logitech", "PhuKien", "Bluetooth / Logi Bolt | 8000 DPI", 2390000, null, 24],
    },
    {
      sql: "INSERT INTO tbl_SanPham VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["PK-TOMTOC-14", "Túi chống sốc Laptop Tomtoc 360 Protective 13-14 inch", "Tomtoc", "PhuKien", "Đệm góc CornerArmor chuẩn quân đội", 850000, null, 12],
    },
    {
      sql: "INSERT INTO tbl_SanPham VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["PK-HUB-UGREEN", "Hub chuyển đổi Ugreen Type-C 7-in-1 HDMI 4K", "Ugreen", "PhuKien", "HDMI 4K60Hz + PD 100W + USB 3.0", 690000, null, 18],
    },

    // 4. Cá thể máy quản lý theo IMEI 15 số
    // Chi nhánh Cầu Giấy (CN-CG) - hàng mới nhập sẵn sàng bán trên POS
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["356892110294811", "IP16PM-256", "CN-CG", "F2LQN811AP", "SanSangBan", daysAgoDate(6), 30500000],
    },
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["356892110294812", "IP16PM-256", "CN-CG", "F2LQN812AP", "SanSangBan", daysAgoDate(8), 30500000],
    },
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["354910228374611", "IP15PM-256", "CN-CG", "G6TPK611AP", "SanSangBan", daysAgoDate(15), 25800000],
    },
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["358119203948511", "SS-S24U-256", "CN-CG", "R58X2011SS", "SanSangBan", daysAgoDate(12), 22900000],
    },
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["359001293847101", "MB-AIR-M3", "CN-CG", "C02ZN101MD", "SanSangBan", daysAgoDate(10), 24500000],
    },
    // Aging YELLOW (53 ngày) tại Cầu Giấy
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["357718293019283", "IPAD-AIR6", "CN-CG", "DLXQM283AP", "SanSangBan", daysAgoDate(53), 14200000],
    },

    // Chi nhánh Đống Đa (CN-DD) - Có ASUS-ZEN14 (Cầu Giấy hết hàng -> tiện demo điều chuyển!)
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["356892110294821", "IP16PM-256", "CN-DD", "F2LQN821AP", "SanSangBan", daysAgoDate(9), 30500000],
    },
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["352091827364501", "ASUS-ZEN14", "CN-DD", "S2N0CX01AS", "SanSangBan", daysAgoDate(14), 21500000],
    },
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["352091827364502", "ASUS-ZEN14", "CN-DD", "S2N0CX02AS", "SanSangBan", daysAgoDate(14), 21500000],
    },
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["358119203948521", "SS-S24U-256", "CN-DD", "R58X2021SS", "SanSangBan", daysAgoDate(19), 22900000],
    },
    // Aging RED (78 ngày) tại Đống Đa
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["354817290192831", "IPAD-AIR6", "CN-DD", "DLXQM831AP", "SanSangBan", daysAgoDate(78), 14200000],
    },
    // Aging YELLOW (49 ngày) tại Đống Đa
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["354910228374629", "IP15PM-256", "CN-DD", "G6TPK629AP", "SanSangBan", daysAgoDate(49), 25800000],
    },

    // Chi nhánh Hà Đông (CN-HD) - Có máy tồn kho lâu > 90 ngày (RED ALERT)
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["352918220194812", "IP14-128", "CN-HD", "H4MPQ812AP", "SanSangBan", daysAgoDate(93), 13800000],
    },
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["352918220194813", "IP14-128", "CN-HD", "H4MPQ813AP", "SanSangBan", daysAgoDate(88), 13800000],
    },
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["359001293847131", "MB-AIR-M3", "CN-HD", "C02ZN131MD", "SanSangBan", daysAgoDate(11), 24500000],
    },
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["356892110294831", "IP16PM-256", "CN-HD", "F2LQN831AP", "SanSangBan", daysAgoDate(5), 30500000],
    },

    // Các máy Đã bán (phục vụ dữ liệu Hóa đơn mẫu & Bảo hành điện tử)
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["356892110294801", "IP16PM-256", "CN-CG", "F2LQN801AP", "DaBan", daysAgoDate(20), 30500000],
    },
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["359001293847100", "MB-AIR-M3", "CN-DD", "C02ZN100MD", "DaBan", daysAgoDate(25), 24500000],
    },
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["358119203948500", "SS-S24U-256", "CN-HD", "R58X2000SS", "DaBan", daysAgoDate(40), 22900000],
    },
    // Máy đang luân chuyển mẫu
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["352091827364509", "ASUS-ZEN14", "CN-DD", "S2N0CX09AS", "DangLuanChuyen", daysAgoDate(16), 21500000],
    },
    // Thêm các máy dự phòng để tổng >= 21 IMEIs
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["354910228374612", "IP15PM-256", "CN-CG", "G6TPK612AP", "SanSangBan", daysAgoDate(18), 25800000],
    },
    {
      sql: "INSERT INTO tbl_ThietBi_IMEI VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
      args: ["358119203948512", "SS-S24U-256", "CN-CG", "R58X2012SS", "SanSangBan", daysAgoDate(11), 22900000],
    },

    // 5. Tồn kho Phụ kiện theo SKU tại 3 chi nhánh
    ...["CN-CG", "CN-DD", "CN-HD"].flatMap((branch, idx) => [
      { sql: "INSERT INTO tbl_TonKho_PhuKien (ma_san_pham, ma_chi_nhanh, so_luong_ton, muc_ton_an_toan) VALUES (?, ?, ?, ?)", args: ["PK-AP-20W", branch, 28 - idx * 5, 10] },
      { sql: "INSERT INTO tbl_TonKho_PhuKien (ma_san_pham, ma_chi_nhanh, so_luong_ton, muc_ton_an_toan) VALUES (?, ?, ?, ?)", args: ["PK-CL-IPPM", branch, 42 - idx * 8, 15] },
      { sql: "INSERT INTO tbl_TonKho_PhuKien (ma_san_pham, ma_chi_nhanh, so_luong_ton, muc_ton_an_toan) VALUES (?, ?, ?, ?)", args: ["PK-OP-MAGSAFE", branch, 19 - idx * 4, 10] },
      { sql: "INSERT INTO tbl_TonKho_PhuKien (ma_san_pham, ma_chi_nhanh, so_luong_ton, muc_ton_an_toan) VALUES (?, ?, ?, ?)", args: ["PK-SS-45W", branch, 14 - idx * 3, 8] },
      { sql: "INSERT INTO tbl_TonKho_PhuKien (ma_san_pham, ma_chi_nhanh, so_luong_ton, muc_ton_an_toan) VALUES (?, ?, ?, ?)", args: ["PK-ANKER-65W", branch, 9 - idx * 2, 10] }, // Low stock alert example!
      { sql: "INSERT INTO tbl_TonKho_PhuKien (ma_san_pham, ma_chi_nhanh, so_luong_ton, muc_ton_an_toan) VALUES (?, ?, ?, ?)", args: ["PK-LOGI-MX3S", branch, 12 - idx * 2, 5] },
      { sql: "INSERT INTO tbl_TonKho_PhuKien (ma_san_pham, ma_chi_nhanh, so_luong_ton, muc_ton_an_toan) VALUES (?, ?, ?, ?)", args: ["PK-TOMTOC-14", branch, 16 - idx * 3, 8] },
      { sql: "INSERT INTO tbl_TonKho_PhuKien (ma_san_pham, ma_chi_nhanh, so_luong_ton, muc_ton_an_toan) VALUES (?, ?, ?, ?)", args: ["PK-HUB-UGREEN", branch, 15 - idx * 3, 8] },
    ]),

    // 6. Bảng quy tắc Gợi ý Phụ kiện tương thích (Combo Cross-sell)
    { sql: "INSERT INTO tbl_PhuKien_TuongThich (ma_sp_chinh, ma_sp_phu_kien, muc_do_uu_tien, phan_tram_giam_combo) VALUES (?, ?, ?, ?)", args: ["IP16PM-256", "PK-AP-20W", 1, 20] },
    { sql: "INSERT INTO tbl_PhuKien_TuongThich (ma_sp_chinh, ma_sp_phu_kien, muc_do_uu_tien, phan_tram_giam_combo) VALUES (?, ?, ?, ?)", args: ["IP16PM-256", "PK-CL-IPPM", 2, 25] },
    { sql: "INSERT INTO tbl_PhuKien_TuongThich (ma_sp_chinh, ma_sp_phu_kien, muc_do_uu_tien, phan_tram_giam_combo) VALUES (?, ?, ?, ?)", args: ["IP16PM-256", "PK-OP-MAGSAFE", 3, 20] },
    { sql: "INSERT INTO tbl_PhuKien_TuongThich (ma_sp_chinh, ma_sp_phu_kien, muc_do_uu_tien, phan_tram_giam_combo) VALUES (?, ?, ?, ?)", args: ["IP15PM-256", "PK-AP-20W", 1, 20] },
    { sql: "INSERT INTO tbl_PhuKien_TuongThich (ma_sp_chinh, ma_sp_phu_kien, muc_do_uu_tien, phan_tram_giam_combo) VALUES (?, ?, ?, ?)", args: ["IP15PM-256", "PK-CL-IPPM", 2, 25] },
    { sql: "INSERT INTO tbl_PhuKien_TuongThich (ma_sp_chinh, ma_sp_phu_kien, muc_do_uu_tien, phan_tram_giam_combo) VALUES (?, ?, ?, ?)", args: ["IP15PM-256", "PK-OP-MAGSAFE", 3, 20] },
    { sql: "INSERT INTO tbl_PhuKien_TuongThich (ma_sp_chinh, ma_sp_phu_kien, muc_do_uu_tien, phan_tram_giam_combo) VALUES (?, ?, ?, ?)", args: ["IP14-128", "PK-AP-20W", 1, 20] },
    { sql: "INSERT INTO tbl_PhuKien_TuongThich (ma_sp_chinh, ma_sp_phu_kien, muc_do_uu_tien, phan_tram_giam_combo) VALUES (?, ?, ?, ?)", args: ["SS-S24U-256", "PK-SS-45W", 1, 20] },
    { sql: "INSERT INTO tbl_PhuKien_TuongThich (ma_sp_chinh, ma_sp_phu_kien, muc_do_uu_tien, phan_tram_giam_combo) VALUES (?, ?, ?, ?)", args: ["SS-S24U-256", "PK-ANKER-65W", 2, 15] },
    { sql: "INSERT INTO tbl_PhuKien_TuongThich (ma_sp_chinh, ma_sp_phu_kien, muc_do_uu_tien, phan_tram_giam_combo) VALUES (?, ?, ?, ?)", args: ["MB-AIR-M3", "PK-HUB-UGREEN", 1, 20] },
    { sql: "INSERT INTO tbl_PhuKien_TuongThich (ma_sp_chinh, ma_sp_phu_kien, muc_do_uu_tien, phan_tram_giam_combo) VALUES (?, ?, ?, ?)", args: ["MB-AIR-M3", "PK-TOMTOC-14", 2, 15] },
    { sql: "INSERT INTO tbl_PhuKien_TuongThich (ma_sp_chinh, ma_sp_phu_kien, muc_do_uu_tien, phan_tram_giam_combo) VALUES (?, ?, ?, ?)", args: ["MB-AIR-M3", "PK-LOGI-MX3S", 3, 15] },
    { sql: "INSERT INTO tbl_PhuKien_TuongThich (ma_sp_chinh, ma_sp_phu_kien, muc_do_uu_tien, phan_tram_giam_combo) VALUES (?, ?, ?, ?)", args: ["ASUS-ZEN14", "PK-LOGI-MX3S", 1, 15] },
    { sql: "INSERT INTO tbl_PhuKien_TuongThich (ma_sp_chinh, ma_sp_phu_kien, muc_do_uu_tien, phan_tram_giam_combo) VALUES (?, ?, ?, ?)", args: ["ASUS-ZEN14", "PK-TOMTOC-14", 2, 20] },
    { sql: "INSERT INTO tbl_PhuKien_TuongThich (ma_sp_chinh, ma_sp_phu_kien, muc_do_uu_tien, phan_tram_giam_combo) VALUES (?, ?, ?, ?)", args: ["IPAD-AIR6", "PK-ANKER-65W", 1, 15] },

    // 7. Khách hàng thành viên mẫu
    {
      sql: "INSERT INTO tbl_KhachHang VALUES (?, ?, ?, ?, ?)",
      args: ["KH-001", "0988123456", "Đỗ Minh Tuấn", 240, "Vang"],
    },
    {
      sql: "INSERT INTO tbl_KhachHang VALUES (?, ?, ?, ?, ?)",
      args: ["KH-002", "0912345678", "Nguyễn Lan Anh", 520, "KimCuong"],
    },
    {
      sql: "INSERT INTO tbl_KhachHang VALUES (?, ?, ?, ?, ?)",
      args: ["KH-003", "0977888999", "Vũ Quốc Khánh", 85, "Bac"],
    },

    // 8. Hóa đơn lịch sử tại 3 chi nhánh (để Dashboard có biểu đồ thực tế ngay khi mở)
    {
      sql: "INSERT INTO tbl_HoaDon VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["HD-202601", "CN-CG", "NV-001", "KH-001", hoursAgoISO(5), 34830000, 182500, 100000, 0, null, 34547500, "VietQR", "FT2631099881", "DaThanhToan"],
    },
    {
      sql: "INSERT INTO tbl_ChiTietHoaDon (ma_hoa_don, ma_san_pham, ma_imei, so_luong, don_gia_ban, tien_giam_combo, thanh_tien) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: ["HD-202601", "IP16PM-256", "356892110294801", 1, 33990000, 0, 33990000],
    },
    {
      sql: "INSERT INTO tbl_ChiTietHoaDon (ma_hoa_don, ma_san_pham, ma_imei, so_luong, don_gia_ban, tien_giam_combo, thanh_tien) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: ["HD-202601", "PK-AP-20W", null, 1, 550000, 110000, 440000],
    },
    {
      sql: "INSERT INTO tbl_ChiTietHoaDon (ma_hoa_don, ma_san_pham, ma_imei, so_luong, don_gia_ban, tien_giam_combo, thanh_tien) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: ["HD-202601", "PK-CL-IPPM", null, 1, 290000, 72500, 217500],
    },

    {
      sql: "INSERT INTO tbl_HoaDon VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["HD-202602", "CN-DD", "NV-003", "KH-002", hoursAgoISO(3), 28340000, 127500, 0, 0, null, 28212500, "VietQR", "FT2631099882", "DaThanhToan"],
    },
    {
      sql: "INSERT INTO tbl_ChiTietHoaDon (ma_hoa_don, ma_san_pham, ma_imei, so_luong, don_gia_ban, tien_giam_combo, thanh_tien) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: ["HD-202602", "MB-AIR-M3", "359001293847100", 1, 27490000, 0, 27490000],
    },
    {
      sql: "INSERT INTO tbl_ChiTietHoaDon (ma_hoa_don, ma_san_pham, ma_imei, so_luong, don_gia_ban, tien_giam_combo, thanh_tien) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: ["HD-202602", "PK-TOMTOC-14", null, 1, 850000, 127500, 722500],
    },

    {
      sql: "INSERT INTO tbl_HoaDon VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: ["HD-202603", "CN-HD", "NV-005", "KH-003", hoursAgoISO(26), 26490000, 0, 0, 4500000, "Thu cũ Galaxy S21 FE Loại B", 21990000, "TienMat", null, "DaThanhToan"],
    },
    {
      sql: "INSERT INTO tbl_ChiTietHoaDon (ma_hoa_don, ma_san_pham, ma_imei, so_luong, don_gia_ban, tien_giam_combo, thanh_tien) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: ["HD-202603", "SS-S24U-256", "358119203948500", 1, 26490000, 0, 26490000],
    },

    // 9. Bảo hành điện tử mẫu (E-Warranty)
    {
      sql: "INSERT INTO tbl_BaoHanh_DienTu VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [
        "BH-356892110294801",
        "356892110294801",
        "HD-202601",
        "0988123456",
        daysAgoDate(0),
        daysFromNowDate(365),
        "ConHan",
        JSON.stringify([]),
      ],
    },
    {
      sql: "INSERT INTO tbl_BaoHanh_DienTu VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [
        "BH-359001293847100",
        "359001293847100",
        "HD-202602",
        "0912345678",
        daysAgoDate(0),
        daysFromNowDate(365),
        "ConHan",
        JSON.stringify([]),
      ],
    },
    {
      sql: "INSERT INTO tbl_BaoHanh_DienTu VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [
        "BH-358119203948500",
        "358119203948500",
        "HD-202603",
        "0977888999",
        daysAgoDate(35),
        daysFromNowDate(330),
        "ConHan",
        JSON.stringify([
          {
            ngay_tiep_nhan: daysAgoDate(10),
            mo_ta_loi: "Vệ sinh cổng sạc Type-C & cập nhật firmware OneUI",
            ky_thuat_vien: "Trần Thị Bình",
            ket_qua_xu_ly: "Đã xử lý miễn phí và bàn giao trong ngày",
          },
        ]),
      ],
    },

    // 10. Phiếu điều chuyển mẫu (1 đang vận chuyển, 1 chờ duyệt)
    {
      sql: "INSERT INTO tbl_PhieuDieuChuyen VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [
        "TRF-202601",
        "CN-DD",
        "CN-CG",
        "ASUS-ZEN14",
        "352091827364509",
        "Nguyễn Văn An (Cầu Giấy)",
        "Lê Hoàng Cường (Đống Đa)",
        hoursAgoISO(4),
        hoursAgoISO(2),
        "InTransit",
        "Điều chuyển phục vụ khách đặt cọc tại Cầu Giấy",
      ],
    },
    {
      sql: "INSERT INTO tbl_PhieuDieuChuyen VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [
        "TRF-202602",
        "CN-HD",
        "CN-CG",
        "IP14-128",
        null,
        "Nguyễn Văn An (Cầu Giấy)",
        null,
        hoursAgoISO(1),
        hoursAgoISO(1),
        "Pending",
        "Đề xuất luân chuyển máy tồn lâu từ Hà Đông về Cầu Giấy dễ bán hơn",
      ],
    },

    // 11. Cấu hình Ngân hàng thụ hưởng cho VietQR động
    { sql: "INSERT INTO tbl_CauHinhHeThong VALUES (?, ?)", args: ["bank_bin", "970422"] },
    { sql: "INSERT INTO tbl_CauHinhHeThong VALUES (?, ?)", args: ["bank_short_name", "MB Bank"] },
    { sql: "INSERT INTO tbl_CauHinhHeThong VALUES (?, ?)", args: ["bank_account_no", "09881239999"] },
    { sql: "INSERT INTO tbl_CauHinhHeThong VALUES (?, ?)", args: ["bank_account_name", "SMARTTECH STORE"] },
  ];

  await db.batch(statements, "write");
}
