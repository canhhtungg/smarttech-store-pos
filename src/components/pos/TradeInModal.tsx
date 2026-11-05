"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, X, CheckCircle2, AlertTriangle } from "lucide-react";
import type { TradeInEvaluationResult } from "@/types/domain";
import { formatVND } from "@/lib/format";

interface TradeInModalProps {
  open: boolean;
  models: Array<{ code: string; name: string; ceilingPrice: number }>;
  onClose: () => void;
  onApply: (value: number, description: string) => void;
}

export function TradeInModal({ open, models, onClose, onApply }: TradeInModalProps) {
  const [modelCode, setModelCode] = useState(models[0]?.code ?? "IP14PM-128");
  const [screenIntact, setScreenIntact] = useState(true);
  const [batteryAbove85, setBatteryAbove85] = useState(true);
  const [bodyNoMajorDents, setBodyNoMajorDents] = useState(true);
  const [biometricsAndAccountClean, setBiometricsAndAccountClean] = useState(true);
  const [evaluation, setEvaluation] = useState<TradeInEvaluationResult | null>(null);

  useEffect(() => {
    if (!open || !modelCode) return;
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/pos/trade-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelCode,
          screenIntact,
          batteryAbove85,
          bodyNoMajorDents,
          biometricsAndAccountClean,
        }),
      });
      if (!res.ok || cancelled) return;
      const data = await res.json();
      if (!cancelled) setEvaluation(data.evaluation);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, modelCode, screenIntact, batteryAbove85, bodyNoMajorDents, biometricsAndAccountClean]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
        <div className="px-5 py-4 bg-[#14294B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-amber-300" />
            <h2 className="font-bold text-base">Định giá Thu cũ đổi mới (Smart Trade-In)</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="p-1 rounded hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label htmlFor="tradein-model" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Dòng thiết bị khách mang tới thu cũ
            </label>
            <select
              id="tradein-model"
              value={modelCode}
              onChange={(e) => setModelCode(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {models.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.name} (Giá trần thu mua: {formatVND(m.ceilingPrice)})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5">
            <div className="text-sm font-semibold text-slate-700">
              Bộ tiêu chí kiểm định nhanh tại quầy
            </div>
            {[
              {
                id: "chk-account",
                checked: biometricsAndAccountClean,
                onChange: setBiometricsAndAccountClean,
                label: "Đã thoát hoàn toàn iCloud / Google / MDM & FaceID hoạt động tốt (Bắt buộc)",
              },
              {
                id: "chk-screen",
                checked: screenIntact,
                onChange: setScreenIntact,
                label: "Màn hình nguyên bản, hiển thị đẹp, không ám ố / nứt kính",
              },
              {
                id: "chk-battery",
                checked: batteryAbove85,
                onChange: setBatteryAbove85,
                label: "Dung lượng pin tối đa còn từ 85% trở lên",
              },
              {
                id: "chk-body",
                checked: bodyNoMajorDents,
                onChange: setBodyNoMajorDents,
                label: "Khung viền & mặt lưng đẹp, không cấn móp sâu",
              },
            ].map((item) => (
              <label
                key={item.id}
                htmlFor={item.id}
                className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  id={item.id}
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.onChange(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer"
                />
                <span className="text-sm text-slate-800">{item.label}</span>
              </label>
            ))}
          </div>

          {evaluation && (
            <div
              className={`p-4 rounded-lg border ${
                evaluation.eligible
                  ? "bg-emerald-50/70 border-emerald-200"
                  : "bg-rose-50 border-rose-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-600">
                  Phân hạng thẩm định: {evaluation.conditionGrade}
                </span>
                {evaluation.eligible ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {formatVND(evaluation.finalTradeInValue)}
              </div>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {evaluation.notes.map((n, idx) => (
                  <li key={idx}>• {n}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={!evaluation?.eligible}
            onClick={() => {
              if (!evaluation) return;
              onApply(
                evaluation.finalTradeInValue,
                `Thu cũ ${evaluation.modelName} (${evaluation.conditionGrade})`
              );
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-40 cursor-pointer"
          >
            Áp dụng khấu trừ vào hóa đơn
          </button>
        </div>
      </div>
    </div>
  );
}
