"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Landmark,
  QrCode,
  RotateCcw,
  Save,
  ShieldAlert,
} from "lucide-react";
import { useAppSession } from "@/context/AppSessionContext";
import { formatVND } from "@/lib/format";
import type { SystemSettings } from "@/types/domain";

interface BankOption {
  bin: string;
  shortName: string;
  fullName: string;
}

interface QRPreviewData {
  payload: string;
  qrDataUrl: string;
  bankBin: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  amount: number;
  addInfo: string;
}

export default function SettingsPage() {
  const { refreshSessionCatalog } = useAppSession();

  const [banks, setBanks] = useState<BankOption[]>([]);
  const [form, setForm] = useState<SystemSettings>({
    bank_bin: "970422",
    bank_short_name: "MB Bank",
    bank_account_no: "09881239999",
    bank_account_name: "SMARTTECH STORE",
  });
  const [testAmount, setTestAmount] = useState<number>(1250000);
  const [qrPreview, setQrPreview] = useState<QRPreviewData | null>(null);

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const generatePreview = useCallback(async (amount: number) => {
    const res = await fetch("/api/pos/vietqr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        orderId: "HD-DEMO-8899",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setQrPreview(data);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    if (res.ok) {
      setBanks(data.banks ?? []);
      if (data.settings) {
        setForm(data.settings);
      }
      await generatePreview(1250000);
    }
  }, [generatePreview]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveBankSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setBanner(null);
    try {
      const selectedBank = banks.find((b) => b.bin === form.bank_bin);
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          bank_short_name: selectedBank?.shortName ?? form.bank_short_name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: "err", text: data.error ?? "Không thể lưu cấu hình ngân hàng." });
      } else {
        setForm(data.settings);
        await generatePreview(testAmount);
        setBanner({
          type: "ok",
          text: "Đã lưu cấu hình tài khoản thụ hưởng VietQR! Mọi mã QR sinh tại quầy POS sẽ áp dụng tài khoản mới ngay lập tức.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    const confirmed = window.confirm(
      "Khôi phục toàn bộ CSDL về trạng thái dữ liệu mẫu ban đầu (3 chi nhánh, 22 thiết bị IMEI, hóa đơn mẫu, phiếu điều chuyển mẫu)?"
    );
    if (!confirmed) return;

    setResetting(true);
    setBanner(null);
    try {
      const res = await fetch("/api/settings/reset-demo", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        await refreshSessionCatalog();
        await loadSettings();
        setBanner({
          type: "ok",
          text: data.message ?? "Đã khôi phục dữ liệu mẫu thành công!",
        });
      } else {
        setBanner({ type: "err", text: data.error ?? "Lỗi khôi phục dữ liệu mẫu." });
      }
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
          <Landmark className="w-4 h-4" />
          Cấu hình hệ thống &amp; Tài khoản thụ hưởng chuỗi
        </div>
        <h1 className="text-xl font-bold text-slate-900 mt-1">
          Thiết Lập Chuẩn VietQR Động (EMVCo Napas 247) &amp; Quản Trị Dữ Liệu Demo
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Hệ thống tự tổng hợp chuỗi TLV EMVCo và mã kiểm tra CRC16-CCITT (`0x1021`) hoàn toàn nội bộ (0đ phí cổng trung gian, không phụ thuộc mạng ngoài khi sinh mã QR).
        </p>
      </div>

      {banner && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-2.5 ${
            banner.type === "ok"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-medium">{banner.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Bank Settings Form */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleSaveBankSettings}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
          >
            <h2 className="text-base font-bold text-slate-900">
              1. Tài khoản Ngân hàng Thụ hưởng của Chuỗi SmartTech
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngân hàng thụ hưởng (Mã BIN Napas 247)
              </label>
              <select
                value={form.bank_bin}
                onChange={(e) => {
                  const bin = e.target.value;
                  const found = banks.find((b) => b.bin === bin);
                  setForm((prev) => ({
                    ...prev,
                    bank_bin: bin,
                    bank_short_name: found?.shortName ?? prev.bank_short_name,
                  }));
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {banks.map((b) => (
                  <option key={b.bin} value={b.bin}>
                    [{b.bin}] {b.shortName} — {b.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số tài khoản nhận tiền
                </label>
                <input
                  type="text"
                  required
                  value={form.bank_account_no}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bank_account_no: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên chủ tài khoản (Không dấu, in hoa)
                </label>
                <input
                  type="text"
                  required
                  value={form.bank_account_name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      bank_account_name: e.target.value.toUpperCase(),
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số tiền thử nghiệm trên mã QR mẫu (VNĐ)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1000}
                  step={50000}
                  value={testAmount}
                  onChange={(e) => setTestAmount(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => generatePreview(testAmount)}
                  className="shrink-0 px-3.5 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  Sinh thử QR
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? "Đang lưu cấu hình..." : "Lưu cấu hình VietQR toàn chuỗi"}
            </button>
          </form>

          {/* Demo Reset Panel */}
          <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-base">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              2. Khôi phục Dữ liệu Mẫu Phục vụ Thuyết trình / Bảo vệ Đồ án
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sau khi thử nghiệm bán hàng, xuất điều chuyển kho hoặc giảm giá xả kho nhiều lần, bạn có thể nhấn nút dưới đây để làm sạch và nạp lại bộ dữ liệu mẫu chuẩn ban đầu chỉ trong 1 giây.
            </p>
            <button
              type="button"
              disabled={resetting}
              onClick={handleResetDemo}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold cursor-pointer"
            >
              <RotateCcw className={`w-4 h-4 ${resetting ? "animate-spin" : ""}`} />
              {resetting
                ? "Đang khôi phục dữ liệu gốc..."
                : "Khôi phục dữ liệu mẫu ban đầu (Reset Demo Data)"}
            </button>
          </div>
        </div>

        {/* Right: Live EMVCo VietQR Preview */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#14294B]">
            <QrCode className="w-4 h-4 text-blue-600" />
            Xem trước Mã VietQR Động (Chuẩn EMVCo + CRC16)
          </div>

          {qrPreview ? (
            <>
              <div className="p-3 rounded-2xl border-2 border-[#14294B] bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrPreview.qrDataUrl}
                  alt="VietQR EMVCo Preview"
                  className="w-56 h-56 object-contain"
                />
              </div>

              <div className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <strong className="text-slate-900">
                    {qrPreview.bankName} (BIN {qrPreview.bankBin})
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <strong className="font-mono text-slate-900">{qrPreview.accountNo}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <strong className="text-slate-900">{qrPreview.accountName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số tiền khóa cứng:</span>
                  <strong className="text-blue-700 tabular-nums">
                    {formatVND(qrPreview.amount)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nội dung CK tự động:</span>
                  <strong className="font-mono text-slate-900">{qrPreview.addInfo}</strong>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[11px] text-slate-500 mb-1">
                    Chuỗi EMVCo TLV Payload (kết thúc bằng Tag `6304` + CRC16):
                  </div>
                  <div className="p-2 rounded bg-slate-900 text-emerald-300 font-mono text-[10px] break-all leading-relaxed">
                    {qrPreview.payload}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-sm text-slate-400">Đang tạo mã QR mẫu...</div>
          )}
        </div>
      </div>
    </div>
  );
}
