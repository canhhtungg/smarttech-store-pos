# SmartTech Store Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with strict TDD (Red-Green-Refactor). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, verify, push to GitHub, and deploy to Vercel the complete SmartTech Store multi-branch POS & inventory system matching `BaoCao_PTTKHTTT_DeTai20_SmartTechStore.docx`.

**Architecture:** Next.js 15 (App Router, TypeScript, Tailwind CSS) hosting both a precision POS/Admin Web UI and a 4-tier OOP backend (`API Route Controllers -> Domain Services -> SQLite/LibSQL Repositories -> Database`). Dual-mode `@libsql/client` persists to `./data/smarttech.db` locally and auto-seeds `/tmp/smarttech.db` on Vercel Serverless (with zero-code upgrade to `TURSO_DATABASE_URL` if configured).

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, `@libsql/client`, `qrcode`, `lucide-react`, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-06-smarttech-store-design.md`

## Global Constraints
- Must implement the 11 normalized 3NF tables (`tbl_ChiNhanh`, `tbl_NhanVien`, `tbl_SanPham`, `tbl_ThietBi_IMEI`, `tbl_TonKho_PhuKien`, `tbl_PhuKien_TuongThich`, `tbl_KhachHang`, `tbl_HoaDon`, `tbl_ChiTietHoaDon`, `tbl_BaoHanh_DienTu`, `tbl_PhieuDieuChuyen`) plus `tbl_CauHinhHeThong`.
- Zero `SQLITE_READONLY` errors on Vercel Serverless: fall back to `/tmp/smarttech.db` when running on Vercel without `TURSO_DATABASE_URL`.
- Offline-capable Napas EMVCo Dynamic VietQR payload with valid `CRC16-CCITT (0x1021, init 0xFFFF)` checksum and locally generated QR Data URL.
- IMEI codes must be strictly 15 digits (`^\d{15}$`) and soft-locked for 10 minutes (`locked_until`) while in a POS cart.
- Vietnamese UI copy using `Be Vietnam Pro` + `JetBrains Mono`, SVG icons only (`lucide-react`), no emojis as icons.

## Review Focus
1. Expired soft-locks (`locked_until < now`) on `tbl_ThietBi_IMEI` must automatically release so abandoned POS carts never permanently block an IMEI from being sold.
2. Scanning or importing an IMEI with whitespace, non-digits, wrong length (`!= 15`), or belonging to another branch (`ma_chi_nhanh != currentBranch`) must return a clear, actionable Vietnamese error message.
3. VietQR `addInfo` (Tag 62) must strip Vietnamese diacritics and special characters and omit Tag 54 if `tong_thanh_toan <= 0`, while keeping CRC16 4-char uppercase hex padded (`padStart(4, '0')`).
4. Redeeming loyalty points (`diem_su_dung`) or Trade-in credit (`tien_thu_cu`) exceeding cart subtotal must clamp `tong_thanh_toan` at `>= 0` and reject spending more points than `khachHang.diem_tich_luy`.
5. Completing an inter-branch transfer with a mismatched scanned IMEI at destination must reject the confirmation and keep the device in `DangLuanChuyen`.

---

### Task 1: Project Scaffolding, Dual-Mode LibSQL Database & Seed Data

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `.gitignore`
- Create: `src/types/domain.ts`
- Create: `src/server/db/client.ts`, `src/server/db/schema.ts`, `src/server/db/seed.ts`
- Test: `tests/db-seed.test.ts`

**Interfaces:**
- Produces: `getDbClient()`, `ensureDatabaseInitialized()`, `resetDatabaseToSeed()`, and domain TypeScript interfaces (`Branch`, `Staff`, `Product`, `DeviceIMEI`, `AccessoryStock`, `CompatibleRule`, `Customer`, `Invoice`, `EWarranty`, `TransferTicket`, `SystemSettings`).

- [ ] **Step 1: Scaffold Next.js + TypeScript + Tailwind + Vitest + `@libsql/client` + `qrcode` + `lucide-react` and write failing `tests/db-seed.test.ts`**
- [ ] **Step 2: Run `npm test` to verify RED failure**
- [ ] **Step 3: Implement `client.ts` (local `./data/smarttech.db` / test `:memory:` / Vercel `/tmp/smarttech.db` + `TURSO_DATABASE_URL`), 3NF DDL `schema.ts`, and realistic 3-branch `seed.ts`**
- [ ] **Step 4: Run `npm test` to verify GREEN**

### Task 2: VietQR EMVCo Service & Smart Trade-In / Recommendation Services (TDD)

**Files:**
- Create: `src/server/repositories/SanPhamRepository.ts`, `src/server/repositories/CauHinhRepository.ts`
- Create: `src/server/services/VietQRService.ts`
- Create: `src/server/services/RecommendationService.ts`
- Create: `src/server/services/TradeInService.ts`
- Test: `tests/vietqr-and-smart-services.test.ts`

**Interfaces:**
- Produces:
  - `VietQRService.computeCRC16(input: string): string`
  - `VietQRService.buildPayload(params: { bin: string; accountNo: string; amount: number; orderId: string }): string`
  - `VietQRService.generateQRDataUrl(params): Promise<{ payload: string; qrDataUrl: string; bankName: string; accountNo: string; accountName: string; amount: number; addInfo: string }>`
  - `RecommendationService.getRecommendationsForCart(productIds: string[], branchId: string)`
  - `TradeInService.evaluateTradeIn(input: TradeInEvaluationInput)`

- [ ] **Step 1: Write failing tests in `tests/vietqr-and-smart-services.test.ts` covering CRC16 padding, diacritic stripping in `addInfo`, compatible accessory combo discounts, and trade-in depreciation**
- [ ] **Step 2: Run `npm test` to verify RED failure**
- [ ] **Step 3: Implement `SanPhamRepository`, `CauHinhRepository`, `VietQRService`, `RecommendationService`, and `TradeInService`**
- [ ] **Step 4: Run `npm test` to verify GREEN**

### Task 3: IMEI Soft-Locking, POS Order Checkout & Automated E-Warranty (TDD)

**Files:**
- Create: `src/server/repositories/ThietBiIMEIRepository.ts`, `src/server/repositories/KhachHangRepository.ts`, `src/server/repositories/HoaDonRepository.ts`, `src/server/repositories/BaoHanhRepository.ts`
- Create: `src/server/services/OrderService.ts`, `src/server/services/WarrantyService.ts`
- Test: `tests/order-and-warranty.test.ts`

**Interfaces:**
- Produces:
  - `OrderService.scanAndLockIMEI(imei: string, branchId: string, staffId: string)`
  - `OrderService.unlockIMEI(imei: string, staffId?: string)`
  - `OrderService.checkoutOrder(payload: CheckoutInput)`
  - `WarrantyService.lookupWarranty(query: string)`
  - `WarrantyService.createServiceIntake(imei: string, issueDescription: string, technicianName: string)`

- [ ] **Step 1: Write failing tests in `tests/order-and-warranty.test.ts` covering 15-digit IMEI validation, cross-branch rejection, soft-lock conflict & auto-expiry after 10m, atomic checkout with combo + loyalty + trade-in clamping, and auto E-Warranty creation**
- [ ] **Step 2: Run `npm test` to verify RED failure**
- [ ] **Step 3: Implement repositories and `OrderService` + `WarrantyService`**
- [ ] **Step 4: Run `npm test` to verify GREEN**

### Task 4: Bulk IMEI Import, Cross-Branch Transfer & Aging Stock BI Service (TDD)

**Files:**
- Create: `src/server/repositories/PhieuDieuChuyenRepository.ts`, `src/server/repositories/ChiNhanhRepository.ts`
- Create: `src/server/services/InventoryService.ts`, `src/server/services/AgingStockService.ts`
- Test: `tests/inventory-transfer-aging.test.ts`

**Interfaces:**
- Produces:
  - `InventoryService.importIMEIBatch(params: { productId: string; branchId: string; rawImeis: string[]; importPrice: number })`
  - `InventoryService.importAccessoryStock(params: { productId: string; branchId: string; quantity: number })`
  - `InventoryService.getCrossBranchMatrix(keyword?: string)`
  - `InventoryService.createTransferRequest(...)`, `approveAndExportTransfer(...)`, `confirmReceiveTransfer(...)`, `rejectTransfer(...)`
  - `AgingStockService.getAgingStockAlerts(branchId?: string)`
  - `AgingStockService.applyClearanceDiscount(productId: string, discountPercent: number)`
  - `AgingStockService.getChainDashboardMetrics(branchId?: string)`

- [ ] **Step 1: Write failing tests in `tests/inventory-transfer-aging.test.ts` covering duplicate/malformed IMEI batch import, transfer state machine & mismatched receive IMEI rejection, and 45d/60d aging alerts + 10% clearance discount**
- [ ] **Step 2: Run `npm test` to verify RED failure**
- [ ] **Step 3: Implement `PhieuDieuChuyenRepository`, `ChiNhanhRepository`, `InventoryService`, and `AgingStockService`**
- [ ] **Step 4: Run `npm test` to verify GREEN**

### Task 5: Next.js REST API Route Controllers

**Files:**
- Create: `src/app/api/bootstrap/route.ts`
- Create: `src/app/api/pos/scan-imei/route.ts`, `src/app/api/pos/unlock-imei/route.ts`, `src/app/api/pos/recommendations/route.ts`, `src/app/api/pos/trade-in/route.ts`, `src/app/api/pos/vietqr/route.ts`, `src/app/api/pos/checkout/route.ts`, `src/app/api/pos/customer/route.ts`
- Create: `src/app/api/inventory/route.ts`, `src/app/api/inventory/import-imei/route.ts`, `src/app/api/inventory/import-accessory/route.ts`
- Create: `src/app/api/transfers/route.ts`, `src/app/api/transfers/[id]/route.ts`
- Create: `src/app/api/warranty/route.ts`
- Create: `src/app/api/dashboard/route.ts`, `src/app/api/dashboard/clearance/route.ts`
- Create: `src/app/api/settings/route.ts`, `src/app/api/settings/reset-demo/route.ts`
- Test: `tests/api-routes.test.ts`

- [ ] **Step 1: Write failing integration test `tests/api-routes.test.ts` exercising key route handlers**
- [ ] **Step 2: Run `npm test` to verify RED failure**
- [ ] **Step 3: Implement thin Route Controllers delegating to Domain Services**
- [ ] **Step 4: Run `npm test` to verify GREEN**

### Task 6: Precision Showroom Frontend UI (POS, Inventory, Transfers, E-Warranty, Dashboard, Settings)

**Files:**
- Create: `src/context/AppSessionContext.tsx` (Active Branch, Role Switcher, Staff Login modal)
- Create: `src/components/AppShell.tsx` (Navy Topbar, Sidebar navigation, Demo Role & Branch Switcher)
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx` (redirects or renders POS workbench)
- Create: `src/app/pos/page.tsx` + `src/components/pos/VietQRModal.tsx` + `src/components/pos/ReceiptModal.tsx` + `src/components/pos/TradeInModal.tsx`
- Create: `src/app/inventory/page.tsx`
- Create: `src/app/transfers/page.tsx`
- Create: `src/app/warranty/page.tsx`
- Create: `src/app/dashboard/page.tsx`
- Create: `src/app/settings/page.tsx`

- [ ] **Step 1: Implement `Be Vietnam Pro` + `JetBrains Mono` typography, color tokens in `globals.css`, `AppSessionContext`, and `AppShell`**
- [ ] **Step 2: Build `/pos` Smart POS Workbench with `F2`/`F8`/`F10`/`F12` keyboard shortcuts, instant IMEI picker/scanner, Compatible Accessories Combo Tray, Trade-In modal, VietQR modal, and printable K80 Thermal Receipt**
- [ ] **Step 3: Build `/inventory`, `/transfers`, `/warranty`, `/dashboard`, and `/settings` screens**
- [ ] **Step 4: Run `npm test` and `npm run build` to verify zero TypeScript, lint, or Next.js build errors**

### Task 7: End-to-End Verification, GitHub Push & Vercel Deployment

**Files:**
- Create: `README.md` (Vietnamese project overview, architecture mapping to DOCX report, local & Vercel setup guide)

- [ ] **Step 1: Start local server and probe API + rendered HTML pages in a single verification command**
- [ ] **Step 2: Initialize Git repository, commit cleanly (excluding `.venv`, `node_modules`, `.next`, temp files), create GitHub repository, and push `main` branch**
- [ ] **Step 3: Link and deploy project to the user's Vercel account and report live URLs**
