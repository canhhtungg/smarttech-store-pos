"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react";
import { useAppSession } from "@/context/AppSessionContext";
import { formatDateVN } from "@/lib/format";
import type { EWarrantyRecord } from "@/types/domain";

const SAMPLE_QUERIES = [
  { label: "IMEI: 358119203948500 (S24 Ultra)", value: "358119203948500" },
  { label: "SĐT: 0988123456 (Đỗ Minh Tuấn)", value: "0988123456" },
  { label: "SĐT: 0912345678 (Nguyễn Lan Anh)", value: "0912345678" },
];

export default function WarrantyPage() {
  const { currentStaff } = useAppSession();

  const [query, setQuery] = useState("358119203948500");
  const [records, setRecords] = useState<EWarrantyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchedOnce, setSearchedOnce] = useState(false);

  const [issueTextByImei, setIssueTextByImei] = useState<Record<string, string>>({});
  const [resolutionByImei, setResolutionByImei] = useState<Record<string, string>>({});
  const [busyImei, setBusyImei] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const runSearch = async (targetQuery: string) => {
    const q = targetQuery.trim();
    if (!q) {
      setRecords([]);
      setSearchedOnce(true);
      return;
    }
    setLoading(true);
    setBanner(null);
    try {
      const res = await fetch(`/api/warranty?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok) {
        setRecords(data.records ?? []);
      } else {
        setBanner({ type: "err", text: data.error ?? "Lỗi tra cứu bảo hành." });
      }
    } finally {
      setLoading(false);
      setSearchedOnce(true);
    }
  };

  useEffect(() => {
    runSearch("358119203948500");
  }, []);

  const handleIntake = async (maImei: string) => {
    const desc = (issueTextByImei[maImei] ?? "").trim();
    if (!desc) {
      setBanner({ type: "err", text: "Vui lòng nhập mô tả tình trạng lỗi khi tiếp nhận máy." });
      return;
    }
    setBusyImei(maImei);
    setBanner(null);
    try {
      const res = await fetch("/api/warranty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "intake",
          maImei,
          issueDescription: desc,
          technicianName: currentStaff.ho_ten,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: "err", text: data.error ?? "Không thể tạo phiếu tiếp nhận bảo hành." });
      } else {
        setIssueTextByImei((prev) => ({ ...prev, [maImei]: "" }));
        setBanner({
          type: "ok",
          text: `Đã ghi nhận tiếp nhận bảo hành cho IMEI ${maImei} (Trạng thái kho chuyển sang Đang bảo hành).`,
        });
        await runSearch(query);
      }
    } finally {
      setBusyImei(null);
    }
  };

  const handleCompleteReturn = async (maImei: string) => {
    const note =
      (resolutionByImei[maImei] ?? "").trim() ||
      "Đã kiểm tra, khắc phục kỹ thuật và bàn giao lại thiết bị cho khách hàng";
    setBusyImei(maImei);
    setBanner(null);
    try {
      const res = await fetch("/api/warranty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          maImei,
          resolutionNote: note,
          technicianName: currentStaff.ho_ten,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: "err", text: data.error ?? "Lỗi hoàn tất trả máy bảo hành." });
      } else {
        setResolutionByImei((prev) => ({ ...prev, [maImei]: "" }));
        setBanner({
          type: "ok",
          text: `Đã hoàn tất sửa chữa & bàn giao thiết bị IMEI ${maImei} cho khách hàng.`,
        });
        await runSearch(query);
      }
    } finally {
      setBusyImei(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Lookup Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
            <ShieldCheck className="w-4 h-4" />
            Bảo hành điện tử không giấy tờ (Paperless E-Warranty)
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Cổng Tra Cứu &amp; Tiếp Nhận Bảo Hành Điện Tử Toàn Chuỗi
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Tự động kích hoạt ngay khi thu ngân hoàn tất hóa đơn POS. Tra cứu tức thì theo mã IMEI 15 số hoặc Số điện thoại khách hàng trên mọi chi nhánh.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query);
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập mã IMEI 15 số hoặc SĐT khách hàng (VD: 358119203948500 hoặc 0988123456)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold cursor-pointer"
          >
            <Search className="w-4 h-4" />
            {loading ? "Đang tra cứu..." : "Tra cứu Bảo hành"}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Dữ liệu mẫu thử nhanh:
          </span>
          {SAMPLE_QUERIES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                setQuery(s.value);
                runSearch(s.value);
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium border border-slate-200 cursor-pointer transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {banner && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between gap-3 ${
            banner.type === "ok"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === "ok" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{banner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-xs underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Warranty Results */}
      {searchedOnce && records.length === 0 && !loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500">
          Không tìm thấy sổ bảo hành điện tử nào khớp với từ khóa{" "}
          <strong className="text-slate-800 font-mono">{query}</strong>.
        </div>
      ) : (
        <div className="space-y-5">
          {records.map((rec) => {
            const isReceiving = rec.trang_thai_bao_hanh === "DangTiepNhan";
            const isExpired = rec.trang_thai_bao_hanh === "HetHan";
            const isBusy = busyImei === rec.ma_imei;

            return (
              <div
                key={rec.ma_bao_hanh}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Certificate Top Bar */}
                <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-50/70">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-[#14294B] text-white">
                        {rec.ma_bao_hanh}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          isReceiving
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : isExpired
                              ? "bg-slate-100 text-slate-600 border-slate-300"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {isReceiving
                          ? "Đang tiếp nhận xử lý kỹ thuật"
                          : isExpired
                            ? "Đã hết hạn bảo hành"
                            : `Còn hạn bảo hành (${rec.so_ngay_con_lai} ngày)`}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900">{rec.ten_san_pham}</h2>
                    <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span>
                        IMEI: <strong className="font-mono text-slate-900">{rec.ma_imei}</strong>
                      </span>
                      <span>Hóa đơn gốc: {rec.ma_hoa_don}</span>
                      <span>Chi nhánh bán: {rec.ten_chi_nhanh}</span>
                      <span>
                        Khách hàng:{" "}
                        <strong className="text-slate-800">
                          {rec.ten_khach_hang ?? "Khách lẻ"} ({rec.so_dien_thoai_khach})
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 bg-white px-4 py-3 rounded-xl border border-slate-200">
                    <CalendarClock className="w-6 h-6 text-blue-600" />
                    <div className="text-xs space-y-0.5">
                      <div className="text-slate-500">
                        Kích hoạt:{" "}
                        <strong className="text-slate-800 tabular-nums">
                          {formatDateVN(rec.ngay_kich_hoat)}
                        </strong>
                      </div>
                      <div className="text-slate-500">
                        Hết hạn:{" "}
                        <strong className="text-slate-900 tabular-nums">
                          {formatDateVN(rec.ngay_het_han)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body: History + Technician Intake Form */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Repair History */}
                  <div className="lg:col-span-7 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <ClipboardList className="w-4 h-4 text-slate-600" />
                      Lịch sử tiếp nhận &amp; sửa chữa bảo hành ({rec.lich_su_tiep_nhan.length})
                    </h3>

                    {rec.lich_su_tiep_nhan.length === 0 ? (
                      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
                        Thiết bị hoạt động ổn định, chưa phát sinh lịch sử tiếp nhận bảo hành lần nào.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {rec.lich_su_tiep_nhan.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-semibold text-slate-800">
                              <span>Ngày tiếp nhận: {formatDateVN(item.ngay_tiep_nhan)}</span>
                              <span className="text-slate-500">KTV: {item.ky_thuat_vien}</span>
                            </div>
                            <div className="text-slate-700">
                              <strong>Tình trạng lỗi:</strong> {item.mo_ta_loi}
                            </div>
                            <div className="text-emerald-800 font-medium">
                              <strong>Kết quả xử lý:</strong> {item.ket_qua_xu_ly}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Technician Action Form */}
                  <div className="lg:col-span-5 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <Wrench className="w-4 h-4 text-blue-600" />
                      Nghiệp vụ Kỹ thuật viên ({currentStaff.ho_ten})
                    </div>

                    {!isReceiving ? (
                      <>
                        <p className="text-xs text-slate-600">
                          Ghi nhận máy khách mang tới kiểm tra/sửa chữa bảo hành tại quầy kỹ thuật:
                        </p>
                        <textarea
                          rows={3}
                          value={issueTextByImei[rec.ma_imei] ?? ""}
                          onChange={(e) =>
                            setIssueTextByImei((prev) => ({
                              ...prev,
                              [rec.ma_imei]: e.target.value,
                            }))
                          }
                          placeholder="Mô tả triệu chứng lỗi (VD: Hao pin nhanh, kiểm tra cụm camera sau, vệ sinh loa...)"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <button
                          type="button"
                          disabled={isBusy || isExpired}
                          onClick={() => handleIntake(rec.ma_imei)}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#14294B] hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          Tiếp nhận máy bảo hành
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-amber-800 font-medium">
                          Thiết bị đang ở trạng thái tiếp nhận kỹ thuật. Nhập kết quả xử lý để hoàn tất bàn giao lại máy cho khách:
                        </p>
                        <textarea
                          rows={3}
                          value={resolutionByImei[rec.ma_imei] ?? ""}
                          onChange={(e) =>
                            setResolutionByImei((prev) => ({
                              ...prev,
                              [rec.ma_imei]: e.target.value,
                            }))
                          }
                          placeholder="Kết quả xử lý (VD: Đã thay cáp sạc chính hãng theo tiêu chuẩn bảo hành, test ổn định 100%)..."
                          className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleCompleteReturn(rec.ma_imei)}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Hoàn tất &amp; Bàn giao máy cho khách
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
