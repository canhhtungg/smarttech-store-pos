# SmartTech Store — Hệ Thống Bán Hàng Thông Minh Cho Chuỗi Cửa Hàng Điện Thoại, Laptop & Phụ Kiện

> **Đồ án môn học Phân tích và Thiết kế Hệ thống Thông tin — Đề tài 20:**
> *"Phân tích và thiết kế hệ thống Bán hàng thông minh cho một chuỗi cửa hàng"*
>
> File báo cáo học thuật đi kèm trong kho mã nguồn: [`BaoCao_PTTKHTTT_DeTai20_SmartTechStore.docx`](./BaoCao_PTTKHTTT_DeTai20_SmartTechStore.docx)

---

## 1. Tổng quan Hệ thống & Kiến trúc Ánh xạ Báo cáo OOAD

Hệ thống **SmartTech Store POS & Chain ERP** hiện thực hóa đầy đủ mô hình phân tích thiết kế hướng đối tượng (OOAD 3 lớp `Boundary` → `Control/Service` → `Entity/Repository`) dành cho chuỗi bán lẻ sản phẩm công nghệ gồm 3 chi nhánh (*SmartTech Cầu Giấy `CN-CG`*, *SmartTech Đống Đa `CN-DD`*, *SmartTech Hà Đông `CN-HD`*):

| Phân hệ Nghiệp vụ (Use Case Package) | Điểm nổi bật "Thông minh & Chi phí 0đ" | Mã nguồn Thực thi Chính |
| :--- | :--- | :--- |
| **1. Quản lý Kho Kép (Dual-Inventory)** | Quản lý đích danh từng cá thể máy qua mã **IMEI 15 chữ số** (có khóa tạm 10 phút `locked_until` chống bán trùng tại POS) kết hợp quản lý **SKU số lượng** cho phụ kiện. | `src/server/repositories/ThietBiIMEIRepository.ts`, `src/app/inventory/page.tsx` |
| **2. Bán hàng POS & Gợi ý Bán chéo (Cross-sell)** | Quét IMEI tự động gợi ý danh sách **Phụ kiện tương thích 100%** kèm ưu đãi Combo giảm 15%–25%. | `src/server/services/RecommendationService.ts`, `src/app/pos/page.tsx` |
| **3. Sinh mã VietQR Động Offline (EMVCo Napas 247)** | Tự tổng hợp chuỗi TLV chuẩn EMVCo + tính mã kiểm tra **CRC16-CCITT (`0x1021`)** nội bộ: khóa cứng đúng tổng tiền hóa đơn và nội dung chuyển khoản chuẩn hóa không dấu. | `src/server/services/VietQRService.ts`, `src/components/pos/VietQRModal.tsx` |
| **4. Thu cũ Đổi mới & Tích điểm Hạng thẻ** | Định giá thu mua máy cũ minh bạch theo 4 tiêu chí khấu hao vật lý + Tích/tiêu điểm thành viên (`100.000đ = 1 điểm`, `1 điểm = 1.000đ`). | `src/server/services/TradeInService.ts`, `src/server/services/OrderService.ts` |
| **5. Bảo hành Điện tử Tự động (E-Warranty)** | Tự động kích hoạt sổ bảo hành điện tử ngay trong transaction thanh toán; tra cứu tức thì theo IMEI/SĐT và ghi nhận lịch sử sửa chữa kỹ thuật. | `src/server/services/WarrantyService.ts`, `src/app/warranty/page.tsx` |
| **6. Điều chuyển Liên Chi nhánh & Cảnh báo Tồn kho (BI)** | Ma trận tồn kho toàn chuỗi thời gian thực, quy trình điều chuyển 3 bước đối soát IMEI (`Pending` → `InTransit` → `Completed`), và cảnh báo hàng tồn lâu ngày (`YELLOW` 45–59 ngày, `RED` ≥60 ngày) kèm nút xả kho 1 chạm. | `src/server/services/InventoryService.ts`, `src/server/services/AgingStockService.ts`, `src/app/dashboard/page.tsx` |

