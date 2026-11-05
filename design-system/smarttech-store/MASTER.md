# SmartTech Store — Master Design System

## Visual Identity & Rationale
SmartTech Store is an operational Point-of-Sale (POS) and multi-branch inventory intelligence suite for Vietnamese electronics retail (Smartphones, Laptops, Accessories). Rather than generic pastel e-commerce cards, the visual language behaves like a **precision showroom fiscal workbench**: crisp structural hairlines, tabular monospace IMEIs and VND figures, physical keyboard shortcut badges (`F2`, `F8`, `F10`, `F12`), and semantic status colors reserved strictly for operational states.

## Color Tokens
- `--bg-canvas`: `#F4F6F9` — Cool slate-paper background reducing showroom glare.
- `--bg-surface`: `#FFFFFF` — Primary operational panels and POS workbench panes.
- `--bg-subtle`: `#EEF2F7` — Table headers, keycap backgrounds, inactive tabs.
- `--ink-primary`: `#0F172A` — Primary text (contrast > 14:1 on white).
- `--ink-secondary`: `#475569` — Labels and metadata (contrast > 7:1 on white).
- `--border-crisp`: `#CBD5E1` — Structural 1px dividers encoding panel boundaries.
- `--brand-navy`: `#14294B` — Header/navigation anchor matching the academic DOCX report (`#1B365D`).
- `--action-cobalt`: `#1D4ED8` — Primary interactive buttons and active focus rings.
- `--signal-emerald`: `#059669` — VietQR payment action & `SanSangBan` verified IMEI status.
- `--signal-amber`: `#D97706` — Compatible Combo Discount callouts & 45–59 day Aging Stock warning.
- `--signal-crimson`: `#DC2626` — ≥60 day Aging Stock alert & Locked/Invalid IMEI errors.

## Typography
- **UI & Vietnamese Prose:** `Be Vietnam Pro` (400, 500, 600, 700) — engineered specifically for Vietnamese diacritics legibility.
- **IMEI, SKU, Prices & K80 Receipt:** `JetBrains Mono` (500, 600, 700) with `font-variant-numeric: tabular-nums` so 15-digit IMEI codes and VND currency columns align vertically.

## Layout & Interaction Rules
- **No emojis as UI icons:** Use crisp `lucide-react` SVG icons exclusively with accessible labels.
- **POS Two-Column Workbench (`/pos`):** Left 60% dedicated to barcode/IMEI scan bar (`F2`), active cart items, customer loyalty lookup, and Trade-in valuation; Right 40% dedicated to the live **Compatible Accessories Combo Tray** and sticky payment summary (`F8` Cash, `F10` Dynamic VietQR).
- **Memorable Signature Moment:** Real keyboard-shortcut-driven VietQR Checkout Modal & authentic 80mm (`K80`) thermal receipt preview with automated E-Warranty certificate.
- **Accessibility & Touch:** Minimum 40–44px hit targets on POS touch buttons, visible focus outlines (`ring-2 ring-blue-600`), `cursor-pointer` on all interactive controls, and `prefers-reduced-motion` support.
