"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export interface NavItem {
  href: string;
  label: string;
}

// PC 관리자 좌측 사이드바.
export function Sidebar({
  title,
  subtitle,
  items,
  footer,
}: {
  title: string;
  subtitle?: string;
  items: NavItem[];
  footer?: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-white">
      <div className="border-b border-line px-5 py-5">
        <p className="font-display text-lg font-bold text-ink">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs text-mist">{subtitle}</p>}
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-0.5">
          {items.map((it) => {
            const active =
              it.href === pathname ||
              (it.href !== "/admin" && pathname.startsWith(it.href));
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block rounded-control px-3 py-2 text-sm font-medium",
                    active
                      ? "bg-royal-soft text-royal"
                      : "text-mist hover:bg-paper hover:text-ink",
                  )}
                >
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {footer && <div className="border-t border-line p-3">{footer}</div>}
    </aside>
  );
}
