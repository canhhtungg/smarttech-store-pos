"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Branch, Staff } from "@/types/domain";

interface AppSessionContextValue {
  branches: Branch[];
  staffList: Staff[];
  currentBranch: Branch;
  currentStaff: Staff;
  setBranchById: (branchId: string) => void;
  setStaffById: (staffId: string) => void;
  refreshSessionCatalog: () => Promise<void>;
}

const DEFAULT_BRANCH: Branch = {
  ma_chi_nhanh: "CN-CG",
  ten_chi_nhanh: "SmartTech Cầu Giấy",
  dia_chi: "144 Xuân Thủy, Cầu Giấy, Hà Nội",
  so_dien_thoai: "02438881111",
};

const DEFAULT_STAFF: Staff = {
  ma_nhan_vien: "NV-001",
  ma_chi_nhanh: "CN-CG",
  ho_ten: "Nguyễn Văn An",
  chuc_vu: "Cashier",
  tai_khoan: "cashier.cg",
  so_dien_thoai: "0901112233",
};

const AppSessionContext = createContext<AppSessionContextValue>({
  branches: [DEFAULT_BRANCH],
  staffList: [DEFAULT_STAFF],
  currentBranch: DEFAULT_BRANCH,
  currentStaff: DEFAULT_STAFF,
  setBranchById: () => {},
  setStaffById: () => {},
  refreshSessionCatalog: async () => {},
});

export function AppSessionProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>([DEFAULT_BRANCH]);
  const [staffList, setStaffList] = useState<Staff[]>([DEFAULT_STAFF]);
  const [branchId, setBranchId] = useState<string>("CN-CG");
  const [staffId, setStaffId] = useState<string>("NV-001");

  const refreshSessionCatalog = async () => {
    try {
      const res = await fetch(`/api/bootstrap?branchId=${encodeURIComponent(branchId)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.branches) && data.branches.length > 0) {
        setBranches(data.branches);
      }
      if (Array.isArray(data.staff) && data.staff.length > 0) {
        setStaffList(data.staff);
      }
    } catch {
      // Ignore transient load error during initial boot
    }
  };

  useEffect(() => {
    refreshSessionCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentBranch =
    branches.find((b) => b.ma_chi_nhanh === branchId) ?? branches[0] ?? DEFAULT_BRANCH;
  const currentStaff =
    staffList.find((s) => s.ma_nhan_vien === staffId) ?? staffList[0] ?? DEFAULT_STAFF;

  const setBranchById = (newBranchId: string) => {
    setBranchId(newBranchId);
  };

  const setStaffById = (newStaffId: string) => {
    setStaffId(newStaffId);
    const found = staffList.find((s) => s.ma_nhan_vien === newStaffId);
    if (found) {
      setBranchId(found.ma_chi_nhanh);
    }
  };

  return (
    <AppSessionContext.Provider
      value={{
        branches,
        staffList,
        currentBranch,
        currentStaff,
        setBranchById,
        setStaffById,
        refreshSessionCatalog,
      }}
    >
      {children}
    </AppSessionContext.Provider>
  );
}

export function useAppSession() {
  return useContext(AppSessionContext);
}
