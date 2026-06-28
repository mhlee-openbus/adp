import { cn } from "@/lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "article";
  pad?: boolean;
}

// 기본 카드 — 흰 배경, line 보더, 12px 라운드
export function Card({
  as: Tag = "div",
  pad = true,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-card border border-line bg-white",
        pad && "p-4",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