---

## 2. Công nghệ Sử dụng (Tech Stack)

- **Framework Full-stack:** Next.js 15 (App Router, React 19, TypeScript)
- **Giao diện (UI/UX):** Tailwind CSS v4 + `lucide-react` (Bảng màu Enterprise POS Navy `#14294B` & Action Blue `#2563EB`, phông chữ `Be Vietnam Pro` & `JetBrains Mono`)
- **Cơ sở dữ liệu (12 bảng chuẩn 3NF):** SQLite / LibSQL (`@libsql/client`) — tự động khởi tạo schema và nạp dữ liệu mẫu (Zero-config):
  - Chạy Local: lưu bền vững tại `./data/smarttech.db`
  - Chạy Vercel Serverless: tự động dùng `/tmp/smarttech.db` hoặc kết nối Cloud SQLite qua biến môi trường `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`
- **Sinh mã QR nội bộ:** `qrcode` + thuật toán chuẩn EMVCo CRC16-CCITT
- **Kiểm thử tự động:** Vitest (`tests/*.test.ts`)

---

## 3. Phím tắt Thu ngân tại Quầy POS (`/pos`)

- `F2`: Đưa con trỏ vào ô quét mã vạch / IMEI 15 số
- `F8`: Mở bảng Định giá Thu cũ đổi mới (Trade-in)
- `F10`: Sinh mã **VietQR Động** chứa sẵn số tiền thanh toán cuối cùng
- `F12`: Hoàn tất thanh toán tiền mặt nhanh & in phiếu K80 + kích hoạt Bảo hành điện tử

---

## 4. Hướng dẫn Cài đặt & Chạy Thử Nghiệm Local

```bash
# 1. Cài đặt thư viện
npm install

# 2. Chạy bộ kiểm thử đơn vị & tích hợp (Vitest)
npm test

# 3. Khởi động máy chủ phát triển (http://localhost:3000)
npm run dev

# 4. Kiểm tra biên dịch Production
npm run build
```

---

## 5. Cấu trúc Thư mục Chính

```text
├── BaoCao_PTTKHTTT_DeTai20_SmartTechStore.docx   # Báo cáo Phân tích & Thiết kế Hệ thống (Word)
├── docs/superpowers/                             # Đặc tả kỹ thuật & Kế hoạch triển khai
├── scripts/report-generator/                     # Script Python sinh báo cáo .docx tự động
├── src/
│   ├── app/                                      # Giao diện 6 phân hệ & 18 API Route Controllers
│   │   ├── pos/                                  # Màn hình Bán hàng thông minh POS
│   │   ├── inventory/                            # Quản lý kho kép (Nhập lô IMEI & SKU Phụ kiện)
│   │   ├── transfers/                            # Ma trận tồn kho chuỗi & Điều chuyển nội bộ
│   │   ├── warranty/                             # Cổng tra cứu & tiếp nhận Bảo hành điện tử
│   │   ├── dashboard/                            # BI Dashboard chuỗi & Cảnh báo tồn kho lâu ngày
│   │   └── settings/                             # Cấu hình ngân hàng VietQR & Reset Demo Data
│   ├── components/                               # AppShell, VietQRModal, TradeInModal, ReceiptModal
│   ├── server/
│   │   ├── db/                                   # Schema 12 bảng 3NF (schema.ts) & Dữ liệu mẫu (seed.ts)
│   │   ├── repositories/                         # Lớp truy xuất dữ liệu (Entity / Repository Layer)
│   │   └── services/                             # Lớp xử lý nghiệp vụ thông minh (Service Layer)
│   └── types/                                    # Định nghĩa kiểu dữ liệu Domain TypeScript
└── tests/                                        # 5 bộ kiểm thử tự động (DB, VietQR, POS, Kho, API)
```
