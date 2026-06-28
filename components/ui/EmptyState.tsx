// 빈 상태 — 분위기가 아니라 "다음 행동 안내". 문구는 짝 문서의 빈 상태에서.
export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line bg-white/50 px-6 py-12 text-center">
      <p className="font-medium text-ink">{title}</p>
      {hint && <p className="max-w-xs text-sm text-mist">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
