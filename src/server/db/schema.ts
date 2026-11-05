export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS tbl_ChiNhanh (
    ma_chi_nhanh TEXT PRIMARY KEY,
    ten_chi_nhanh TEXT NOT NULL,
    dia_chi TEXT NOT NULL,
    so_dien_thoai TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS tbl_NhanVien (
    ma_nhan_vien TEXT PRIMARY KEY,
    ma_chi_nhanh TEXT NOT NULL REFERENCES tbl_ChiNhanh(ma_chi_nhanh),
    ho_ten TEXT NOT NULL,
    chuc_vu TEXT NOT NULL CHECK (chuc_vu IN ('Cashier', 'Keeper', 'Manager', 'Admin')),
    tai_khoan TEXT NOT NULL UNIQUE,
    so_dien_thoai TEXT NOT NULL,
    mat_khau_hash TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS tbl_SanPham (
    ma_san_pham TEXT PRIMARY KEY,
    ten_san_pham TEXT NOT NULL,
    thuong_hieu TEXT NOT NULL,
    loai_san_pham TEXT NOT NULL CHECK (loai_san_pham IN ('DienThoai', 'Laptop', 'PhuKien')),
    cau_hinh_tom_tat TEXT NOT NULL DEFAULT '',
    gia_niem_yet REAL NOT NULL,
    gia_khuyen_mai REAL,
    thoi_gian_bao_hanh_thang INTEGER NOT NULL DEFAULT 12
  )`,

  `CREATE TABLE IF NOT EXISTS tbl_ThietBi_IMEI (
    ma_imei TEXT PRIMARY KEY,
    ma_san_pham TEXT NOT NULL REFERENCES tbl_SanPham(ma_san_pham),
    ma_chi_nhanh TEXT NOT NULL REFERENCES tbl_ChiNhanh(ma_chi_nhanh),
    so_serial TEXT,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('SanSangBan', 'KhoaTamThoi', 'DangLuanChuyen', 'DaBan', 'BaoHanh')),
    ngay_nhap_kho TEXT NOT NULL,
    gia_nhap REAL NOT NULL,
    locked_by TEXT,
    locked_until TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS tbl_TonKho_PhuKien (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_san_pham TEXT NOT NULL REFERENCES tbl_SanPham(ma_san_pham),
    ma_chi_nhanh TEXT NOT NULL REFERENCES tbl_ChiNhanh(ma_chi_nhanh),
    so_luong_ton INTEGER NOT NULL DEFAULT 0,
    muc_ton_an_toan INTEGER NOT NULL DEFAULT 10,
    UNIQUE(ma_san_pham, ma_chi_nhanh)
  )`,

  `CREATE TABLE IF NOT EXISTS tbl_PhuKien_TuongThich (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_sp_chinh TEXT NOT NULL REFERENCES tbl_SanPham(ma_san_pham),
    ma_sp_phu_kien TEXT NOT NULL REFERENCES tbl_SanPham(ma_san_pham),
    muc_do_uu_tien INTEGER NOT NULL DEFAULT 1,
    phan_tram_giam_combo REAL NOT NULL DEFAULT 15,
    UNIQUE(ma_sp_chinh, ma_sp_phu_kien)
  )`,

  `CREATE TABLE IF NOT EXISTS tbl_KhachHang (
    ma_khach_hang TEXT PRIMARY KEY,
    so_dien_thoai TEXT NOT NULL UNIQUE,
    ho_ten TEXT NOT NULL,
    diem_tich_luy INTEGER NOT NULL DEFAULT 0,
    hang_thanh_vien TEXT NOT NULL DEFAULT 'ThanhVien'
  )`,

  `CREATE TABLE IF NOT EXISTS tbl_HoaDon (
    ma_hoa_don TEXT PRIMARY KEY,
    ma_chi_nhanh TEXT NOT NULL REFERENCES tbl_ChiNhanh(ma_chi_nhanh),
    ma_nhan_vien TEXT NOT NULL REFERENCES tbl_NhanVien(ma_nhan_vien),
    ma_khach_hang TEXT REFERENCES tbl_KhachHang(ma_khach_hang),
    ngay_lap TEXT NOT NULL,
    tong_tien_hang REAL NOT NULL,
    tien_giam_combo REAL NOT NULL DEFAULT 0,
    tien_giam_diem REAL NOT NULL DEFAULT 0,
    tien_thu_cu REAL NOT NULL DEFAULT 0,
    mo_ta_thu_cu TEXT,
    tong_thanh_toan REAL NOT NULL,
    phuong_thuc_tt TEXT NOT NULL CHECK (phuong_thuc_tt IN ('VietQR', 'TienMat', 'The')),
    ma_giao_dich_qr TEXT,
    trang_thai_don TEXT NOT NULL DEFAULT 'DaThanhToan'
  )`,

  `CREATE TABLE IF NOT EXISTS tbl_ChiTietHoaDon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ma_hoa_don TEXT NOT NULL REFERENCES tbl_HoaDon(ma_hoa_don),
    ma_san_pham TEXT NOT NULL REFERENCES tbl_SanPham(ma_san_pham),
    ma_imei TEXT REFERENCES tbl_ThietBi_IMEI(ma_imei),
    so_luong INTEGER NOT NULL DEFAULT 1,
    don_gia_ban REAL NOT NULL,
    tien_giam_combo REAL NOT NULL DEFAULT 0,
    thanh_tien REAL NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS tbl_BaoHanh_DienTu (
    ma_bao_hanh TEXT PRIMARY KEY,
    ma_imei TEXT NOT NULL UNIQUE REFERENCES tbl_ThietBi_IMEI(ma_imei),
    ma_hoa_don TEXT NOT NULL REFERENCES tbl_HoaDon(ma_hoa_don),
    so_dien_thoai_khach TEXT NOT NULL,
    ngay_kich_hoat TEXT NOT NULL,
    ngay_het_han TEXT NOT NULL,
    trang_thai_bao_hanh TEXT NOT NULL DEFAULT 'ConHan',
    lich_su_tiep_nhan TEXT NOT NULL DEFAULT '[]'
  )`,

  `CREATE TABLE IF NOT EXISTS tbl_PhieuDieuChuyen (
    ma_phieu_chuyen TEXT PRIMARY KEY,
    ma_chi_nhanh_xuat TEXT NOT NULL REFERENCES tbl_ChiNhanh(ma_chi_nhanh),
    ma_chi_nhanh_nhap TEXT NOT NULL REFERENCES tbl_ChiNhanh(ma_chi_nhanh),
    ma_san_pham TEXT NOT NULL REFERENCES tbl_SanPham(ma_san_pham),
    ma_imei TEXT REFERENCES tbl_ThietBi_IMEI(ma_imei),
    nguoi_yeu_cau TEXT NOT NULL,
    nguoi_duyet TEXT,
    ngay_tao TEXT NOT NULL,
    ngay_cap_nhat TEXT NOT NULL,
    trang_thai TEXT NOT NULL CHECK (trang_thai IN ('Pending', 'InTransit', 'Completed', 'Rejected')),
    ghi_chu TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS tbl_CauHinhHeThong (
    khoa TEXT PRIMARY KEY,
    gia_tri TEXT NOT NULL
  )`,

  `CREATE INDEX IF NOT EXISTS idx_imei_branch_status ON tbl_ThietBi_IMEI(ma_chi_nhanh, trang_thai)`,
  `CREATE INDEX IF NOT EXISTS idx_imei_product ON tbl_ThietBi_IMEI(ma_san_pham)`,
  `CREATE INDEX IF NOT EXISTS idx_warranty_phone ON tbl_BaoHanh_DienTu(so_dien_thoai_khach)`,
  `CREATE INDEX IF NOT EXISTS idx_invoice_branch_date ON tbl_HoaDon(ma_chi_nhanh, ngay_lap)`,
];

export const DROP_STATEMENTS: string[] = [
  "DROP TABLE IF EXISTS tbl_PhieuDieuChuyen",
  "DROP TABLE IF EXISTS tbl_BaoHanh_DienTu",
  "DROP TABLE IF EXISTS tbl_ChiTietHoaDon",
  "DROP TABLE IF EXISTS tbl_HoaDon",
  "DROP TABLE IF EXISTS tbl_KhachHang",
  "DROP TABLE IF EXISTS tbl_PhuKien_TuongThich",
  "DROP TABLE IF EXISTS tbl_TonKho_PhuKien",
  "DROP TABLE IF EXISTS tbl_ThietBi_IMEI",
  "DROP TABLE IF EXISTS tbl_SanPham",
  "DROP TABLE IF EXISTS tbl_NhanVien",
  "DROP TABLE IF EXISTS tbl_ChiNhanh",
  "DROP TABLE IF EXISTS tbl_CauHinhHeThong",
];
