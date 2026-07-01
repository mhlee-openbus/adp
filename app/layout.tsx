import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

// 디스플레이/제목/큰 숫자 — 절제해서 사용 (경건·말씀의 결)
const notoSerifKr = Noto_Serif_KR({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-noto-serif-kr",
  display: "swap",
  preload: false, // CJK 폰트는 용량이 커 프리로드하지 않음
});

export const metadata: Metadata = {
  title: "ADP — 교인 교육 플랫폼",
  description:
    "제칠일안식일예수재림교회 교인 교육 플랫폼. ADP 앱 · 바이블가이드 앱 · 관리자 페이지.",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSerifKr.variable} h-full`}>
      <head>
        {/* Pretendard(본문/UI) — 프로토타입이므로 CDN 사용 (빌드명세 §4 허용) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-full">
        <StoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
