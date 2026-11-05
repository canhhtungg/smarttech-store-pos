# Task Plan: SmartTech Store Implementation & Deployment

## Goal
Build a full-stack Next.js + TypeScript + SQLite (`@libsql/client`) implementation of SmartTech Store (Đề tài 20), verify via TDD & production build, push to GitHub, and deploy to Vercel.

## Phases

### Phase 1: Project Scaffolding & Dual-Mode 3NF Database
**Status:** complete
- Initialize Next.js 15, Tailwind CSS, Vitest, `@libsql/client`, `qrcode`, `lucide-react`.
- Implement 3NF database schema (11 domain tables + system settings) and 3-branch seed data.

### Phase 2: Core Smart Domain Services & Repositories (TDD)
**Status:** complete
- Implement `VietQRService` (EMVCo CRC16), `RecommendationService` (Combo cross-sell), `TradeInService`, `OrderService` (IMEI soft-lock & atomic checkout), `WarrantyService`, `InventoryService`, and `AgingStockService`.

### Phase 3: REST API Controllers & Showroom Frontend UI
**Status:** complete
- Implement `/api/*` controllers and 6 responsive screens (`/pos`, `/inventory`, `/transfers`, `/warranty`, `/dashboard`, `/settings`) following `design-system/smarttech-store/MASTER.md`.

### Phase 4: Build Verification, GitHub Repository & Vercel Deployment
**Status:** in_progress
- Run full Vitest suite (14/14 passed) + `tsc --noEmit` + `next build` (20/20 routes succeeded).
- Create GitHub repository, push code, and deploy to Vercel.

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| `os.link` PermissionError in `ui-ux-pro-max --persist` | 1 | Ran `search.py` without `--persist` inside sandbox and wrote `design-system/smarttech-store/MASTER.md` directly |
