"use client";

import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StagePath } from "@/components/ui/StagePath";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { EDU_LABELS, eduName } from "@/lib/stages";
import type { EduStage } from "@/lib/types";

// 1-5 승급 완료 (교인). 현재 단계 마지막 강의 완료 시 자동 진입.
export default function PromotedPage() {
  const { currentUser, getMemberByUser } = useStore();
  if (!currentUser) return null;
  const member = getMemberByUser(currentUser.id);
  if (!member) return null;

  // 승급 직후이므로 eduStage 는 새 단계. 직전 완료 단계 = eduStage - 1.
  const newStage = member.eduStage;
  const completedStage = (newStage - 1) as EduStage;

  if (completedStage < 1) {
    return (
      <div className="p-5">
        <EmptyState
          title="아직 승급 기록이 없습니다"
          hint="강의를 모두 완료하면 다음 단계로 승급해요."
          action={<ButtonLink href="/adp">대시보드로</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 p-6 text-center">
      <div>
        <p className="text-5xl" aria-hidden>
          🎉
        </p>
        <h2 className="font-display mt-3 text-2xl font-bold text-amber">
          {completedStage}.{eduName(completedStage)} 완료!
        </h2>
        <p className="mt-2 text-mist">
          다음은 <b className="text-ink">{newStage}.{eduName(newStage)}</b>{" "}
          단계입니다.
        </p>
      </div>

      <Card className="w-full">
        <StagePath labels={EDU_LABELS} current={newStage} />
      </Card>

      <p className="max-w-xs text-sm text-mist">
        새 단계의 강의가 열렸습니다. 차근차근 이어가 보세요.
      </p>

      <ButtonLink full href="/adp/courses">
        새 단계 강의 보기
      </ButtonLink>
    </div>
  );
}
