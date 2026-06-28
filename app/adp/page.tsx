"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StagePath } from "@/components/ui/StagePath";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { EDU_LABELS, eduName } from "@/lib/stages";

// 1-2 내 대시보드 (교인)
export default function AdpDashboard() {
  const { currentUser, getMemberByUser, lessonsOf } = useStore();
  if (!currentUser) return null;
  const member = getMemberByUser(currentUser.id);

  if (!member) {
    return (
      <div className="p-5">
        <EmptyState
          title="교인 정보가 없습니다"
          hint="이 계정은 교육 단계가 없는 계정입니다."
        />
      </div>
    );
  }

  const stageLessons = lessonsOf(member.churchId, member.eduStage);
  const done = stageLessons.filter((l) =>
    member.completedLessonIds.includes(l.id),
  );
  const nextLesson = stageLessons.find(
    (l) => !member.completedLessonIds.includes(l.id),
  );

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* 인사 + 현재 단계 */}
      <div>
        <p className="text-sm text-mist">{currentUser.name} 님, 환영합니다</p>
        <h2 className="font-display mt-0.5 text-2xl font-bold">
          현재 단계 · {member.eduStage}.{eduName(member.eduStage)}
        </h2>
      </div>

      {/* 5단계 중 내 위치 (시그니처 Stage Path) */}
      <Card>
        <p className="mb-3 text-sm font-medium text-mist">나의 여정</p>
        <StagePath labels={EDU_LABELS} current={member.eduStage} />
      </Card>

      {stageLessons.length === 0 ? (
        // 빈 상태/예외: 강의 미등록 단계
        <EmptyState
          title="현재 단계는 준비 중입니다"
          hint="강의가 등록되면 여기에서 이어볼 수 있어요."
        />
      ) : (
        <>
          {/* 현재 단계 진도율 */}
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-mist">현재 단계 진도율</p>
              <span className="nums text-sm text-mist">
                {Math.round((done.length / stageLessons.length) * 100)}%
              </span>
            </div>
            <ProgressBar value={done.length} total={stageLessons.length} />
          </Card>

          {/* 이어보기 (다음 강의) */}
          {nextLesson ? (
            <Card className="border-amber/40 bg-amber-soft/40">
              <p className="text-xs font-medium text-amber">이어보기</p>
              <p className="font-display mt-1 text-lg font-semibold">
                {nextLesson.title}
              </p>
              <div className="mt-3 flex gap-2">
                <ButtonLink href={`/adp/courses/${nextLesson.id}`}>
                  강의 이어보기
                </ButtonLink>
              </div>
            </Card>
          ) : (
            <Card className="bg-sage-soft/50 border-sage/30">
              <p className="font-medium text-sage">
                이 단계의 강의를 모두 마쳤습니다 🎉
              </p>
              <p className="mt-1 text-sm text-mist">
                다음 단계 안내를 기다리고 있어요.
              </p>
            </Card>
          )}

          <Link
            href="/adp/courses"
            className="text-center text-sm font-medium text-royal hover:underline"
          >
            강의 목록 보기 →
          </Link>
        </>
      )}
    </div>
  );
}
