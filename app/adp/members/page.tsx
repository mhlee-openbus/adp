"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { StageChip } from "@/components/ui/StageChip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { EDU_STAGES } from "@/lib/stages";

// 교인 (목회자) — 우리 교회 교인 목록. 클릭 시 정보·진도율 상세로.
export default function PastorMembersPage() {
  const {
    currentUser,
    membersInScope,
    visibleChurchIds,
    getUser,
    orgName,
    lessonsOf,
  } = useStore();
  const [q, setQ] = useState("");
  if (!currentUser) return null;

  const churchIds = visibleChurchIds(currentUser);
  const members = membersInScope(currentUser);

  const filtered = useMemo(() => {
    const kw = q.trim();
    return members
      .filter((m) => !kw || (getUser(m.userId)?.name ?? "").includes(kw))
      // 단계 오름차순 → 이름순
      .sort((a, b) => {
        if (a.eduStage !== b.eduStage) return a.eduStage - b.eduStage;
        return (getUser(a.userId)?.name ?? "").localeCompare(
          getUser(b.userId)?.name ?? "",
        );
      });
  }, [members, q, getUser]);

  return (
    <div className="flex flex-col gap-4 p-5">
      <div>
        <h2 className="font-display text-2xl font-bold">교인</h2>
        <p className="mt-0.5 text-sm text-mist">
          {churchIds.map((id) => orgName(id)).join(", ")} · 총{" "}
          <span className="nums">{members.length}</span>명
        </p>
      </div>

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="이름으로 검색"
      />

      {filtered.length === 0 ? (
        <EmptyState
          title={members.length === 0 ? "등록된 교인이 없습니다" : "검색 결과 없음"}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((m) => {
            const name = getUser(m.userId)?.name ?? "—";
            const lessons = lessonsOf(m.churchId, m.eduStage);
            const done = lessons.filter((l) =>
              m.completedLessonIds.includes(l.id),
            ).length;
            return (
              <li key={m.id}>
                <Link
                  href={`/adp/church/${m.id}`}
                  className="block rounded-card border border-line bg-white p-4 hover:border-royal"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{name}</span>
                    <StageChip
                      n={m.eduStage}
                      label={EDU_STAGES[m.eduStage]}
                      tone="default"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="shrink-0 text-xs text-mist">진도</span>
                    <ProgressBar value={done} total={lessons.length} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
