"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ClipboardCopy,
  Filter,
  PackagePlus,
  RefreshCw,
  Smartphone,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useAppSession } from "@/context/AppSessionContext";
import { formatDateVN, formatVND, IMEI_STATUS_META } from "@/lib/format";
import type { DeviceIMEI, IMEIStatus, Product } from "@/types/domain";

type AccessoryWithStock = Product & {
  so_luong_ton: number;
  muc_ton_an_toan: number;
};

interface ImportImeiResult {
  importedCount: number;
  validImeis: string[];
  rejected: Array<{ imei: string; reason: string }>;
}

export default function InventoryPage() {
  const { currentBranch } = useAppSession();

  const [devices, setDevices] = useState<DeviceIMEI[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [accessories, setAccessories] = useState<AccessoryWithStock[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterProduct, setFilterProduct] = useState<string>("ALL");
  const [searchImei, setSearchImei] = useState<string>("");

  // Batch IMEI import form state
  const [imeiProductId, setImeiProductId] = useState<string>("");
  const [importPrice, setImportPrice] = useState<string>("26000000");
  const [rawImeisText, setRawImeisText] = useState<string>("");
  const [importingImei, setImportingImei] = useState(false);
  const [imeiImportResult, setImeiImportResult] = useState<ImportImeiResult | null>(null);
  const [imeiError, setImeiError] = useState<string | null>(null);

  // Accessory stock import form state
  const [accProductId, setAccProductId] = useState<string>("");
  const [accQuantity, setAccQuantity] = useState<string>("20");
  const [importingAcc, setImportingAcc] = useState(false);
  const [accBanner, setAccBanner] = useState<string | null>(null);

  const [copiedImei, setCopiedImei] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("branchId", currentBranch.ma_chi_nhanh);
      if (filterStatus !== "ALL") params.set("status", filterStatus);
      if (filterProduct !== "ALL") params.set("productId", filterProduct);

      const res = await fetch(`/api/inventory?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setDevices(data.devices ?? []);
        const prods: Product[] = data.products ?? [];
        setProducts(prods);
        setAccessories(data.accessories ?? []);

        const firstDeviceModel = prods.find((p) => p.loai_san_pham !== "PhuKien");
        if (firstDeviceModel && !imeiProductId) {
          setImeiProductId(firstDeviceModel.ma_san_pham);
          setImportPrice(String(Math.round(firstDeviceModel.gia_niem_yet * 0.84)));
        }
        const firstAcc = (data.accessories ?? [])[0] as AccessoryWithStock | undefined;
        if (firstAcc && !accProductId) {
          setAccProductId(firstAcc.ma_san_pham);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [currentBranch.ma_chi_nhanh, filterStatus, filterProduct, imeiProductId, accProductId]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const deviceModels = useMemo(
    () => products.filter((p) => p.loai_san_pham !== "PhuKien"),
    [products]
  );

  const filteredDevices = useMemo(() => {
    const q = searchImei.trim().toLowerCase();
    if (!q) return devices;
    return devices.filter(
      (d) =>
        d.ma_imei.toLowerCase().includes(q) ||
        (d.ten_san_pham ?? "").toLowerCase().includes(q) ||
        (d.so_serial ?? "").toLowerCase().includes(q)
    );
  }, [devices, searchImei]);

  const generateSampleImeis = () => {
    const base = Math.floor(359000000000000 + Math.random() * 900000000000);
    const sample = [
      String(base + 1),
      String(base + 2),
      String(base + 3),
    ].join("\n");
    setRawImeisText(sample);
  };

  const handleImportImeiBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setImeiError(null);
    setImeiImportResult(null);
    if (!imeiProductId) {
      setImeiError("Vui lòng chọn dòng máy Điện thoại / Laptop cần nhập lô.");
      return;
    }
    if (!rawImeisText.trim()) {
      setImeiError("Vui lòng nhập hoặc dán ít nhất 1 mã IMEI (15 chữ số).");
      return;
    }
    setImportingImei(true);
    try {
      const res = await fetch("/api/inventory/import-imei", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: imeiProductId,
          branchId: currentBranch.ma_chi_nhanh,
          importPrice: Number(importPrice) || 0,
          rawImeis: rawImeisText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImeiError(data.error ?? "Không thể nhập lô IMEI.");
      } else {
        setImeiImportResult(data);
        if (data.importedCount > 0) {
          setRawImeisText("");
          await loadInventory();
        }
      }
    } catch {
      setImeiError("Lỗi kết nối máy chủ khi nhập lô IMEI.");
    } finally {
      setImportingImei(false);
    }
  };

  const handleImportAccessory = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccBanner(null);
    if (!accProductId) return;
    setImportingAcc(true);
    try {
      const res = await fetch("/api/inventory/import-accessory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: accProductId,
          branchId: currentBranch.ma_chi_nhanh,
          quantity: Number(accQuantity) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAccBanner(`Lỗi: ${data.error ?? "Không thể cộng tồn kho phụ kiện."}`);
      } else {
        setAccBanner(
          `Đã cộng thêm ${accQuantity} sản phẩm vào kho ${currentBranch.ten_chi_nhanh}. Tồn mới: ${data.so_luong_ton}.`
        );
        await loadInventory();
      }
    } finally {
      setImportingAcc(false);
    }
  };

  const copyImei = async (imei: string) => {
    try {
      await navigator.clipboard.writeText(imei);
      setCopiedImei(imei);
      setTimeout(() => setCopiedImei(null), 1500);
    } catch {
      // Clipboard API unavailable
    }
  };

  const availableCount = devices.filter((d) => d.trang_thai === "SanSangBan").length;
  const lowStockAccCount = accessories.filter((a) => a.so_luong_ton <= a.muc_ton_an_toan).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
            <Boxes className="w-4 h-4" />
            Quản trị kho kép (Dual-Inventory Tracking)
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Kho Thiết Bị IMEI &amp; Phụ Kiện SKU — {currentBranch.ten_chi_nhanh}
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
             Theo dõi đích danh từng cá thể máy qua mã IMEI 15 số và tồn kho số lượng theo mã SKU đối với phụ kiện.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-right">
            <div className="text-[11px] font-medium text-emerald-700">Máy sẵn sàng bán</div>
            <div className="text-lg font-bold text-emerald-900 tabular-nums">{availableCount} máy</div>
          </div>
          <div className="px-3.5 py-2 rounded-lg bg-amber-50 border border-amber-200 text-right">
            <div className="text-[11px] font-medium text-amber-800">Phụ kiện chạm ngưỡng an toàn</div>
            <div className="text-lg font-bold text-amber-900 tabular-nums">{lowStockAccCount} SKU</div>
          </div>
          <button
            type="button"
            onClick={loadInventory}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Import Panels (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Batch IMEI Import */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#14294B] text-white flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Nhập Lô Thiết Bị Theo IMEI (15 chữ số)
                </h2>
                <p className="text-xs text-slate-500">
                  Tự động kiểm tra định dạng 15 số và chặn trùng lặp IMEI trên toàn chuỗi
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={generateSampleImeis}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sinh 3 IMEI mẫu để test
            </button>
          </div>

          <form onSubmit={handleImportImeiBatch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dòng máy (Điện thoại / Laptop)
                </label>
                <select
                  value={imeiProductId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setImeiProductId(pid);
                    const found = deviceModels.find((m) => m.ma_san_pham === pid);
                    if (found) {
                      setImportPrice(String(Math.round(found.gia_niem_yet * 0.84)));
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {deviceModels.map((m) => (
                    <option key={m.ma_san_pham} value={m.ma_san_pham}>
                      [{m.ma_san_pham}] {m.ten_san_pham} ({formatVND(m.gia_khuyen_mai ?? m.gia_niem_yet)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giá vốn nhập kho (VNĐ / máy)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50000}
                  value={importPrice}
                  onChange={(e) => setImportPrice(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Danh sách mã IMEI 15 số (mỗi dòng 1 mã hoặc cách nhau bằng dấu phẩy, hỗ trợ súng bắn mã vạch)
              </label>
              <textarea
                rows={4}
                value={rawImeisText}
                onChange={(e) => setRawImeisText(e.target.value)}
                placeholder={"359112233445501\n359112233445502\n359112233445503"}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {imeiError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{imeiError}</span>
              </div>
            )}

            {imeiImportResult && (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã nhập kho thành công: {imeiImportResult.importedCount} thiết bị
                  </span>
                  {imeiImportResult.rejected.length > 0 && (
                    <span className="text-rose-700">
                      Từ chối: {imeiImportResult.rejected.length} mã
                    </span>
                  )}
                </div>
                {imeiImportResult.rejected.length > 0 && (
                  <ul className="space-y-1 pt-1 border-t border-slate-200 text-rose-800">
                    {imeiImportResult.rejected.map((r, idx) => (
                      <li key={idx} className="font-mono">
                        • {r.imei}: <span className="font-sans">{r.reason}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={importingImei}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold cursor-pointer"
            >
              <PackagePlus className="w-4 h-4" />
              {importingImei ? "Đang kiểm tra & nhập lô..." : `Nhập lô vào ${currentBranch.ten_chi_nhanh}`}
            </button>
          </form>
        </div>

        {/* Accessory SKU Stock Import */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <PackagePlus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Nhập Bổ Sung Phụ Kiện Theo SKU
                </h2>
                <p className="text-xs text-slate-500">
                  Cộng dồn tồn kho phụ kiện phục vụ gợi ý bán chéo Combo tại POS
                </p>
              </div>
            </div>

            <form onSubmit={handleImportAccessory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn mã SKU Phụ kiện
                </label>
                <select
                  value={accProductId}
                  onChange={(e) => setAccProductId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {accessories.map((a) => (
                    <option key={a.ma_san_pham} value={a.ma_san_pham}>
                      [{a.ma_san_pham}] {a.ten_san_pham} — Tồn: {a.so_luong_ton}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số lượng nhập thêm
                </label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={accQuantity}
                  onChange={(e) => setAccQuantity(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {accBanner && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                  {accBanner}
                </div>
              )}

              <button
                type="submit"
                disabled={importingAcc}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#14294B] hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold cursor-pointer"
              >
                <PackagePlus className="w-4 h-4" />
                {importingAcc ? "Đang cập nhật tồn kho..." : "Cộng tồn kho phụ kiện"}
              </button>
            </form>
          </div>

          {/* Accessory Stock Table */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Tồn kho Phụ kiện tại {currentBranch.ten_chi_nhanh}
            </h3>
            <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {accessories.map((acc) => {
                const isLow = acc.so_luong_ton <= acc.muc_ton_an_toan;
                return (
                  <div
                    key={acc.ma_san_pham}
                    className={`px-3 py-2 flex items-center justify-between text-xs ${
                      isLow ? "bg-amber-50/70" : "bg-white"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-slate-800 truncate">{acc.ten_san_pham}</div>
                      <div className="text-slate-500 font-mono text-[11px]">
                        {acc.ma_san_pham} • {formatVND(acc.gia_niem_yet)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold tabular-nums border ${
                          isLow
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {isLow && <AlertTriangle className="w-3 h-3" />}
                        {acc.so_luong_ton} cái
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Device IMEI Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Danh sách cá thể thiết bị IMEI tại {currentBranch.ten_chi_nhanh} ({filteredDevices.length})
            </h2>
            <p className="text-xs text-slate-500">
              Bấm vào biểu tượng sao chép cạnh mã IMEI để dán nhanh sang màn hình Bán hàng POS
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <input
                type="text"
                value={searchImei}
                onChange={(e) => setSearchImei(e.target.value)}
                placeholder="Tìm theo IMEI / tên máy..."
                className="rounded-lg border border-slate-300 pl-3 pr-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="inline-flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm bg-white text-slate-800"
              >
                <option value="ALL">Mọi trạng thái IMEI</option>
                {(Object.keys(IMEI_STATUS_META) as IMEIStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {IMEI_STATUS_META[st].label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm bg-white text-slate-800 max-w-60"
            >
              <option value="ALL">Tất cả dòng máy</option>
              {deviceModels.map((m) => (
                <option key={m.ma_san_pham} value={m.ma_san_pham}>
                  {m.ten_san_pham}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Mã IMEI (15 số)</th>
                <th className="py-3 px-4 font-semibold">Thiết bị</th>
                <th className="py-3 px-4 font-semibold">Ngày nhập</th>
                <th className="py-3 px-4 font-semibold text-right">Giá bán hiện hành</th>
                <th className="py-3 px-4 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    Không tìm thấy thiết bị IMEI nào khớp bộ lọc tại chi nhánh này.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((dev) => {
                  const meta = IMEI_STATUS_META[dev.trang_thai];
                  const activePrice = dev.gia_khuyen_mai ?? dev.gia_niem_yet ?? 0;
                  return (
                    <tr key={dev.ma_imei} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{dev.ma_imei}</span>
                          <button
                            type="button"
                            onClick={() => copyImei(dev.ma_imei)}
                            title="Sao chép mã IMEI"
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            <ClipboardCopy className="w-3.5 h-3.5" />
                          </button>
                          {copiedImei === dev.ma_imei && (
                            <span className="text-[11px] font-sans font-medium text-emerald-700">
                              Đã chép
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {dev.ten_san_pham ?? dev.ma_san_pham}
                        </div>
                        <div className="text-xs text-slate-500">
                          Mã SP: {dev.ma_san_pham} • Serial: {dev.so_serial ?? "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 tabular-nums">
                        {formatDateVN(dev.ngay_nhap_kho)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums">
                        {formatVND(activePrice)}
                        {dev.gia_khuyen_mai && dev.gia_niem_yet && dev.gia_khuyen_mai < dev.gia_niem_yet && (
                          <div className="text-[11px] text-rose-600 font-normal line-through">
                            {formatVND(dev.gia_niem_yet)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
