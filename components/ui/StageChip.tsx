import { cn } from "@/lib/cn";

type Tone = "current" | "done" | "default";

// 단계 칩 (1~5). 현재=amber, 완료=sage, 그 외=조용히.
export function StageChip({
  n,
  label,
  tone = "default",
  className,
}: {
  n: number;
  label: string;
  tone?: Tone;
  className?: string;
}) {
  const tones: Record<Tone, string> = {
    current: "bg-amber-soft text-amber border-amber/30",
    done: "bg-sage-soft text-sage border-sage/30",
    default: "bg-paper text-mist border-line",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium",
        tones[tone],
        className,
      )}
    >
      <span className="nums font-semibold">{n}</span>
      <span>{label}</span>
    </span>
  );
}
