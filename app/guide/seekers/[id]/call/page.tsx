"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

// 2-6 1:1 화상 — 얼굴·동영상·채팅 3분할 레이아웃만 (실제 연결은 외부 별도 서비스)
export default function CallPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { seekers } = useStore();
  const seeker = seekers.find((s) => s.id === id);

  return (
    <div className="flex h-full min-h-full flex-col bg-ink text-paper">
      {/* 상단 바 */}
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-medium">
          {seeker ? `${seeker.name} 님과 통화 중` : "통화"}
        </p>
        <button
          onClick={() => router.back()}
          className="rounded-control bg-[#9b3b3b] px-3 py-1.5 text-xs font-medium text-white"
        >
          통화 종료
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3 pb-3">
        {/* ② 함께 보는 동영상 화면 */}
        <div className="flex flex-[2] items-center justify-center rounded-card border border-white/10 bg-black/40">
          <div className="text-center text-paper/60">
            <p className="text-2xl" aria-hidden>
              ▶
            </p>
            <p className="mt-1 text-xs">함께 보는 동영상</p>
          </div>
        </div>

        {/* ① 각자 얼굴 (양쪽 비디오 영역) */}
        <div className="flex flex-1 gap-2">
          {["나", seeker?.name ?? "관심자"].map((who, i) => (
            <div
              key={i}
              className="flex flex-1 items-center justify-center rounded-card border border-white/10 bg-white/5"
            >
              <div className="text-center text-paper/60">
                <p className="text-xl" aria-hidden>
                  👤
                </p>
                <p className="mt-1 text-xs">{who}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ③ 채팅 */}
        <div className="flex flex-1 flex-col rounded-card border border-white/10 bg-white/5">
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
            <p className="w-fit rounded-card bg-white/10 px-3 py-1.5">
              안녕하세요, 오늘 함께 영상 보려고요 :)
            </p>
            <p className="ml-auto w-fit rounded-card bg-royal px-3 py-1.5 text-white">
              네 좋아요!
            </p>
          </div>
          <div className="flex gap-2 border-t border-white/10 p-2">
            <input
              disabled
              placeholder="메시지 입력 (외부 서비스 연동)"
              className="flex-1 rounded-control bg-white/10 px-3 py-2 text-sm text-paper placeholder:text-paper/40"
            />
            <button
              disabled
              className="rounded-control bg-white/15 px-3 text-sm text-paper/60"
            >
              전송
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
