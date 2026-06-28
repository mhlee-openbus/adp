"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

// 관계 복수 태그 입력. 프리셋 빠른 추가 + 자유 입력 + 칩 제거.
export function TagInput({
  value,
  onChange,
  presets = [],
  placeholder = "직접 입력 후 Enter",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  presets?: string[];
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const add = (tag: string) => {
    const t = tag.trim();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
  };
  const remove = (tag: string) => onChange(value.filter((v) => v !== tag));

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-royal/20 bg-royal-soft px-2.5 py-1 text-sm text-royal"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                aria-label={`${tag} 제거`}
                className="text-royal/60 hover:text-royal"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(draft);
            setDraft("");
          }
        }}
        placeholder={placeholder}
        className="h-10 w-full rounded-control border border-line bg-white px-3 text-base placeholder:text-mist/70 focus:border-royal focus:outline-none"
      />

      {presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => add(p)}
              disabled={value.includes(p)}
              className={cn(
                "rounded-full border border-line px-2.5 py-1 text-sm text-mist hover:border-royal hover:text-royal",
                value.includes(p) && "opacity-40",
              )}
            >
              + {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
