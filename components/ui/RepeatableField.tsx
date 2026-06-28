"use client";

import { Button } from "./Button";

// 반복 추가 필드(기념일 복수 등). 행 모양은 renderRow가 결정 → 재사용 가능.
export function RepeatableField<T>({
  items,
  onChange,
  makeNew,
  renderRow,
  addLabel,
  empty,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  makeNew: () => T;
  renderRow: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  addLabel: string;
  empty?: string;
}) {
  const update = (i: number, patch: Partial<T>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-2">
      {items.length === 0 && empty && (
        <p className="text-sm text-mist">{empty}</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-1 gap-2">{renderRow(item, (p) => update(i, p))}</div>
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="이 항목 제거"
            className="shrink-0 rounded-control px-2 py-1 text-mist hover:bg-paper hover:text-ink"
          >
            ✕
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="quiet"
        size="sm"
        onClick={() => onChange([...items, makeNew()])}
        className="self-start"
      >
        + {addLabel}
      </Button>
    </div>
  );
}
