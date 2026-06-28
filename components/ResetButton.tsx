"use client";

import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";

// 데모 상태를 시드로 되돌린다 (localStorage 포함).
export function ResetButton() {
  const { reset } = useStore();
  const toast = useToast();
  return (
    <button
      onClick={() => {
        reset();
        toast("시드 데이터로 초기화됨");
      }}
      className="text-sm font-medium text-mist underline-offset-2 hover:text-ink hover:underline"
    >
      데이터 초기화 (시드 복원)
    </button>
  );
}
