"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StageChip } from "@/components/ui/StageChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { TODAY } from "@/lib/seed";
import { SEEKER_STAGES, seekerName } from "@/lib/stages";
import type { SeekerStage } from "@/lib/types";

// 2-2 메인 대시보드 (내 미션 + 오늘의 관심자 미션 + 담당 단계 분포)
export default function GuideHome() {
  const { currentUser, guideSeekers, missionForSeeker, guideMissions, toggleGuideMission } =
    useStore();
  if (!currentUser) return null;

  const seekers = guideSeekers(currentUser.id);
  const withMission = seekers
    .map((s) => ({ seeker: s, mission: missionForSeeker(s.id) }))
    .filter((x) => x.mission);

  // 바이블가이드 본인 미션 (오늘 1건)
  const myMission = (guideMissions ?? []).find(
    (m) => m.guideId === currentUser.id && m.date === TODAY,
  );

  // 담당 관심자 단계 분포 (준비→보존)
  const dist = ([1, 2, 3, 4, 5] as SeekerStage[]).map((s) => ({
    stage: s,
    count: seekers.filter((k) => k.stage === s).length,
  }));
  const distMax = Math.max(1, ...dist.map((d) => d.count));

  return (
    <div className="flex flex-col gap-5 p-5">
      <div>
        <h2 className="font-display text-2xl font-bold">오늘의 미션</h2>
        <p className="mt-0.5 text-sm text-mist">
          {currentUser.name} 님 · 담당 {seekers.length}명
        </p>
      </div>

      {/* 내 미션 — 바이블가이드 본인 활동, 하루 1건 (관심자 미션과 별개) */}
      {myMission && (
        <div className="rounded-card border border-royal/30 bg-royal-soft/60 p-4">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-royal">
              <span aria-hidden>🙋</span> 내 미션 · 오늘
            </p>
            {myMission.done && (
              <span className="text-xs font-medium text-sage">완료됨</span>
            )}
          </div>
          <p
            className={
              "font-display mt-1 text-lg font-semibold " +
              (myMission.done ? "text-mist line-through" : "text-ink")
            }
          >
            {myMission.text}
          </p>
          <button
            onClick={() => toggleGuideMission(myMission.id)}
            aria-pressed={myMission.done}
            className={
              "mt-3 w-full rounded-control py-2 text-sm font-medium " +
              (myMission.done
                ? "border border-line bg-white text-mist"
                : "bg-royal text-white")
            }
          >
            {myMission.done ? "완료 취소" : "완료 체크"}
          </button>
        </div>
      )}

      {seekers.length > 0 && (
        <p className="-mb-1 text-sm font-semibold text-mist">관심자 미션</p>
      )}

      {seekers.length === 0 ? (
        // 빈 상태: 관심자 0명
        <EmptyState
          title="첫 관심자를 등록하세요"
          hint="관심자를 등록하면 오늘의 미션이 여기에 나타납니다."
          action={<ButtonLink href="/guide/seekers/new">관심자 등록</ButtonLink>}
        />
      ) : (
        <>
          {withMission.length === 0 ? (
            // 빈 상태: 오늘 미션 없음
            <EmptyState
              title="오늘은 예정된 활동이 없어요"
              hint="관심자 상세에서 단계를 관리하거나 새 관심자를 등록할 수 있어요."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {withMission.map(({ seeker, mission }) => (
                <li key={seeker.id}>
                  <Link
                    href={`/guide/seekers/${seeker.id}`}
                    className="block rounded-card border border-line bg-white p-4 hover:border-royal"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-lg font-semibold">
                        {seeker.name}
                      </span>
                      <StageChip
                        n={seeker.stage}
                        label={seekerName(seeker.stage)}
                        tone="default"
                      />
                    </div>
                    <div
                      className={
                        "mt-2 flex items-center gap-2 text-sm " +
                        (mission!.done ? "text-mist line-through" : "text-ink")
                      }
                    >
                      <span className="text-amber" aria-hidden>
                        ●
                      </span>
                      {mission!.text}
                      {mission!.done && (
                        <span className="text-sage no-underline">완료됨</span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* 담당 관심자 단계 분포 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">관심자 단계 분포</p>
              <Link
                href="/guide/seekers"
                className="text-xs text-royal hover:underline"
              >
                전체 보기 →
              </Link>
            </div>
            <Card className="flex flex-col gap-1.5">
              {dist.map(({ stage, count }) => (
                <div key={stage} className="flex items-center gap-3 px-1.5 py-1">
                  <div className="w-20 shrink-0">
                    <StageChip
                      n={stage}
                      label={SEEKER_STAGES[stage]}
                      tone="default"
                    />
                  </div>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-paper">
                    <div
                      className="h-full rounded-full bg-royal"
                      style={{ width: `${(count / distMax) * 100}%` }}
                    />
                  </div>
                  <span className="nums w-6 shrink-0 text-right text-sm font-semibold">
                    {count}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
