"use client";

import React, { useEffect, useState } from "react";
import { QrCode, CheckCircle2, X, Clock, Banknote, Code2 } from "lucide-react";
import { formatVND } from "@/lib/format";

interface VietQRData {
  payload: string;
  qrDataUrl: string;
  bankBin: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  amount: number;
  addInfo: string;
}

interface VietQRModalProps {
  open: boolean;
  qrData: VietQRData | null;
  submitting: boolean;
  onClose: () => void;
  onConfirmPaid: () => void;
  onSwitchToCash: () => void;
}

export function VietQRModal({
  open,
  qrData,
  submitting,
  onClose,
  onConfirmPaid,
  onSwitchToCash,
}: VietQRModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [showPayload, setShowPayload] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSecondsLeft(180);
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12") {
        e.preventDefault();
        onConfirmPaid();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onConfirmPaid, onClose]);

  if (!open || !qrData) return null;

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="px-6 py-4 bg-[#14294B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-emerald-300" />
            <div>
              <h2 className="font-bold text-base">
                Thanh toán Chuyển khoản qua Mã VietQR Động (Chuẩn EMVCo Napas)
              </h2>
              <p className="text-xs text-slate-300">
                Quét bằng mọi ứng dụng Mobile Banking — Tự động điền chính xác số tiền & nội dung
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng mã QR"
            className="p-1.5 rounded hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* QR Image Column */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold tracking-wide text-[#14294B] mb-2">
              VIETQR • NAPAS 247
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrData.qrDataUrl}
              alt={`Mã VietQR thanh toán ${qrData.amount} VNĐ`}
              className="w-60 h-60 rounded-lg border border-slate-200 bg-white p-2"
            />
            <div className="mt-3 flex items-center gap-1.5 text-xs font-mono text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              <span>Giữ khóa IMEI còn: {mins}:{secs}</span>
            </div>
          </div>

          {/* Payment Details Column */}
          <div className="space-y-3.5 text-sm">
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="text-xs text-emerald-800 font-medium">
                Số tiền thanh toán (Tự động điền sẵn)
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-900 mt-0.5">
                {formatVND(qrData.amount)}
              </div>
            </div>

            <div className="space-y-2 border border-slate-200 rounded-lg p-3.5 bg-white">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Ngân hàng nhận:</span>
                <span className="font-semibold text-slate-900">
                  {qrData.bankName} (BIN: {qrData.bankBin})
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Số tài khoản:</span>
                <span className="font-mono font-bold text-slate-900">{qrData.accountNo}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Chủ tài khoản:</span>
                <span className="font-semibold text-slate-900">{qrData.accountName}</span>
              </div>
              <div className="flex justify-between gap-2 pt-2 border-t border-slate-100">
                <span className="text-slate-500">Nội dung CK:</span>
                <span className="font-mono font-bold text-blue-700">{qrData.addInfo}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPayload(!showPayload)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showPayload ? "Ẩn chuỗi EMVCo TLV" : "Xem chuỗi dữ liệu EMVCo + CRC16"}</span>
            </button>

            {showPayload && (
              <div className="p-2.5 rounded bg-slate-900 text-slate-100 font-mono text-[11px] break-all">
                {qrData.payload}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSwitchToCash}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <Banknote className="w-4 h-4 text-slate-600" />
            <span>Đổi sang Tiền mặt</span>
          </button>

          <button
            type="button"
            onClick={onConfirmPaid}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {submitting ? "Đang xuất hóa đơn..." : "Đã nhận tiền thành công"}
            </span>
            <kbd className="ml-1 px-1.5 py-0.5 text-[11px] font-mono bg-emerald-800/70 rounded">
              F12
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
}
