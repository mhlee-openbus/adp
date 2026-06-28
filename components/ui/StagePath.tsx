import { cn } from "@/lib/cn";

// ===== 시그니처 요소: Stage Path =====
// 두 핵심 체계(교육 단계·관심자 단계)가 모두 "순서 있는 5단계 여정"이므로
// 공통 모티프로 쓴다. 완료(sage) → 현재(amber) → 예정(line).
// current 는 1-based 현재 단계(1~5). labels 는 5개.
export function StagePath({
  labels,
  current,
  showLabels = true,
  className,
}: {
  labels: string[];
  current: number;
  showLabels?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <ol className="flex items-start">
        {labels.map((label, i) => {
          const n = i + 1;
          const state =
            n < current ? "done" : n === current ? "current" : "upcoming";
          const isLast = i === labels.length - 1;
          return (
            <li key={n} className="relative flex flex-1 flex-col items-center">
              {/* 연결선 (현재 칸 왼쪽까지 채워짐) */}
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-3.5 left-1/2 -z-0 h-0.5 w-full",
                    n < current ? "bg-sage" : "bg-line",
                  )}
                />
              )}
              {/* 노드 */}
              <span
                className={cn(
                  "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm font-semibold nums",
                  state === "done" && "border-sage bg-sage text-white",
                  state === "current" &&
                    "border-amber bg-amber text-white shadow-[0_0_0_4px_var(--color-amber-soft)]",
                  state === "upcoming" && "border-line bg-white text-mist",
                )}
              >
                {state === "done" ? "✓" : n}
              </span>
              {showLabels && (
                <span
                  className={cn(
                    "mt-1.5 max-w-full px-0.5 text-center text-[11px] leading-tight",
                    state === "current"
                      ? "font-semibold text-amber"
                      : state === "done"
                        ? "text-sage"
                        : "text-mist",
                  )}
                >
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
