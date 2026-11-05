import type { Metadata } from "next";
import "./globals.css";
import { AppSessionProvider } from "@/context/AppSessionContext";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "SmartTech Store — Hệ thống Bán hàng Thông minh Chuỗi Cửa hàng Công nghệ",
  description:
    "Đề tài 20 PTTKHTTT: POS quét IMEI, Gợi ý phụ kiện Combo, Thanh toán VietQR động EMVCo, Điều chuyển kho chuỗi, Bảo hành điện tử & Cảnh báo hàng tồn lâu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppSessionProvider>
          <AppShell>{children}</AppShell>
        </AppSessionProvider>
      </body>
    </html>
  );
}
