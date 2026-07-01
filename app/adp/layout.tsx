"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DeviceFrame, MobileTopBar } from "@/components/layout/DeviceFrame";
import type { TabItem } from "@/components/ui/TabBar";
import { Logo } from "@/components/ui/Logo";
import { useStore } from "@/lib/store";

// ① ADP 앱 — 모바일 프레임 + 하단 탭. 모드(교인/목회자)에 따라 탭이 다름.
const MEMBER_TABS: TabItem[] = [
  { href: "/adp", label: "대시보드", icon: "🏠" },
  { href: "/adp/courses", label: "강의", icon: "📖" },
  { href: "/adp/questions", label: "질문", icon: "💬" },
];
const PASTOR_TABS: TabItem[] = [
  { href: "/adp/church", label: "우리교회", icon: "⛪" },
  { href: "/adp/members", label: "교인", icon: "👥" },
  { href: "/adp/questions", label: "질문", icon: "💬" },
];

export default function AdpLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, viewMode, hydrated, logout } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/adp/login";

  // 로그인 분기: 미로그인 상태로 보호 화면 접근 시 로그인으로
  useEffect(() => {
    if (hydrated && !currentUser && !isLogin) router.replace("/adp/login");
  }, [hydrated, currentUser, isLogin, router]);

  if (isLogin) return <DeviceFrame>{children}</DeviceFrame>;
  if (!hydrated || !currentUser) return <DeviceFrame>{null}</DeviceFrame>;

  const tabs = viewMode === "pastor" ? PASTOR_TABS : MEMBER_TABS;
  const title = viewMode === "pastor" ? "ADP · 목회자" : "ADP";

  return (
    <DeviceFrame
      tabs={tabs}
      top={
        <MobileTopBar
          title={
            <>
              <Logo size={30} />
              {title}
            </>
          }
          right={
            <button
              onClick={() => {
                logout();
                router.replace("/adp/login");
              }}
              className="text-xs text-mist hover:text-ink"
            >
              로그아웃
            </button>
          }
        />
      }
    >
      {children}
    </DeviceFrame>
  );
}
