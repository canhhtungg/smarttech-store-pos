"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowLeftRight,
  Building2,
  CheckCircle2,
  PackageCheck,
  RefreshCw,
  Search,
  Send,
  Truck,
  XCircle,
} from "lucide-react";
import { useAppSession } from "@/context/AppSessionContext";
import { formatDateTimeVN, formatVND, TRANSFER_STATUS_META } from "@/lib/format";
import type { Branch, TransferTicket } from "@/types/domain";

interface CrossBranchMatrixItem {
  ma_san_pham: string;
  ten_san_pham: string;
  thuong_hieu: string;
  loai_san_pham: string;
  cau_hinh_tom_tat: string;
  gia_hien_hanh: number;
  stockByBranch: Record<string, number>;
  availableImeisByBranch: Record<string, string[]>;
  totalChainStock: number;
}

export default function TransfersPage() {
  const { currentBranch, currentStaff } = useAppSession();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [matrix, setMatrix] = useState<CrossBranchMatrixItem[]>([]);
  const [tickets, setTickets] = useState<TransferTicket[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Per-ticket interactive state (selected export IMEI for approval, scanned IMEI for receiving)
  const [selectedExportImei, setSelectedExportImei] = useState<Record<string, string>>({});
  const [scannedReceiveImei, setScannedReceiveImei] = useState<Record<string, string>>({});
  const [busyTicketId, setBusyTicketId] = useState<string | null>(null);

  const loadData = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search?.trim()) params.set("keyword", search.trim());
      const res = await fetch(`/api/transfers?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setBranches(data.branches ?? []);
        const matrixRows: CrossBranchMatrixItem[] = data.matrix ?? [];
        setMatrix(matrixRows);
        const ticketRows: TransferTicket[] = data.tickets ?? [];
        setTickets(ticketRows);

        // Pre-populate default export IMEI for Pending tickets if available
        const nextSelected: Record<string, string> = {};
        for (const t of ticketRows) {
          if (t.trang_thai === "Pending") {
            const prodRow = matrixRows.find((m) => m.ma_san_pham === t.ma_san_pham);
            const candidates = prodRow?.availableImeisByBranch[t.ma_chi_nhanh_xuat] ?? [];
            if (candidates[0]) {
              nextSelected[t.ma_phieu_chuyen] = candidates[0];
            }
          }
        }
        setSelectedExportImei((prev) => ({ ...nextSelected, ...prev }));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRequestTransfer = async (fromBranchId: string, productId: string, productName: string) => {
    setBanner(null);
    if (fromBranchId === currentBranch.ma_chi_nhanh) {
      setBanner({
        type: "err",
        text: "Chi nhánh đang chọn đã là chi nhánh hiện tại của bạn. Hãy chọn chi nhánh khác có tồn kho để xin điều chuyển về.",
      });
      return;
    }

    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromBranchId,
          toBranchId: currentBranch.ma_chi_nhanh,
          productId,
          requesterName: currentStaff.ho_ten,
          note: `Xin điều chuyển ${productName} phục vụ khách tại ${currentBranch.ten_chi_nhanh}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: "err", text: data.error ?? "Không thể tạo phiếu điều chuyển." });
      } else {
        setBanner({
          type: "ok",
          text: `Đã tạo phiếu điều chuyển ${data.ticket.ma_phieu_chuyen} yêu cầu ${productName} về ${currentBranch.ten_chi_nhanh}.`,
        });
        await loadData(keyword);
      }
    } catch {
      setBanner({ type: "err", text: "Lỗi kết nối khi tạo phiếu điều chuyển." });
    }
  };

  const handleApproveExport = async (ticket: TransferTicket) => {
    setBanner(null);
    const imei = selectedExportImei[ticket.ma_phieu_chuyen]?.trim() ?? "";
    if (!imei) {
      setBanner({ type: "err", text: "Vui lòng chọn mã IMEI xuất kho từ danh sách máy khả dụng." });
      return;
    }
    setBusyTicketId(ticket.ma_phieu_chuyen);
    try {
      const res = await fetch(`/api/transfers/${encodeURIComponent(ticket.ma_phieu_chuyen)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          exportImei: imei,
          approverName: currentStaff.ho_ten,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: "err", text: data.error ?? "Lỗi duyệt xuất kho." });
      } else {
        setBanner({
          type: "ok",
          text: `Đã duyệt xuất kho IMEI ${imei} cho phiếu ${ticket.ma_phieu_chuyen} (Trạng thái: Đang vận chuyển nội bộ).`,
        });
        await loadData(keyword);
      }
    } finally {
      setBusyTicketId(null);
    }
  };

  const handleConfirmReceive = async (ticket: TransferTicket) => {
    setBanner(null);
    const scanned = (scannedReceiveImei[ticket.ma_phieu_chuyen] ?? "").trim();
    if (!scanned) {
      setBanner({
        type: "err",
        text: "Vui lòng quét hoặc điền đúng mã IMEI thực tế nhận được để đối soát nhập kho.",
      });
      return;
    }
    setBusyTicketId(ticket.ma_phieu_chuyen);
    try {
      const res = await fetch(`/api/transfers/${encodeURIComponent(ticket.ma_phieu_chuyen)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "receive",
          scannedImei: scanned,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: "err", text: data.error ?? "Đối soát IMEI nhận kho thất bại." });
      } else {
        setBanner({
          type: "ok",
          text: `Đối soát khớp IMEI ${scanned}! Thiết bị đã chuyển quyền sở hữu sang ${ticket.ten_chi_nhanh_nhap ?? ticket.ma_chi_nhanh_nhap} và sẵn sàng bán.`,
        });
        await loadData(keyword);
      }
    } finally {
      setBusyTicketId(null);
    }
  };

  const handleRejectTicket = async (ticket: TransferTicket) => {
    setBanner(null);
    setBusyTicketId(ticket.ma_phieu_chuyen);
    try {
      const res = await fetch(`/api/transfers/${encodeURIComponent(ticket.ma_phieu_chuyen)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          reason: `Từ chối bởi ${currentStaff.ho_ten} (giữ hàng cho khách đặt trước tại chi nhánh xuất)`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBanner({ type: "err", text: data.error ?? "Không thể từ chối phiếu." });
      } else {
        setBanner({ type: "ok", text: `Đã từ chối phiếu điều chuyển ${ticket.ma_phieu_chuyen}.` });
        await loadData(keyword);
      }
    } finally {
      setBusyTicketId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
            <ArrowLeftRight className="w-4 h-4" />
            Liên kết tồn kho thời gian thực giữa các chi nhánh
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Ma Trận Tồn Kho Toàn Chuỗi &amp; Điều Chuyển Nội Bộ
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Chi nhánh đang tác nghiệp:{" "}
            <strong className="text-slate-900">{currentBranch.ten_chi_nhanh}</strong> — Khi hết hàng cục bộ, tạo phiếu rút máy từ chi nhánh lân cận và đối soát bằng IMEI.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadData(keyword)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Đồng bộ tồn kho chuỗi
        </button>
      </div>

      {banner && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between gap-3 ${
            banner.type === "ok"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
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
            className="text-xs underline opacity-75 hover:opacity-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Cross-Branch Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              1. Ma trận Tồn kho Khả dụng (`SanSangBan`) trên toàn chuỗi
            </h2>
            <p className="text-xs text-slate-500">
              Bấm nút <strong>Xin chuyển về {currentBranch.ma_chi_nhanh}</strong> tại ô chi nhánh bạn muốn rút hàng
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadData(keyword);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Lọc theo tên máy / hãng..."
                className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-[#14294B] text-white text-sm font-medium hover:bg-slate-800 cursor-pointer"
            >
              Tìm
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Dòng sản phẩm</th>
                <th className="py-3 px-4 font-semibold text-right">Giá bán</th>
                {branches.map((b) => (
                  <th
                    key={b.ma_chi_nhanh}
                    className={`py-3 px-4 font-semibold text-center ${
                      b.ma_chi_nhanh === currentBranch.ma_chi_nhanh ? "bg-blue-50/80 text-blue-900" : ""
                    }`}
                  >
                    <div className="inline-flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {b.ten_chi_nhanh}
                    </div>
                    {b.ma_chi_nhanh === currentBranch.ma_chi_nhanh && (
                      <div className="text-[10px] font-bold text-blue-600">(Chi nhánh của bạn)</div>
                    )}
                  </th>
                ))}
                <th className="py-3 px-4 font-semibold text-center">Tổng chuỗi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrix.map((row) => (
                <tr key={row.ma_san_pham} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{row.ten_san_pham}</div>
                    <div className="text-xs text-slate-500">
                      {row.ma_san_pham} • {row.cau_hinh_tom_tat}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-800 tabular-nums">
                    {formatVND(row.gia_hien_hanh)}
                  </td>
                  {branches.map((b) => {
                    const count = row.stockByBranch[b.ma_chi_nhanh] ?? 0;
                    const isCurrent = b.ma_chi_nhanh === currentBranch.ma_chi_nhanh;
                    return (
                      <td
                        key={b.ma_chi_nhanh}
                        className={`py-3 px-4 text-center ${isCurrent ? "bg-blue-50/40" : ""}`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <span
                            className={`inline-flex items-center justify-center min-w-12 px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums border ${
                              count > 0
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {count} máy
                          </span>
                          {!isCurrent && count > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRequestTransfer(b.ma_chi_nhanh, row.ma_san_pham, row.ten_san_pham)
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              Xin chuyển về {currentBranch.ma_chi_nhanh}
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-center font-bold text-slate-900 tabular-nums">
                    {row.totalChainStock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Tickets Workflow */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            2. Quy trình Phiếu Điều Chuyển Nội Bộ 3 Bước (`Pending` → `InTransit` → `Completed`)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bước 1: Chi nhánh thiếu hàng tạo yêu cầu • Bước 2: Kho xuất chọn đúng IMEI 15 số để xuất kho (`DangLuanChuyen`) • Bước 3: Kho nhận quét đối soát khớp IMEI để mở bán (`SanSangBan`).
          </p>
        </div>

        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Chưa có phiếu điều chuyển nội bộ nào.
            </div>
          ) : (
            tickets.map((t) => {
              const meta = TRANSFER_STATUS_META[t.trang_thai];
              const prodRow = matrix.find((m) => m.ma_san_pham === t.ma_san_pham);
              const candidateImeis =
                prodRow?.availableImeisByBranch[t.ma_chi_nhanh_xuat] ?? [];
              const isBusy = busyTicketId === t.ma_phieu_chuyen;

              return (
                <div
                  key={t.ma_phieu_chuyen}
                  className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#14294B]">
                        {t.ma_phieu_chuyen}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.badgeClass}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        Cập nhật: {formatDateTimeVN(t.ngay_cap_nhat)}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-900">
                      {t.ten_san_pham ?? t.ma_san_pham}{" "}
                      <span className="font-normal text-slate-600">
                        — Từ{" "}
                        <strong className="text-slate-800">
                          {t.ten_chi_nhanh_xuat ?? t.ma_chi_nhanh_xuat}
                        </strong>{" "}
                        →{" "}
                        <strong className="text-blue-700">
                          {t.ten_chi_nhanh_nhap ?? t.ma_chi_nhanh_nhap}
                        </strong>
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Người yêu cầu: {t.nguoi_yeu_cau}</span>
                      {t.nguoi_duyet && <span>Người xuất kho: {t.nguoi_duyet}</span>}
                      {t.ma_imei && (
                        <span className="font-mono font-semibold text-blue-800">
                          IMEI vận chuyển: {t.ma_imei}
                        </span>
                      )}
                    </div>
                    {t.ghi_chu && <div className="text-xs text-slate-500 italic">Ghi chú: {t.ghi_chu}</div>}
                  </div>

                  {/* Action Controls by State */}
                  {t.trang_thai === "Pending" && (
                    <div className="flex flex-wrap items-center gap-2 shrink-0 bg-white p-3 rounded-lg border border-slate-200">
                      <select
                        value={selectedExportImei[t.ma_phieu_chuyen] ?? ""}
                        onChange={(e) =>
                          setSelectedExportImei((prev) => ({
                            ...prev,
                            [t.ma_phieu_chuyen]: e.target.value,
                          }))
                        }
                        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono bg-white text-slate-900"
                      >
                        {candidateImeis.length === 0 ? (
                          <option value="">Hết IMEI khả dụng tại kho xuất</option>
                        ) : (
                          candidateImeis.map((im) => (
                            <option key={im} value={im}>
                              IMEI xuất: {im}
                            </option>
                          ))
                        )}
                      </select>

                      <button
                        type="button"
                        disabled={isBusy || candidateImeis.length === 0}
                        onClick={() => handleApproveExport(t)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Duyệt &amp; Xuất IMEI
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleRejectTicket(t)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                      >
                        Từ chối
                      </button>
                    </div>
                  )}

                  {t.trang_thai === "InTransit" && (
                    <div className="flex flex-wrap items-center gap-2 shrink-0 bg-white p-3 rounded-lg border border-blue-200">
                      <input
                        type="text"
                        value={scannedReceiveImei[t.ma_phieu_chuyen] ?? ""}
                        onChange={(e) =>
                          setScannedReceiveImei((prev) => ({
                            ...prev,
                            [t.ma_phieu_chuyen]: e.target.value,
                          }))
                        }
                        placeholder="Quét IMEI nhận hàng..."
                        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono text-slate-900 w-44"
                      />
                      {t.ma_imei && (
                        <button
                          type="button"
                          onClick={() =>
                            setScannedReceiveImei((prev) => ({
                              ...prev,
                              [t.ma_phieu_chuyen]: t.ma_imei ?? "",
                            }))
                          }
                          className="px-2 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium cursor-pointer"
                        >
                          Điền nhanh IMEI phiếu
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleConfirmReceive(t)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        Xác nhận Nhập kho
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
