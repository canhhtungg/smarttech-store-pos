"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  Flame,
  Percent,
  Receipt,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { formatDateTimeVN, formatDateVN, formatVND } from "@/lib/format";
import type { AgingStockAlert } from "@/types/domain";

interface DashboardPayload {
  totalRevenue: number;
  totalInvoices: number;
  comboAttachRate: number;
  redAgingCount: number;
  yellowAgingCount: number;
  revenueByBranch: Array<{
    ma_chi_nhanh: string;
    ten_chi_nhanh: string;
    doanh_thu: number;
    so_don: number;
  }>;
  topProducts: Array<{
    ma_san_pham: string;
    ten_san_pham: string;
    so_luong_ban: number;
    doanh_thu: number;
  }>;
  agingAlerts: AgingStockAlert[];
  recentInvoices: Array<{
    ma_hoa_don: string;
    ten_chi_nhanh: string;
    ten_nhan_vien: string;
    ten_khach_hang: string | null;
    ngay_lap: string;
    tong_thanh_toan: number;
    phuong_thuc_tt: string;
    so_san_pham: number;
  }>;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyProduct, setBusyProduct] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (res.ok) {
        setMetrics(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleApplyClearance = async (productId: string, productName: string) => {
    setBusyProduct(productId);
    setBanner(null);
    try {
      const res = await fetch("/api/dashboard/clearance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, discountPercent: 10 }),
      });
      const data = await res.json();
      if (res.ok) {
        setBanner(
          `Đã áp dụng giảm giá xả kho 10% cho dòng máy "${productName}". Giá khuyến mãi mới: ${formatVND(
            data.product.gia_khuyen_mai ?? data.product.gia_niem_yet
          )} (áp dụng đồng bộ ngay tại quầy POS).`
        );
        await loadDashboard();
      }
    } finally {
      setBusyProduct(null);
    }
  };

  const maxBranchRev = Math.max(
    1,
    ...(metrics?.revenueByBranch.map((b) => b.doanh_thu) ?? [1])
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
            <BarChart3 className="w-4 h-4" />
            Business Intelligence &amp; Aging Stock Warning
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Báo Cáo Điều Hành Toàn Chuỗi &amp; Cảnh Báo Hàng Tồn Đọng Vốn
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Tổng hợp doanh thu thời gian thực từ 3 chi nhánh và tự động phát hiện IMEI tồn kho lâu ngày để kích hoạt xả kho giảm khấu hao công nghệ.
          </p>
        </div>
        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Cập nhật số liệu
        </button>
      </div>

      {banner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{banner}</span>
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

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Tổng doanh thu toàn chuỗi</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {formatVND(metrics?.totalRevenue ?? 0)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Tổng hợp thực thu từ 3 chi nhánh Hà Nội
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Số hóa đơn hoàn tất</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {metrics?.totalInvoices ?? 0} đơn
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Đã kích hoạt Bảo hành điện tử tự động
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Tỷ lệ kèm Combo Phụ kiện</span>
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700 mt-2 tabular-nums">
            {metrics?.comboAttachRate ?? 0}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Hiệu quả từ Engine gợi ý bán chéo tại POS
          </div>
        </div>

        <div className="bg-white rounded-xl border border-rose-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-700 uppercase">
            <span>Cảnh báo Tồn kho lâu ngày</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-2xl font-bold text-rose-700 tabular-nums">
              {metrics?.redAgingCount ?? 0} Đỏ
            </span>
            <span className="text-base font-bold text-amber-600 tabular-nums">
              • {metrics?.yellowAgingCount ?? 0} Vàng
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Đỏ: ≥ 60 ngày • Vàng: 45–59 ngày chưa bán
          </div>
        </div>
      </div>

      {/* Charts Row: Revenue by Branch & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#14294B]" />
            <h2 className="text-base font-bold text-slate-900">
               So sánh Doanh thu theo Chi nhánh
            </h2>
          </div>

          <div className="space-y-4">
            {(metrics?.revenueByBranch ?? []).map((b) => {
              const pct = Math.max(6, Math.round((b.doanh_thu / maxBranchRev) * 100));
              return (
                <div key={b.ma_chi_nhanh} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800">
                      {b.ten_chi_nhanh}{" "}
                      <span className="text-xs font-normal text-slate-500">
                        ({b.so_don} hóa đơn)
                      </span>
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatVND(b.doanh_thu)}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Top Dòng Sản Phẩm Đóng Góp Doanh Thu Cao Nhất
          </h2>
          <div className="divide-y divide-slate-100">
            {(metrics?.topProducts ?? []).map((p, idx) => (
              <div
                key={p.ma_san_pham}
                className="py-2.5 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                      {p.ten_san_pham}
                    </div>
                    <div className="text-xs text-slate-500">
                      Mã: {p.ma_san_pham} • Đã bán: {p.so_luong_ban}
                    </div>
                  </div>
                </div>
                <div className="font-bold text-slate-900 tabular-nums shrink-0">
                  {formatVND(p.doanh_thu)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aging Stock Alert Action Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Danh Sách Thiết Bị Cảnh Báo Tồn Kho Lâu Ngày (Aging Stock Alerts)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hàng công nghệ mất giá nhanh theo chu kỳ ra mắt sản phẩm mới. Quản lý có thể kích hoạt giảm giá xả kho 10% chỉ với 1 cú nhấp chuột.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Mức độ</th>
                <th className="py-3 px-4 font-semibold">Thiết bị &amp; IMEI</th>
                <th className="py-3 px-4 font-semibold">Chi nhánh tồn</th>
                <th className="py-3 px-4 font-semibold">Số ngày tồn</th>
                <th className="py-3 px-4 font-semibold text-right">Giá bán hiện tại</th>
                <th className="py-3 px-4 font-semibold">Khuyến nghị thông minh</th>
                <th className="py-3 px-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(metrics?.agingAlerts ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Tuyệt vời! Toàn chuỗi không có thiết bị nào tồn kho quá 45 ngày.
                  </td>
                </tr>
              ) : (
                (metrics?.agingAlerts ?? []).map((item) => {
                  const isRed = item.muc_canh_bao === "RED";
                  const currentPrice = item.gia_khuyen_mai ?? item.gia_niem_yet;
                  const alreadyClearance =
                    item.gia_khuyen_mai !== null &&
                    item.gia_khuyen_mai <= Math.round(item.gia_niem_yet * 0.9);

                  return (
                    <tr
                      key={item.ma_imei}
                      className={isRed ? "bg-rose-50/40 hover:bg-rose-50/70" : "bg-amber-50/30 hover:bg-amber-50/60"}
                    >
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isRed
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : "bg-amber-100 text-amber-900 border-amber-300"
                          }`}
                        >
                          {isRed ? "BÁO ĐỎ (≥60d)" : "CẢNH BÁO VÀNG"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{item.ten_san_pham}</div>
                        <div className="text-xs font-mono text-slate-600">IMEI: {item.ma_imei}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{item.ten_chi_nhanh}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 tabular-nums">
                          {item.so_ngay_ton} ngày
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Nhập: {formatDateVN(item.ngay_nhap_kho)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">
                        <div className="font-bold text-slate-900">{formatVND(currentPrice)}</div>
                        {item.gia_khuyen_mai && item.gia_khuyen_mai < item.gia_niem_yet && (
                          <div className="text-[11px] text-slate-400 line-through">
                            {formatVND(item.gia_niem_yet)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700 max-w-64">
                        {item.de_xuat_hanh_dong}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {alreadyClearance ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đã kích hoạt xả kho
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={busyProduct === item.ma_san_pham}
                            onClick={() =>
                              handleApplyClearance(item.ma_san_pham, item.ten_san_pham)
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                          >
                            <Percent className="w-3.5 h-3.5" />
                            Giảm giá xả kho 10%
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">
            Nhật Ký Hóa Đơn Giao Dịch Gần Nhất Trên Toàn Chuỗi
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Mã HĐ</th>
                <th className="py-3 px-4 font-semibold">Thời gian</th>
                <th className="py-3 px-4 font-semibold">Chi nhánh</th>
                <th className="py-3 px-4 font-semibold">Khách hàng</th>
                <th className="py-3 px-4 font-semibold">Thanh toán</th>
                <th className="py-3 px-4 font-semibold text-right">Thực thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(metrics?.recentInvoices ?? []).map((inv) => (
                <tr key={inv.ma_hoa_don} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-[#14294B]">
                    {inv.ma_hoa_don}
                  </td>
                  <td className="py-3 px-4 text-slate-600 tabular-nums">
                    {formatDateTimeVN(inv.ngay_lap)}
                  </td>
                  <td className="py-3 px-4 text-slate-800">{inv.ten_chi_nhanh}</td>
                  <td className="py-3 px-4 text-slate-700">
                    {inv.ten_khach_hang ?? "Khách vãng lai"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold">
                      {inv.phuong_thuc_tt}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                    {formatVND(inv.tong_thanh_toan)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
