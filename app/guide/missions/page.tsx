"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StageChip } from "@/components/ui/StageChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { TODAY } from "@/lib/seed";
import { seekerName } from "@/lib/stages";

type Filter = "all" | "pending" | "done";

// 미션 히스토리 — 담당 관심자의 모든 미션을 미션 단위로(최신순) 나열
export default function GuideMissionsPage() {
  const { currentUser, guideSeekers, missions } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  if (!currentUser) return null;

  const seekers = guideSeekers(currentUser.id);
  const seekerById = new Map(seekers.map((s) => [s.id, s]));
  const seekerIds = new Set(seekers.map((s) => s.id));

  // 담당 관심자의 모든 미션을 미션 단위로 (최신순)
  const all = missions
    .filter((m) => seekerIds.has(m.seekerId))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const doneCount = all.filter((m) => m.done).length;
  const pendingCount = all.length - doneCount;

  const items = all.filter((m) =>
    filter === "all" ? true : filter === "done" ? m.done : !m.done,
  );

  const FILTERS: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "전체", count: all.length },
    { key: "pending", label: "예정", count: pendingCount },
    { key: "done", label: "완료", count: doneCount },
  ];

  const fmt = (d: string) => d.slice(5).replace("-", ".");

  return (
    <div className="flex flex-col gap-5 p-5">
      <div>
        <h2 className="font-display text-2xl font-bold">미션 히스토리</h2>
        <p className="mt-0.5 text-sm text-mist">
          {currentUser.name} 님 · 누적 <span className="nums">{items.length}</span>
          건 · 완료 <span className="nums">{doneCount}</span>건
        </p>
      </div>

      {seekers.length === 0 ? (
        <EmptyState
          title="담당 관심자가 없습니다"
          hint="관심자를 등록하면 미션 이력이 여기에 쌓입니다."
          action={<ButtonLink href="/guide/seekers/new">관심자 등록</ButtonLink>}
        />
      ) : all.length === 0 ? (
        <EmptyState
          title="아직 미션 이력이 없습니다"
          hint="관심자 상세에서 미션을 진행하면 이력으로 남습니다."
        />
      ) : (
        <>
          {/* 필터: 전체 / 예정 / 완료 */}
          <div className="flex rounded-control border border-line bg-white p-1 text-sm">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={
                  "flex-1 rounded-[6px] py-1.5 font-medium " +
                  (filter === f.key ? "bg-royal text-white" : "text-mist")
                }
              >
                {f.label}
                <span className="nums ml-1 text-xs opacity-80">{f.count}</span>
              </button>
            ))}
          </div>

          {items.length === 0 ? (
            <EmptyState
              title={filter === "done" ? "완료한 미션이 없습니다" : "예정된 미션이 없습니다"}
            />
          ) : (
            <ul className="flex flex-col gap-2">
          {items.map((m) => {
            const seeker = seekerById.get(m.seekerId);
            const isToday = m.date === TODAY;
            return (
              <li key={m.id}>
                <Link
                  href={`/guide/seekers/${m.seekerId}`}
                  className="block rounded-card border border-line bg-white p-4 hover:border-royal"
                >
                  {/* 상단: 날짜 · 상태 */}
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="nums flex items-center gap-1.5 text-xs text-mist">
                      {fmt(m.date)}
                      {isToday && (
                        <span className="rounded-full bg-amber-soft px-1.5 py-0.5 font-medium text-amber">
                          오늘
                        </span>
                      )}
                    </span>
                    <span
                      className={
                        "flex items-center gap-1 text-xs font-medium " +
                        (m.done ? "text-sage" : "text-amber")
                      }
                    >
                      <span aria-hidden>{m.done ? "✓" : "●"}</span>
                      {m.done ? "완료" : "예정"}
                    </span>
                  </div>

                  {/* 미션 내용 */}
                  <p
                    className={
                      "font-medium " +
                      (m.done ? "text-mist line-through" : "text-ink")
                    }
                  >
                    {m.text}
                  </p>

                  {/* 대상 관심자 */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-mist">
                      {seeker?.name ?? "—"}
                    </span>
                    {seeker && (
                      <StageChip
                        n={seeker.stage}
                        label={seekerName(seeker.stage)}
                        tone="default"
                      />
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
