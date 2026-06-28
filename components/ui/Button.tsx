import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "quiet" | "danger";
type Size = "md" | "sm";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-control font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 select-none";

const variants: Record<Variant, string> = {
  // primary = royal (주요 액션)
  primary: "bg-royal text-white hover:bg-[#2c4377] active:bg-[#26396a]",
  // quiet = 조용한 보조 액션
  quiet:
    "bg-transparent text-ink border border-line hover:bg-[#efece4] active:bg-[#e7e3d8]",
  danger: "bg-transparent text-[#9b3b3b] border border-[#e2cccc] hover:bg-[#f6eded]",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-base",
  sm: "h-9 px-3 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  full,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], full && "w-full", className)}
      {...props}
    />
  );
}

// 버튼 스타일의 링크 (Next Link). 내비게이션용.
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  full,
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  full?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], full && "w-full", className)}
    >
      {children}
    </Link>
  );
}
