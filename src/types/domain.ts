export type StaffRole = "Cashier" | "Keeper" | "Manager" | "Admin";
export type ProductCategory = "DienThoai" | "Laptop" | "PhuKien";
export type IMEIStatus =
  | "SanSangBan"
  | "KhoaTamThoi"
  | "DangLuanChuyen"
  | "DaBan"
  | "BaoHanh";
export type MemberTier = "ThanhVien" | "Bac" | "Vang" | "KimCuong";
export type PaymentMethod = "VietQR" | "TienMat" | "The";
export type TransferStatus = "Pending" | "InTransit" | "Completed" | "Rejected";

export interface Branch {
  ma_chi_nhanh: string;
  ten_chi_nhanh: string;
  dia_chi: string;
  so_dien_thoai: string;
}

export interface Staff {
  ma_nhan_vien: string;
  ma_chi_nhanh: string;
  ho_ten: string;
  chuc_vu: StaffRole;
  tai_khoan: string;
  so_dien_thoai: string;
}

export interface Product {
  ma_san_pham: string;
  ten_san_pham: string;
  thuong_hieu: string;
  loai_san_pham: ProductCategory;
  cau_hinh_tom_tat: string;
  gia_niem_yet: number;
  gia_khuyen_mai: number | null;
  thoi_gian_bao_hanh_thang: number;
}

export interface DeviceIMEI {
  ma_imei: string;
  ma_san_pham: string;
  ten_san_pham?: string;
  thuong_hieu?: string;
  loai_san_pham?: ProductCategory;
  cau_hinh_tom_tat?: string;
  gia_niem_yet?: number;
  gia_khuyen_mai?: number | null;
  thoi_gian_bao_hanh_thang?: number;
  ma_chi_nhanh: string;
  ten_chi_nhanh?: string;
  so_serial: string | null;
  trang_thai: IMEIStatus;
  ngay_nhap_kho: string;
  gia_nhap: number;
  locked_by: string | null;
  locked_until: string | null;
}

export interface AccessoryRecommendation {
  ma_sp_chinh: string;
  ma_sp_phu_kien: string;
  ten_phu_kien: string;
  thuong_hieu: string;
  cau_hinh_tom_tat: string;
  gia_goc: number;
  phan_tram_giam_combo: number;
  gia_combo: number;
  tiet_kiem: number;
  muc_do_uu_tien: number;
  so_luong_ton: number;
}

export interface TradeInEvaluationInput {
  modelCode: string;
  screenIntact: boolean;
  batteryAbove85: boolean;
  bodyNoMajorDents: boolean;
  biometricsAndAccountClean: boolean;
}

export interface TradeInEvaluationResult {
  modelCode: string;
  modelName: string;
  baseCeilingPrice: number;
  deductionAmount: number;
  finalTradeInValue: number;
  conditionGrade: "Loai A (Dep keng)" | "Loai B (Tray nhe)" | "Loai C (Can sua chua)" | "Tu choi thu mua";
  eligible: boolean;
  notes: string[];
}

export interface Customer {
  ma_khach_hang: string;
  so_dien_thoai: string;
  ho_ten: string;
  diem_tich_luy: number;
  hang_thanh_vien: MemberTier;
}

export interface CheckoutDeviceItem {
  ma_imei: string;
}

export interface CheckoutAccessoryItem {
  ma_san_pham: string;
  so_luong: number;
}

export interface CheckoutInput {
  ma_chi_nhanh: string;
  ma_nhan_vien: string;
  customer_phone?: string;
  customer_name?: string;
  points_to_redeem?: number;
  trade_in_value?: number;
  trade_in_description?: string;
  payment_method: PaymentMethod;
  qr_reference?: string;
  devices: CheckoutDeviceItem[];
  accessories: CheckoutAccessoryItem[];
}

export interface WarrantyHistoryEntry {
  ngay_tiep_nhan: string;
  mo_ta_loi: string;
  ky_thuat_vien: string;
  ket_qua_xu_ly: string;
}

export interface EWarrantyRecord {
  ma_bao_hanh: string;
  ma_imei: string;
  ten_san_pham: string;
  thuong_hieu: string;
  ma_hoa_don: string;
  ten_chi_nhanh: string;
  so_dien_thoai_khach: string;
  ten_khach_hang: string | null;
  ngay_kich_hoat: string;
  ngay_het_han: string;
  so_ngay_con_lai: number;
  trang_thai_bao_hanh: "ConHan" | "HetHan" | "DangTiepNhan";
  lich_su_tiep_nhan: WarrantyHistoryEntry[];
}

export interface TransferTicket {
  ma_phieu_chuyen: string;
  ma_chi_nhanh_xuat: string;
  ten_chi_nhanh_xuat?: string;
  ma_chi_nhanh_nhap: string;
  ten_chi_nhanh_nhap?: string;
  ma_san_pham: string;
  ten_san_pham?: string;
  ma_imei: string | null;
  nguoi_yeu_cau: string;
  nguoi_duyet: string | null;
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai: TransferStatus;
  ghi_chu: string | null;
}

export interface AgingStockAlert {
  ma_imei: string;
  ma_san_pham: string;
  ten_san_pham: string;
  thuong_hieu: string;
  ma_chi_nhanh: string;
  ten_chi_nhanh: string;
  ngay_nhap_kho: string;
  so_ngay_ton: number;
  gia_niem_yet: number;
  gia_khuyen_mai: number | null;
  muc_canh_bao: "RED" | "YELLOW";
  de_xuat_hanh_dong: string;
}

export interface SystemSettings {
  bank_bin: string;
  bank_short_name: string;
  bank_account_no: string;
  bank_account_name: string;
}
