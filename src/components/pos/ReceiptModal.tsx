"use client";

import React from "react";
import { Printer, CheckCircle2, ShieldCheck, X } from "lucide-react";
import type { OrderReceiptDTO } from "@/server/services/OrderService";
import { formatDateTimeVN, formatDateVN, formatVND } from "@/lib/format";

interface ReceiptModalProps {
  receipt: OrderReceiptDTO | null;
  onClose: () => void;
}

export function ReceiptModal({ receipt, onClose }: ReceiptModalProps) {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden my-auto">
        <div className="no-print px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-sm">Thanh toán & Kích hoạt Bảo hành thành công</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hóa đơn"
            className="p-1 rounded hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable K80 Thermal Receipt Body */}
        <div className="print-only-receipt p-6 font-mono text-xs text-slate-900 space-y-3 bg-white">
          <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-3">
            <div className="font-bold text-base">SMARTTECH STORE</div>
            <div>{receipt.ten_chi_nhanh}</div>
            <div className="text-[11px] text-slate-600">{receipt.dia_chi_chi_nhanh}</div>
            <div className="pt-1 font-bold text-sm">HÓA ĐƠN BÁN LẺ KIÊM BẢO HÀNH</div>
          </div>

          <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2.5">
            <div className="flex justify-between">
              <span>Số HĐ:</span>
              <span className="font-bold">{receipt.ma_hoa_don}</span>
            </div>
            <div className="flex justify-between">
              <span>Ngày lập:</span>
              <span>{formatDateTimeVN(receipt.ngay_lap)}</span>
            </div>
            <div className="flex justify-between">
              <span>Thu ngân:</span>
              <span>{receipt.ma_nhan_vien}</span>
            </div>
            {receipt.customer_phone && (
              <div className="flex justify-between">
                <span>Khách hàng:</span>
                <span>
                  {receipt.customer_name} ({receipt.customer_phone})
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Phương thức:</span>
              <span className="font-bold">{receipt.phuong_thuc_tt}</span>
            </div>
          </div>

          <div className="space-y-2 border-b border-dashed border-slate-300 pb-2.5">
            {receipt.lines.map((line, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-bold">{line.ten_san_pham}</div>
                {line.ma_imei && (
                  <div className="text-[11px] text-slate-600">IMEI: {line.ma_imei}</div>
                )}
                <div className="flex justify-between text-[11px]">
                  <span>
                    {line.so_luong} x {formatVND(line.don_gia_ban)}
                    {line.tien_giam_combo > 0 ? ` (-Combo ${formatVND(line.tien_giam_combo)})` : ""}
                  </span>
                  <span className="font-semibold">{formatVND(line.thanh_tien)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Tổng tiền hàng:</span>
              <span>{formatVND(receipt.tong_tien_hang)}</span>
            </div>
            {receipt.tien_giam_combo > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Chiết khấu Combo phụ kiện:</span>
                <span>-{formatVND(receipt.tien_giam_combo)}</span>
              </div>
            )}
            {receipt.tien_giam_diem > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Tiêu điểm thành viên:</span>
                <span>-{formatVND(receipt.tien_giam_diem)}</span>
              </div>
            )}
            {receipt.tien_thu_cu > 0 && (
              <div className="flex justify-between text-blue-700">
                <span>Trợ giá Thu cũ đổi mới:</span>
                <span>-{formatVND(receipt.tien_thu_cu)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-1.5 border-t border-slate-300">
              <span>TỔNG THANH TOÁN:</span>
              <span>{formatVND(receipt.tong_thanh_toan)}</span>
            </div>
            {receipt.points_earned > 0 && (
              <div className="text-[11px] text-slate-600">
                + Cộng thêm {receipt.points_earned} điểm thưởng hội viên
              </div>
            )}
          </div>

          {receipt.warranties.length > 0 && (
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[11px] text-[#14294B]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>CHỨNG NHẬN BẢO HÀNH ĐIỆN TỬ TỰ ĐỘNG</span>
              </div>
              {receipt.warranties.map((w) => (
                <div key={w.ma_bao_hanh} className="text-[11px] space-y-0.5">
                  <div>Mã BH: {w.ma_bao_hanh}</div>
                  <div>Hạn BH: {formatDateVN(w.ngay_kich_hoat)} → {formatDateVN(w.ngay_het_han)}</div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center text-[11px] text-slate-500 pt-2">
            Cảm ơn Quý khách đã mua sắm tại SmartTech Store!
          </div>
        </div>

        <div className="no-print px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In hóa đơn nhiệt K80</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#14294B] text-white text-sm font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Tạo đơn hàng mới
          </button>
        </div>
      </div>
    </div>
  );
}
