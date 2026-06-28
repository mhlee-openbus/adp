"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

interface ToastItem {
  id: number;
  text: string;
}

const ToastContext = createContext<(text: string) => void>(() => {});

// 토스트 알림. 카피 규칙: 동사로 무슨 일이 일어났는지("완료" → "완료됨").
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const show = useCallback((text: string) => {
    const id = ++seq.current;
    setItems((prev) => [...prev, { id, text }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto rounded-control bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-lg"
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
