import { cn } from "@/lib/cn";

// 진도율 바. 진행 색은 악센트(amber) — "현재 진행"의 의미.
export function ProgressBar({
  value,
  total,
  className,
  showText = true,
}: {
  value: number;
  total: number;
  className?: string;
  showText?: boolean;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-amber transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showText && (
        <span className="nums shrink-0 text-sm text-mist">
          {value}/{total}
        </span>
      )}
    </div>
  );
}
