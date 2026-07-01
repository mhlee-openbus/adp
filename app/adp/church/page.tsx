"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StageChip } from "@/components/ui/StageChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { TODAY } from "@/lib/seed";
import { EDU_STAGES, ORG_LEVEL_LABELS } from "@/lib/stages";
import { cn } from "@/lib/cn";
import type { EduStage } from "@/lib/types";

// 요약 지표 카드
function Stat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <Card className="flex flex-col gap-0.5 py-3">
      <p className="text-xs text-mist">{label}</p>
      <p className="font-display text-2xl font-bold leading-tight">
        <span className="nums">{value}</span>
        <span className="ml-0.5 text-sm font-medium text-mist">{unit}</span>
      </p>
    </Card>
  );
}

// 1-6 우리교회 현황 대시보드 (목회자/관리자, 보기 전용)
export default function ChurchStatusPage() {
  const {
    currentUser,
    membersInScope,
    seekersInScope,
    visibleChurchIds,
    orgName,
    getUser,
    lessonsOf,
  } = useStore();
  const [openStage, setOpenStage] = useState<EduStage | null>(null);
  if (!currentUser) return null;

  const members = membersInScope(currentUser);
  const seekers = seekersInScope(currentUser);
  const churchIds = visibleChurchIds(currentUser);
  const scopeLabel = currentUser.adminLevel
    ? ORG_LEVEL_LABELS[currentUser.adminLevel]
    : "교회";

  const counts = ([1, 2, 3, 4, 5] as EduStage[]).map((s) => ({
    stage: s,
    count: members.filter((m) => m.eduStage === s).length,
  }));
  const max = Math.max(1, ...counts.map((c) => c.count));

  const openMembers =
    openStage != null ? members.filter((m) => m.eduStage === openStage) : [];

  // 요약 지표
  const month = TODAY.slice(0, 7); // "YYYY-MM"
  const newThisMonth = members.filter((m) =>
    m.registeredAt?.startsWith(month),
  ).length;
  // 평균 진도율 = 현재 단계 강의가 있는 교인들의 (완료/전체) 평균
  const withLessons = members
    .map((m) => {
      const ls = lessonsOf(m.churchId, m.eduStage);
      return ls.length > 0
        ? ls.filter((l) => m.completedLessonIds.includes(l.id)).length /
            ls.length
        : null;
    })
    .filter((v): v is number => v != null);
  const avgProgress =
    withLessons.length > 0
      ? Math.round(
          (withLessons.reduce((a, b) => a + b, 0) / withLessons.length) * 100,
        )
      : 0;

  // 최근 등록 교인 (등록일 최신순 5명)
  const recent = [...members]
    .filter((m) => m.registeredAt)
    .sort((a, b) => (a.registeredAt! < b.registeredAt! ? 1 : -1))
    .slice(0, 5);

  // 전도(관심자) 요약
  const unassigned = seekers.filter((s) => s.assignedGuideId == null).length;
  const converted = seekers.filter((s) => s.converted).length;

  return (
    <div className="flex flex-col gap-5 p-5">
      <div>
        <p className="text-sm text-mist">우리교회 현황 · {scopeLabel} 단위</p>
        <h2 className="font-display mt-0.5 text-2xl font-bold">교육 현황</h2>
        <p className="mt-1 text-xs text-mist">
          {churchIds.map((id) => orgName(id)).join(", ")}
        </p>
      </div>

      {members.length === 0 ? (
        <EmptyState
          title="표시할 교인이 없습니다"
          hint="권한 범위 안에 등록된 교인이 아직 없어요."
        />
      ) : (
        <>
          {/* 요약 지표 */}
          <div className="grid grid-cols-2 gap-3">
            <Stat label="전체 교인" value={members.length} unit="명" />
            <Stat label="이번 달 신규" value={newThisMonth} unit="명" />
            <Stat label="평균 진도율" value={avgProgress} unit="%" />
            <Stat label="관심자" value={seekers.length} unit="명" />
          </div>

          {/* 단계별 분포 */}
          <div>
            <p className="mb-2 text-sm font-semibold">교인 단계 분포</p>
            <Card className="flex flex-col gap-1.5">
              {counts.map(({ stage, count }) => {
                const active = openStage === stage;
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setOpenStage(active ? null : stage)}
                    aria-expanded={active}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-1.5 py-1.5 text-left transition-colors",
                      active ? "bg-paper" : "hover:bg-paper/60",
                    )}
                  >
                    <div className="w-32 shrink-0">
                      <StageChip
                        n={stage}
                        label={EDU_STAGES[stage]}
                        tone={active ? "current" : "default"}
                      />
                    </div>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-paper">
                      <div
                        className="h-full rounded-full bg-royal"
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </div>
                    <span className="nums w-6 shrink-0 text-right text-sm font-semibold">
                      {count}
                    </span>
                  </button>
                );
              })}
            </Card>
          </div>

          {openStage != null && (
            <Card className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  {openStage}. {EDU_STAGES[openStage]} 단계 교인
                </p>
                <span className="nums text-xs text-mist">
                  {openMembers.length}명
                </span>
              </div>
              {openMembers.length === 0 ? (
                <p className="py-2 text-center text-xs text-mist">
                  이 단계에 있는 교인이 없습니다.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-line">
                  {openMembers.map((m) => {
                    const u = getUser(m.userId);
                    return (
                      <li key={m.id}>
                        <Link
                          href={`/adp/church/${m.id}`}
                          className="flex items-center justify-between gap-2 py-2 hover:text-royal"
                        >
                          <span className="text-sm font-medium">
                            {u?.name ?? "—"}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-mist">
                            {churchIds.length > 1
                              ? orgName(m.churchId)
                              : m.joinPath === "signup"
                                ? "직접 가입"
                                : "관리자 등록"}
                            <span aria-hidden>›</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          )}

          {/* 최근 등록 교인 */}
          <div>
            <p className="mb-2 text-sm font-semibold">최근 등록 교인</p>
            <Card className="flex flex-col">
              <ul className="flex flex-col divide-y divide-line">
                {recent.map((m) => {
                  const u = getUser(m.userId);
                  return (
                    <li key={m.id}>
                      <Link
                        href={`/adp/church/${m.id}`}
                        className="flex items-center justify-between gap-2 py-2 hover:text-royal"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {u?.name ?? "—"}
                          </span>
                          <StageChip
                            n={m.eduStage}
                            label={EDU_STAGES[m.eduStage]}
                            tone="default"
                          />
                        </span>
                        <span className="nums shrink-0 text-xs text-mist">
                          {m.registeredAt}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>

          {/* 전도 현황 (관심자) */}
          <div>
            <p className="mb-2 text-sm font-semibold">전도 현황</p>
            <Card className="flex items-stretch justify-between text-center">
              <div className="flex-1">
                <p className="font-display text-xl font-bold nums">
                  {seekers.length}
                </p>
                <p className="text-xs text-mist">관심자</p>
              </div>
              <div className="w-px bg-line" />
              <div className="flex-1">
                <p className="font-display text-xl font-bold nums">
                  {unassigned}
                </p>
                <p className="text-xs text-mist">미배정</p>
              </div>
              <div className="w-px bg-line" />
              <div className="flex-1">
                <p className="font-display text-xl font-bold nums">
                  {converted}
                </p>
                <p className="text-xs text-mist">교인 전환</p>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
