"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export interface TabItem {
  href: string;
  label: string;
  icon: string; // 간단한 글리프(프로토타입)
}

// 모바일 하단 탭 네비. 활성색은 royal/ink (amber는 단계·진행 전용으로 아낌).
export function TabBar({ items }: { items: TabItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur">
      <ul className="flex">
        {items.map((it) => {
          // 루트 탭(/guide·/adp)은 정확히 일치할 때만, 하위 섹션 탭은 그 하위 경로까지 활성.
          const active =
            pathname === it.href ||
            (it.href.split("/").length > 2 &&
              pathname.startsWith(it.href + "/"));
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium",
                  active ? "text-royal" : "text-mist",
                )}
              >
                <span className="text-lg leading-none" aria-hidden>
                  {it.icon}
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
