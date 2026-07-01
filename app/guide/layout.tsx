"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DeviceFrame, MobileTopBar } from "@/components/layout/DeviceFrame";
import type { TabItem } from "@/components/ui/TabBar";
import { Logo } from "@/components/ui/Logo";
import { useStore } from "@/lib/store";

// ② 바이블가이드 앱 — 모바일 프레임 + 하단 탭 (ADP와 별개 앱)
const TABS: TabItem[] = [
  { href: "/guide", label: "오늘", icon: "📋" },
  { href: "/guide/seekers", label: "관심자", icon: "👥" },
  { href: "/guide/missions", label: "미션", icon: "🎯" },
];

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, hydrated, logout } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/guide/login";
  const isCall = pathname.endsWith("/call"); // 1:1 화상은 풀프레임(탭 숨김)

  useEffect(() => {
    if (hydrated && !currentUser && !isLogin) router.replace("/guide/login");
  }, [hydrated, currentUser, isLogin, router]);

  if (isLogin) return <DeviceFrame>{children}</DeviceFrame>;
  if (!hydrated || !currentUser) return <DeviceFrame>{null}</DeviceFrame>;
  if (isCall) return <DeviceFrame>{children}</DeviceFrame>;

  return (
    <DeviceFrame
      tabs={TABS}
      top={
        <MobileTopBar
          title={
            <>
              <Logo size={30} />
              바이블가이드
            </>
          }
          right={
            <button
              onClick={() => {
                logout();
                router.replace("/guide/login");
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
