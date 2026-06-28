"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar, type NavItem } from "@/components/ui/Sidebar";
import { useStore } from "@/lib/store";
import { ORG_LEVEL_LABELS } from "@/lib/stages";

// ③ 관리자 페이지 — PC 좌측 사이드바 + 넓은 콘텐츠
const NAV: NavItem[] = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/curation", label: "강의 큐레이션 보드" },
  { href: "/admin/members", label: "교인 관리" },
  { href: "/admin/seekers", label: "관심자 현황" },
  { href: "/admin/guides", label: "바이블가이드 관리" },
  { href: "/admin/access", label: "권한 / 조직 관리" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, hydrated, logout } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  // 권한 없는 회원 접근 차단
  useEffect(() => {
    if (hydrated && !isLogin && (!currentUser || !currentUser.adminLevel)) {
      router.replace("/admin/login");
    }
  }, [hydrated, currentUser, isLogin, router]);

  if (isLogin) return <div className="min-h-dvh bg-paper">{children}</div>;
  if (!hydrated || !currentUser || !currentUser.adminLevel) {
    return <div className="min-h-dvh bg-paper" />;
  }

  return (
    <div className="flex min-h-dvh bg-paper">
      <Sidebar
        title="ADP 관리자"
        subtitle="운영 · 제작 · 권한"
        items={NAV}
        footer={
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-medium text-ink">{currentUser.name}</span>
            <span className="text-mist">
              {ORG_LEVEL_LABELS[currentUser.adminLevel]} 권한
            </span>
            <button
              onClick={() => {
                logout();
                router.replace("/admin/login");
              }}
              className="mt-1 self-start text-mist hover:text-ink"
            >
              로그아웃
            </button>
          </div>
        }
      />
      <main className="min-w-0 flex-1 overflow-x-auto">
        <div className="mx-auto max-w-6xl p-8">{children}</div>
      </main>
    </div>
  );
}
