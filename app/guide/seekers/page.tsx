"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { StageChip } from "@/components/ui/StageChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { seekerName } from "@/lib/stages";

// 2-3 관심자 목록 (내가 등록한 관심자 전체, 최근 등록순, 필터 없음)
export default function SeekerListPage() {
  const { currentUser, guideSeekers } = useStore();
  if (!currentUser) return null;

  // 최근 등록순 (등록 시 배열 끝에 추가되므로 역순)
  const seekers = [...guideSeekers(currentUser.id)].reverse();

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">관심자 목록</h2>
        <ButtonLink href="/guide/seekers/new" size="sm">
          관심자 등록
        </ButtonLink>
      </div>

      {seekers.length === 0 ? (
        <EmptyState
          title="첫 관심자를 등록하세요"
          hint="등록한 관심자가 여기에 모입니다."
          action={<ButtonLink href="/guide/seekers/new">관심자 등록</ButtonLink>}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {seekers.map((s) => (
            <li key={s.id}>
              <Link
                href={`/guide/seekers/${s.id}`}
                className="flex items-center justify-between rounded-card border border-line bg-white p-4 hover:border-royal"
              >
                <span className="flex items-center gap-2">
                  <span className="font-medium">{s.name}</span>
                  {s.converted && (
                    <span className="rounded-full bg-sage-soft px-2 py-0.5 text-xs text-sage">
                      교인 전환
                    </span>
                  )}
                </span>
                <StageChip
                  n={s.stage}
                  label={seekerName(s.stage)}
                  tone="default"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
