"use client";

import { Card } from "@/components/ui/Card";
import { StageChip } from "@/components/ui/StageChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { EDU_STAGES, ORG_LEVEL_LABELS } from "@/lib/stages";
import type { EduStage } from "@/lib/types";

// 1-6 우리교회 현황 대시보드 (목회자/관리자, 보기 전용)
export default function ChurchStatusPage() {
  const { currentUser, membersInScope, visibleChurchIds, orgName } = useStore();
  if (!currentUser) return null;

  const members = membersInScope(currentUser);
  const churchIds = visibleChurchIds(currentUser);
  const scopeLabel = currentUser.adminLevel
    ? ORG_LEVEL_LABELS[currentUser.adminLevel]
    : "교회";

  const counts = ([1, 2, 3, 4, 5] as EduStage[]).map((s) => ({
    stage: s,
    count: members.filter((m) => m.eduStage === s).length,
  }));
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <div className="flex flex-col gap-5 p-5">
      <div>
        <p className="text-sm text-mist">우리교회 현황 · {scopeLabel} 단위</p>
        <h2 className="font-display mt-0.5 text-2xl font-bold">교인 단계 분포</h2>
        <p className="mt-1 text-xs text-mist">
          {churchIds.map((id) => orgName(id)).join(", ")} · 총{" "}
          <span className="nums">{members.length}</span>명
        </p>
      </div>

      {members.length === 0 ? (
        <EmptyState
          title="표시할 교인이 없습니다"
          hint="권한 범위 안에 등록된 교인이 아직 없어요."
        />
      ) : (
        <Card className="flex flex-col gap-3">
          {counts.map(({ stage, count }) => (
            <div key={stage} className="flex items-center gap-3">
              <div className="w-24 shrink-0">
                <StageChip
                  n={stage}
                  label={EDU_STAGES[stage]}
                  tone="default"
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
            </div>
          ))}
        </Card>
      )}

      <p className="text-center text-xs text-mist">
        무거운 운영은 PC 관리자 페이지에서 — 이 화면은 보기 전용입니다.
      </p>
    </div>
  );
}
