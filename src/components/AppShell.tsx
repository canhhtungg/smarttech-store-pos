"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  PackageSearch,
  ArrowLeftRight,
  ShieldCheck,
  BarChart3,
  Settings,
  Store,
  UserCheck,
  Menu,
  X,
  Cpu,
} from "lucide-react";
import { useAppSession } from "@/context/AppSessionContext";
import { ROLE_LABELS } from "@/lib/format";

const NAV_ITEMS = [
  {
    href: "/pos",
    label: "Bán hàng POS",
    sublabel: "Quét IMEI & VietQR",
    icon: ShoppingCart,
  },
  {
    href: "/inventory",
    label: "Kho & Dải IMEI",
    sublabel: "Nhập lô IMEI & SKU",
    icon: PackageSearch,
  },
  {
    href: "/transfers",
    label: "Điều chuyển Chuỗi",
    sublabel: "Tra cứu 3 chi nhánh",
    icon: ArrowLeftRight,
  },
  {
    href: "/warranty",
    label: "Bảo hành Điện tử",
    sublabel: "Tra cứu E-Warranty",
    icon: ShieldCheck,
  },
  {
    href: "/dashboard",
    label: "Báo cáo & Tồn lâu",
    sublabel: "BI & Aging Stock",
    icon: BarChart3,
  },
  {
    href: "/settings",
    label: "Cấu hình VietQR",
    sublabel: "STK Ngân hàng & Demo",
    icon: Settings,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    branches,
    staffList,
    currentBranch,
    currentStaff,
    setBranchById,
    setStaffById,
  } = useAppSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9] text-slate-900">
      {/* Top Operational Header */}
      <header className="no-print sticky top-0 z-30 bg-[#14294B] text-white border-b border-slate-800 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 h-15 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Mở menu điều hướng"
              className="lg:hidden p-2 rounded-md hover:bg-white/10 cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/pos" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <div className="font-bold tracking-tight text-base leading-tight">
                  SmartTech Store
                </div>
                <div className="text-[11px] text-slate-300 leading-tight hidden sm:block">
                  Hệ thống Bán lẻ Thiết bị Công nghệ Thông minh
                </div>
              </div>
            </Link>
          </div>

          {/* Demo Branch & Role Quick Switchers */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-md px-2.5 py-1.5">
              <Store className="w-4 h-4 text-emerald-300 shrink-0" />
              <label htmlFor="branch-select" className="sr-only">
                Chi nhánh làm việc
              </label>
              <select
                id="branch-select"
                value={currentBranch.ma_chi_nhanh}
                onChange={(e) => setBranchById(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium text-white focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.ma_chi_nhanh} value={b.ma_chi_nhanh} className="text-slate-900">
                    {b.ten_chi_nhanh}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden md:flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-md px-2.5 py-1.5">
              <UserCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <label htmlFor="staff-select" className="sr-only">
                Nhân viên & Vai trò
              </label>
              <select
                id="staff-select"
                value={currentStaff.ma_nhan_vien}
                onChange={(e) => setStaffById(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium text-white focus:outline-none cursor-pointer"
              >
                {staffList.map((s) => (
                  <option key={s.ma_nhan_vien} value={s.ma_nhan_vien} className="text-slate-900">
                    {s.ho_ten} — {ROLE_LABELS[s.chuc_vu]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[1600px] w-full mx-auto flex">
        {/* Desktop Sidebar */}
        <aside className="no-print hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-slate-200 py-4 px-3 justify-between">
          <nav className="space-y-1" aria-label="Phân hệ chức năng">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || (pathname === "/" && item.href === "/pos");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                    active
                      ? "bg-[#14294B] text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      active ? "text-blue-300" : "text-slate-500"
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{item.label}</div>
                    <div
                      className={`text-[11px] truncate ${
                        active ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {item.sublabel}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800">Đang trực tại quầy</div>
            <div>{currentBranch.ten_chi_nhanh}</div>
            <div className="text-[11px] text-slate-500">{currentBranch.dia_chi}</div>
            <div className="pt-1 border-t border-slate-200 text-[11px] font-mono text-slate-700">
              NV: {currentStaff.ho_ten} ({ROLE_LABELS[currentStaff.chuc_vu]})
            </div>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="no-print fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50"
              onClick={() => setMobileOpen(false)}
            />
            <nav className="relative w-72 max-w-full bg-white h-full p-4 space-y-1.5 z-50 overflow-y-auto">
              <div className="pb-3 mb-2 border-b border-slate-200 text-xs font-semibold text-slate-500">
                Chuyển nhanh phân hệ
              </div>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                      active
                        ? "bg-[#14294B] text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div
                        className={`text-xs ${
                          active ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {item.sublabel}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main Content Workbench */}
        <main className="flex-1 min-w-0 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
