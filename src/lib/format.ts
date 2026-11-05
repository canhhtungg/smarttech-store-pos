import type { IMEIStatus, MemberTier, StaffRole, TransferStatus } from "@/types/domain";

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(amount)) + " ₫";
}

export function formatDateTimeVN(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

export function formatDateVN(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.slice(0, 10).split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export const ROLE_LABELS: Record<StaffRole, string> = {
  Cashier: "Thu ngân POS",
  Keeper: "Thủ kho / Kỹ thuật",
  Manager: "Quản lý chi nhánh",
  Admin: "Quản trị chuỗi",
};

export const IMEI_STATUS_META: Record<
  IMEIStatus,
  { label: string; badgeClass: string }
> = {
  SanSangBan: {
    label: "Sẵn sàng bán",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  KhoaTamThoi: {
    label: "Đang giữ tại POS",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  DangLuanChuyen: {
    label: "Đang luân chuyển",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
  },
  DaBan: {
    label: "Đã bán",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
  },
  BaoHanh: {
    label: "Đang bảo hành",
    badgeClass: "bg-rose-50 text-rose-800 border-rose-200",
  },
};

export const TRANSFER_STATUS_META: Record<
  TransferStatus,
  { label: string; badgeClass: string }
> = {
  Pending: {
    label: "Chờ chi nhánh xuất duyệt",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  InTransit: {
    label: "Đang vận chuyển nội bộ",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
  },
  Completed: {
    label: "Đã nhập kho hoàn tất",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  Rejected: {
    label: "Đã từ chối",
    badgeClass: "bg-rose-50 text-rose-800 border-rose-200",
  },
};

export const TIER_LABELS: Record<MemberTier, string> = {
  ThanhVien: "Hạng Thành Viên",
  Bac: "Hạng Bạc",
  Vang: "Hạng Vàng",
  KimCuong: "Hạng Kim Cương",
};
