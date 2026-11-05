"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ScanBarcode,
  Sparkles,
  Trash2,
  Plus,
  Minus,
  QrCode,
  Banknote,
  RefreshCw,
  User,
  Check,
  AlertCircle,
  Tag,
  PackagePlus,
} from "lucide-react";
import { useAppSession } from "@/context/AppSessionContext";
import type {
  AccessoryRecommendation,
  Customer,
  DeviceIMEI,
  Product,
} from "@/types/domain";
import type { OrderReceiptDTO } from "@/server/services/OrderService";
import { formatVND, TIER_LABELS } from "@/lib/format";
import { TradeInModal } from "@/components/pos/TradeInModal";
import { VietQRModal } from "@/components/pos/VietQRModal";
import { ReceiptModal } from "@/components/pos/ReceiptModal";

interface CartAccessory {
  ma_san_pham: string;
  ten_san_pham: string;
  gia_niem_yet: number;
  so_luong: number;
  so_luong_ton: number;
}

export default function POSPage() {
  const { currentBranch, currentStaff } = useAppSession();
  const scanInputRef = useRef<HTMLInputElement>(null);

  const [imeiInput, setImeiInput] = useState("");
  const [availableDevices, setAvailableDevices] = useState<DeviceIMEI[]>([]);
  const [branchAccessories, setBranchAccessories] = useState<
    Array<Product & { so_luong_ton: number }>
  >([]);
  const [tradeInModels, setTradeInModels] = useState<
    Array<{ code: string; name: string; ceilingPrice: number }>
  >([]);

  const [cartDevices, setCartDevices] = useState<DeviceIMEI[]>([]);
  const [cartAccessories, setCartAccessories] = useState<CartAccessory[]>([]);
  const [recommendations, setRecommendations] = useState<AccessoryRecommendation[]>([]);

  const [customerPhone, setCustomerPhone] = useState("0988123456");
  const [customerName, setCustomerName] = useState("");
  const [customerRecord, setCustomerRecord] = useState<Customer | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const [tradeInValue, setTradeInValue] = useState(0);
  const [tradeInDesc, setTradeInDesc] = useState("");
  const [tradeInOpen, setTradeInOpen] = useState(false);

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState<{
    payload: string;
    qrDataUrl: string;
    bankBin: string;
    bankName: string;
    accountNo: string;
    accountName: string;
    amount: number;
    addInfo: string;
  } | null>(null);

  const [receipt, setReceipt] = useState<OrderReceiptDTO | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const loadBranchCatalog = useCallback(async () => {
    const res = await fetch(
      `/api/bootstrap?branchId=${encodeURIComponent(currentBranch.ma_chi_nhanh)}`
    );
    if (!res.ok) return;
    const data = await res.json();
    setAvailableDevices(data.availableDevices ?? []);
    setBranchAccessories(data.branchAccessories ?? []);
    setTradeInModels(data.tradeInModels ?? []);
  }, [currentBranch.ma_chi_nhanh]);

  // Reset cart & reload catalog when switching active branch
  useEffect(() => {
    setCartDevices([]);
    setCartAccessories([]);
    setRecommendations([]);
    setTradeInValue(0);
    setTradeInDesc("");
    setErrorBanner(null);
    loadBranchCatalog();
  }, [currentBranch.ma_chi_nhanh, loadBranchCatalog]);

  // Lookup member loyalty info when phone changes
  useEffect(() => {
    const clean = customerPhone.replace(/\s+/g, "").trim();
    if (clean.length < 9) {
      setCustomerRecord(null);
      setPointsToRedeem(0);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/pos/customer?phone=${encodeURIComponent(clean)}`);
      if (!res.ok || cancelled) return;
      const data = await res.json();
      if (!cancelled) {
        setCustomerRecord(data.customer ?? null);
        if (data.customer) {
          setCustomerName(data.customer.ho_ten);
        }
        setPointsToRedeem(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [customerPhone]);

  // Refresh compatible accessory recommendations whenever cart devices change
  useEffect(() => {
    const mainIds = cartDevices.map((d) => d.ma_san_pham);
    if (mainIds.length === 0) {
      setRecommendations([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/pos/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainProductIds: mainIds,
          branchId: currentBranch.ma_chi_nhanh,
        }),
      });
      if (!res.ok || cancelled) return;
      const data = await res.json();
      if (!cancelled) setRecommendations(data.recommendations ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [cartDevices, currentBranch.ma_chi_nhanh]);

  const handleScanImei = async (targetImei?: string) => {
    const raw = (targetImei ?? imeiInput).trim();
    if (!raw) return;
    setErrorBanner(null);

    if (cartDevices.some((d) => d.ma_imei === raw)) {
      setErrorBanner(`Mã IMEI ${raw} đã có trong giỏ hàng hiện tại.`);
      return;
    }

    setLoadingScan(true);
    try {
      const res = await fetch("/api/pos/scan-imei", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imei: raw,
          branchId: currentBranch.ma_chi_nhanh,
          staffId: currentStaff.ma_nhan_vien,
          cartProductIds: cartDevices.map((d) => d.ma_san_pham),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorBanner(data.error || "Không thể quét mã IMEI.");
        return;
      }
      setCartDevices((prev) => [...prev, data.device]);
      setRecommendations(data.recommendations ?? []);
      setImeiInput("");
      await loadBranchCatalog();
    } finally {
      setLoadingScan(false);
    }
  };

  const handleRemoveDevice = async (imei: string) => {
    setCartDevices((prev) => prev.filter((d) => d.ma_imei !== imei));
    await fetch("/api/pos/unlock-imei", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imei, staffId: currentStaff.ma_nhan_vien }),
    });
    await loadBranchCatalog();
  };

  const handleAddAccessory = (sku: string) => {
    const found = branchAccessories.find((a) => a.ma_san_pham === sku);
    if (!found) return;
    if (found.so_luong_ton <= 0) {
      setErrorBanner(`Phụ kiện '${found.ten_san_pham}' đã hết hàng tại chi nhánh.`);
      return;
    }

    setCartAccessories((prev) => {
      const existing = prev.find((item) => item.ma_san_pham === sku);
      if (existing) {
        if (existing.so_luong >= found.so_luong_ton) return prev;
        return prev.map((item) =>
          item.ma_san_pham === sku ? { ...item, so_luong: item.so_luong + 1 } : item
        );
      }
      return [
        ...prev,
        {
          ma_san_pham: found.ma_san_pham,
          ten_san_pham: found.ten_san_pham,
          gia_niem_yet: found.gia_khuyen_mai ?? found.gia_niem_yet,
          so_luong: 1,
          so_luong_ton: found.so_luong_ton,
        },
      ];
    });
  };

  const handleUpdateAccessoryQty = (sku: string, delta: number) => {
    setCartAccessories((prev) =>
      prev
        .map((item) => {
          if (item.ma_san_pham !== sku) return item;
          const nextQty = Math.min(item.so_luong_ton, item.so_luong + delta);
          return { ...item, so_luong: nextQty };
        })
        .filter((item) => item.so_luong > 0)
    );
  };

  // Pricing totals calculation mirroring OrderService
  const comboMap = useMemo(
    () => new Map(recommendations.map((r) => [r.ma_sp_phu_kien, r])),
    [recommendations]
  );

  const totals = useMemo(() => {
    let subtotal = 0;
    let comboDiscount = 0;

    for (const dev of cartDevices) {
      subtotal += dev.gia_khuyen_mai ?? dev.gia_niem_yet ?? 0;
    }

    for (const acc of cartAccessories) {
      subtotal += acc.gia_niem_yet * acc.so_luong;
      const rule = comboMap.get(acc.ma_san_pham);
      if (rule && cartDevices.length > 0) {
        const unitDisc = Math.round((acc.gia_niem_yet * rule.phan_tram_giam_combo) / 100);
        comboDiscount += unitDisc * acc.so_luong;
      }
    }

    const pointDiscount = Math.max(0, pointsToRedeem * 1000);
    const grandTotal = Math.max(0, subtotal - comboDiscount - pointDiscount - tradeInValue);
    return {
      subtotal,
      comboDiscount,
      pointDiscount,
      grandTotal,
    };
  }, [cartDevices, cartAccessories, comboMap, pointsToRedeem, tradeInValue]);

  const executeCheckout = useCallback(
    async (method: "VietQR" | "TienMat", qrRef?: string) => {
      if (cartDevices.length === 0 && cartAccessories.length === 0) {
        setErrorBanner("Giỏ hàng đang trống. Vui lòng chọn thiết bị IMEI hoặc phụ kiện.");
        return;
      }
      setSubmittingOrder(true);
      setErrorBanner(null);
      try {
        const res = await fetch("/api/pos/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ma_chi_nhanh: currentBranch.ma_chi_nhanh,
            ma_nhan_vien: currentStaff.ma_nhan_vien,
            customer_phone: customerPhone.trim() || undefined,
            customer_name: customerName.trim() || undefined,
            points_to_redeem: pointsToRedeem,
            trade_in_value: tradeInValue,
            trade_in_description: tradeInDesc || undefined,
            payment_method: method,
            qr_reference: qrRef,
            devices: cartDevices.map((d) => ({ ma_imei: d.ma_imei })),
            accessories: cartAccessories.map((a) => ({
              ma_san_pham: a.ma_san_pham,
              so_luong: a.so_luong,
            })),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorBanner(data.error || "Thanh toán thất bại.");
          return;
        }
        setQrModalOpen(false);
        setReceipt(data.receipt);
        setCartDevices([]);
        setCartAccessories([]);
        setRecommendations([]);
        setPointsToRedeem(0);
        setTradeInValue(0);
        setTradeInDesc("");
        await loadBranchCatalog();
      } finally {
        setSubmittingOrder(false);
      }
    },
    [
      cartDevices,
      cartAccessories,
      currentBranch.ma_chi_nhanh,
      currentStaff.ma_nhan_vien,
      customerPhone,
      customerName,
      pointsToRedeem,
      tradeInValue,
      tradeInDesc,
      loadBranchCatalog,
    ]
  );

  const openVietQRCheckout = useCallback(async () => {
    if (cartDevices.length === 0 && cartAccessories.length === 0) {
      setErrorBanner("Giỏ hàng đang trống. Vui lòng quét mã IMEI trước khi tạo mã VietQR.");
      return;
    }
    setErrorBanner(null);
    const draftOrderCode = `HD${Date.now().toString().slice(-6)}`;
    const res = await fetch("/api/pos/vietqr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: totals.grandTotal,
        orderId: draftOrderCode,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorBanner(data.error || "Lỗi tạo mã VietQR động.");
      return;
    }
    setQrData(data);
    setQrModalOpen(true);
  }, [cartDevices.length, cartAccessories.length, totals.grandTotal]);

  // Hardware POS Keyboard Shortcuts: F2 (Focus Scanner), F8 (Cash), F10 (VietQR)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (qrModalOpen || tradeInOpen || receipt) return;
      if (e.key === "F2") {
        e.preventDefault();
        scanInputRef.current?.focus();
      } else if (e.key === "F8") {
        e.preventDefault();
        executeCheckout("TienMat");
      } else if (e.key === "F10") {
        e.preventDefault();
        openVietQRCheckout();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [qrModalOpen, tradeInOpen, receipt, executeCheckout, openVietQRCheckout]);

  const unaddedDevices = useMemo(
    () =>
      availableDevices.filter(
        (d) => !cartDevices.some((inCart) => inCart.ma_imei === d.ma_imei)
      ),
    [availableDevices, cartDevices]
  );

  return (
    <div className="space-y-5">
      {/* Page Header & Shortcut Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Quầy Thu ngân Thông minh (Smart POS)
          </h1>
          <p className="text-xs text-slate-600">
            Quét mã IMEI 15 số để tự động khóa máy tạm thời và kích hoạt gợi ý phụ kiện tương thích
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
          <span className="px-2 py-1 rounded bg-white border border-slate-200 font-mono">
            F2: Quét IMEI
          </span>
          <span className="px-2 py-1 rounded bg-white border border-slate-200 font-mono">
            F8: Tiền mặt
          </span>
          <span className="px-2 py-1 rounded bg-white border border-slate-200 font-mono">
            F10: VietQR Động
          </span>
        </div>
      </div>

      {errorBanner && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorBanner(null)}
            className="text-xs font-semibold underline cursor-pointer shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Two-Column POS Workbench */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 7 Cols: Scanner, Quick IMEI Picker, Active Cart & Customer Loyalty */}
        <div className="xl:col-span-7 space-y-4">
          {/* Barcode / IMEI Scan Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleScanImei();
              }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <div className="relative flex-1">
                <ScanBarcode className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={scanInputRef}
                  type="text"
                  value={imeiInput}
                  onChange={(e) => setImeiInput(e.target.value)}
                  placeholder="Quét hoặc nhập mã IMEI 15 chữ số (VD: 356892110294811)..."
                  aria-label="Nhập mã IMEI thiết bị"
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button
                type="submit"
                disabled={loadingScan}
                className="px-5 py-2.5 rounded-lg bg-[#14294B] text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 cursor-pointer shrink-0"
              >
                {loadingScan ? "Đang kiểm tra..." : "Quét & Khóa IMEI"}
              </button>
            </form>

            {/* Quick-Select Available IMEI Chips for Fast Live Demo */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-500 mb-2">
                 Chọn nhanh thiết bị đang sẵn hàng tại {currentBranch.ten_chi_nhanh} ({unaddedDevices.length} máy):
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {unaddedDevices.map((dev) => (
                  <button
                    key={dev.ma_imei}
                    type="button"
                    onClick={() => handleScanImei(dev.ma_imei)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-xs text-left transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                      {dev.ten_san_pham}
                    </span>
                    <span className="font-mono text-[11px] text-blue-700">
                      #{dev.ma_imei.slice(-6)}
                    </span>
                    {dev.gia_khuyen_mai && (
                      <span className="px-1 py-0.2 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">
                        Xả kho
                      </span>
                    )}
                  </button>
                ))}
                {unaddedDevices.length === 0 && (
                  <span className="text-xs text-slate-400 italic">
                    Tất cả máy sẵn bán của chi nhánh đã nằm trong giỏ hoặc hết hàng.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Active Cart Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-800">
                Giỏ hàng đang xử lý ({cartDevices.length + cartAccessories.length} dòng sản phẩm)
              </h2>
              {/* Standalone Accessory Dropdown */}
              <div className="flex items-center gap-1.5">
                <PackagePlus className="w-4 h-4 text-slate-500" />
                <select
                  value=""
                  aria-label="Thêm phụ kiện lẻ vào giỏ"
                  onChange={(e) => {
                    if (e.target.value) handleAddAccessory(e.target.value);
                  }}
                  className="text-xs border border-slate-300 rounded-md px-2 py-1 bg-white text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="">+ Thêm phụ kiện lẻ (SKU)...</option>
                  {branchAccessories.map((acc) => (
                    <option key={acc.ma_san_pham} value={acc.ma_san_pham}>
                      {acc.ten_san_pham} ({formatVND(acc.gia_niem_yet)} • Tồn: {acc.so_luong_ton})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {cartDevices.length === 0 && cartAccessories.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <ScanBarcode className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="text-sm font-semibold text-slate-600">
                  Chưa có sản phẩm nào trong đơn hàng
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Bấm vào bất kỳ thẻ máy nào ở khung trên hoặc quét mã IMEI để xem hệ thống tự động gợi ý Combo phụ kiện tương thích.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {cartDevices.map((dev) => {
                  const activePrice = dev.gia_khuyen_mai ?? dev.gia_niem_yet ?? 0;
                  return (
                    <div
                      key={dev.ma_imei}
                      className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50/60"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-slate-900">
                          {dev.ten_san_pham}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            IMEI: {dev.ma_imei}
                          </span>
                          <span className="text-slate-500">
                            Bảo hành điện tử: {dev.thoi_gian_bao_hanh_thang ?? 12} tháng
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-mono font-bold text-sm text-slate-900">
                            {formatVND(activePrice)}
                          </div>
                          {dev.gia_khuyen_mai && dev.gia_niem_yet && (
                            <div className="font-mono text-xs line-through text-slate-400">
                              {formatVND(dev.gia_niem_yet)}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDevice(dev.ma_imei)}
                          aria-label={`Xóa thiết bị ${dev.ma_imei}`}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {cartAccessories.map((acc) => {
                  const rule = comboMap.get(acc.ma_san_pham);
                  const hasCombo = Boolean(rule && cartDevices.length > 0);
                  const unitDisc =
                    hasCombo && rule
                      ? Math.round((acc.gia_niem_yet * rule.phan_tram_giam_combo) / 100)
                      : 0;
                  const finalLine = (acc.gia_niem_yet - unitDisc) * acc.so_luong;

                  return (
                    <div
                      key={acc.ma_san_pham}
                      className="p-4 flex items-center justify-between gap-3 bg-amber-50/20"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="font-semibold text-sm text-slate-900 truncate">
                          {acc.ten_san_pham}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono text-slate-500">SKU: {acc.ma_san_pham}</span>
                          {hasCombo && rule && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                              <Tag className="w-3 h-3" />
                              Combo -{rule.phan_tram_giam_combo}% (-
                              {formatVND(unitDisc * acc.so_luong)})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                          <button
                            type="button"
                            onClick={() => handleUpdateAccessoryQty(acc.ma_san_pham, -1)}
                            aria-label="Giảm số lượng"
                            className="p-1.5 hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 font-mono text-xs font-bold">
                            {acc.so_luong}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateAccessoryQty(acc.ma_san_pham, 1)}
                            aria-label="Tăng số lượng"
                            className="p-1.5 hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right min-w-[105px]">
                          <div className="font-mono font-bold text-sm text-slate-900">
                            {formatVND(finalLine)}
                          </div>
                          {hasCombo && (
                            <div className="font-mono text-[11px] line-through text-slate-400">
                              {formatVND(acc.gia_niem_yet * acc.so_luong)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Customer Loyalty & Smart Trade-In Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-2xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="cust-phone"
                  className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Khách hàng Hội viên & Bảo hành ĐT</span>
                </label>
                <div className="flex gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setCustomerPhone("0988123456")}
                    className="text-blue-700 hover:underline cursor-pointer font-mono"
                  >
                    0988123456
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setCustomerPhone("0912345678")}
                    className="text-blue-700 hover:underline cursor-pointer font-mono"
                  >
                    0912345678
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  id="cust-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="SĐT khách hàng..."
                  className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Họ tên khách..."
                  aria-label="Họ tên khách hàng"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {customerRecord && (
                <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-blue-950">
                      {TIER_LABELS[customerRecord.hang_thanh_vien]} •{" "}
                      {customerRecord.diem_tich_luy} điểm
                    </div>
                    <div className="text-[11px] text-blue-700">
                      1 điểm = 1.000 ₫ khấu trừ trực tiếp
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPointsToRedeem(
                        pointsToRedeem > 0 ? 0 : Math.min(customerRecord.diem_tich_luy, 200)
                      )
                    }
                    className="px-2.5 py-1 rounded bg-blue-700 text-white font-semibold hover:bg-blue-800 cursor-pointer"
                  >
                    {pointsToRedeem > 0
                      ? `Bỏ dùng (${pointsToRedeem}đ)`
                      : `Dùng ${Math.min(customerRecord.diem_tich_luy, 200)} điểm`}
                  </button>
                </div>
              )}
            </div>

            {/* Smart Trade-In Valuation Box */}
            <div className="space-y-2.5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
              <div>
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                  <span>Thu cũ đổi mới (Smart Trade-In)</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Định giá máy cũ theo 4 tiêu chí kỹ thuật & trừ thẳng vào tổng hóa đơn.
                </p>
              </div>

              {tradeInValue > 0 ? (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-emerald-900">{tradeInDesc}</div>
                    <div className="font-mono font-bold text-emerald-700">
                      -{formatVND(tradeInValue)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTradeInValue(0);
                      setTradeInDesc("");
                    }}
                    className="text-rose-600 font-semibold hover:underline cursor-pointer"
                  >
                    Gỡ bỏ
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setTradeInOpen(true)}
                  className="w-full py-2.5 px-3 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  + Mở công cụ thẩm định giá máy thu cũ
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Smart Compatible Accessories Tray & Payment Summary */}
        <div className="xl:col-span-5 space-y-4">
          {/* Smart Recommendation Engine Card */}
          <div className="bg-white rounded-xl border border-amber-300/80 overflow-hidden shadow-2xs">
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h2 className="font-bold text-sm text-amber-950">
                  Gợi ý Phụ kiện Tương thích (Ưu đãi Combo)
                </h2>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
                Cross-sell Engine
              </span>
            </div>

            <div className="p-4 space-y-2.5">
              {recommendations.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Quét hoặc chọn một chiếc Điện thoại / Laptop bên trái để hệ thống tự động lọc đúng củ sạc, ốp lưng, kính cường lực hoặc túi chống sốc tương thích.
                </div>
              ) : (
                recommendations.map((rec) => {
                  const alreadyInCart = cartAccessories.some(
                    (a) => a.ma_san_pham === rec.ma_sp_phu_kien
                  );
                  return (
                    <div
                      key={rec.ma_sp_phu_kien}
                      className={`p-3 rounded-lg border transition-colors flex items-center justify-between gap-3 ${
                        alreadyInCart
                          ? "bg-emerald-50/50 border-emerald-200"
                          : "bg-white border-slate-200 hover:border-amber-300"
                      }`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                          {rec.ten_phu_kien}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {rec.cau_hinh_tom_tat} • Tồn kho: {rec.so_luong_ton}
                        </div>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="font-mono font-bold text-sm text-amber-800">
                            {formatVND(rec.gia_combo)}
                          </span>
                          <span className="font-mono text-xs line-through text-slate-400">
                            {formatVND(rec.gia_goc)}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700">
                            -{rec.phan_tram_giam_combo}%
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddAccessory(rec.ma_sp_phu_kien)}
                        disabled={rec.so_luong_ton <= 0}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold shrink-0 inline-flex items-center gap-1 cursor-pointer ${
                          alreadyInCart
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-amber-500 text-slate-950 hover:bg-amber-400"
                        } disabled:opacity-40`}
                      >
                        {alreadyInCart ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã chọn (+1)</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Chọn mua</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bill Summary & Checkout Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <h2 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2.5">
              Tổng kết Hóa đơn Thanh toán
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Tổng tiền hàng niêm yết:</span>
                <span className="font-mono font-medium text-slate-900">
                  {formatVND(totals.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Giảm giá mua kèm Combo phụ kiện:</span>
                <span className="font-mono font-semibold">
                  -{formatVND(totals.comboDiscount)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Khấu trừ điểm thưởng hội viên:</span>
                <span className="font-mono font-semibold">
                  -{formatVND(totals.pointDiscount)}
                </span>
              </div>
              <div className="flex justify-between text-blue-700">
                <span>Trợ giá Thu cũ đổi mới (Trade-In):</span>
                <span className="font-mono font-semibold">
                  -{formatVND(tradeInValue)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                <span className="font-bold text-base text-slate-900">KHÁCH CẦN TRẢ:</span>
                <span className="font-mono font-bold text-2xl text-[#14294B]">
                  {formatVND(totals.grandTotal)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                disabled={submittingOrder}
                onClick={() => executeCheckout("TienMat")}
                className="py-3 px-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Banknote className="w-4 h-4 text-slate-600" />
                <span>Tiền mặt</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-200 rounded">
                  F8
                </kbd>
              </button>

              <button
                type="button"
                disabled={submittingOrder}
                onClick={openVietQRCheckout}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Thanh toán VietQR</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-emerald-800 rounded">
                  F10
                </kbd>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TradeInModal
        open={tradeInOpen}
        models={tradeInModels}
        onClose={() => setTradeInOpen(false)}
        onApply={(val, desc) => {
          setTradeInValue(val);
          setTradeInDesc(desc);
        }}
      />

      <VietQRModal
        open={qrModalOpen}
        qrData={qrData}
        submitting={submittingOrder}
        onClose={() => setQrModalOpen(false)}
        onConfirmPaid={() => executeCheckout("VietQR", qrData?.addInfo)}
        onSwitchToCash={() => executeCheckout("TienMat")}
      />

      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
