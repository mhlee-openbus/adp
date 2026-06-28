"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { StageChip } from "@/components/ui/StageChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { seekerName } from "@/lib/stages";

// 2-2 메인 대시보드 (오늘의 미션)
export default function GuideHome() {
  const { currentUser, guideSeekers, missionForSeeker } = useStore();
  if (!currentUser) return null;

  const seekers = guideSeekers(currentUser.id);
  const withMission = seekers
    .map((s) => ({ seeker: s, mission: missionForSeeker(s.id) }))
    .filter((x) => x.mission);

  return (
    <div className="flex flex-col gap-4 p-5">
      <div>
        <h2 className="font-display text-2xl font-bold">오늘의 미션</h2>
        <p className="mt-0.5 text-sm text-mist">
          {currentUser.name} 님 · 담당 {seekers.length}명
        </p>
      </div>

      {seekers.length === 0 ? (
        // 빈 상태: 관심자 0명
        <EmptyState
          title="첫 관심자를 등록하세요"
          hint="관심자를 등록하면 오늘의 미션이 여기에 나타납니다."
          action={<ButtonLink href="/guide/seekers/new">관심자 등록</ButtonLink>}
        />
      ) : withMission.length === 0 ? (
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
    </div>
  );
}
