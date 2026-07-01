"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StagePath } from "@/components/ui/StagePath";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { TODAY } from "@/lib/seed";
import { EDU_LABELS, EDU_STAGES } from "@/lib/stages";
import type { EduStage } from "@/lib/types";

// 만 나이 (고정 TODAY 기준 — SSR/CSR 일치)
function ageOf(birth: string): number {
  const [by, bm, bd] = birth.split("-").map(Number);
  const [ty, tm, td] = TODAY.split("-").map(Number);
  let age = ty - by;
  if (tm < bm || (tm === bm && td < bd)) age -= 1;
  return age;
}

// 정의 목록 한 줄. 값이 없으면 "—".
function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="shrink-0 text-sm text-mist">{label}</dt>
      <dd className="text-right text-sm font-medium">
        {value ? value : <span className="text-mist">—</span>}
      </dd>
    </div>
  );
}

// 우리교회 현황 > 교인 상세 (보기 전용)
export default function ChurchMemberDetailPage() {
  const { memberId } = useParams<{ memberId: string }>();
  const { currentUser, membersInScope, getUser, orgName, lessonsOf } =
    useStore();
  if (!currentUser) return null;

  const member = membersInScope(currentUser).find((m) => m.id === memberId);
  if (!member) {
    return (
      <div className="p-5">
        <EmptyState
          title="교인을 찾을 수 없습니다"
          hint="권한 범위 밖이거나 삭제된 교인일 수 있어요."
          action={<ButtonLink href="/adp/church">우리교회 현황</ButtonLink>}
        />
      </div>
    );
  }

  const user = getUser(member.userId);

  // 단계별 진도 (1~5)
  const perStage = ([1, 2, 3, 4, 5] as EduStage[]).map((s) => {
    const lessons = lessonsOf(member.churchId, s);
    const done = lessons.filter((l) =>
      member.completedLessonIds.includes(l.id),
    ).length;
    return { stage: s, total: lessons.length, done };
  });
  const allTotal = perStage.reduce((sum, p) => sum + p.total, 0);
  const allDone = perStage.reduce((sum, p) => sum + p.done, 0);
  const current = perStage.find((p) => p.stage === member.eduStage)!;

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* 뒤로 */}
      <Link
        href="/adp/church"
        className="text-sm text-mist hover:text-ink"
      >
        ‹ 우리교회 현황
      </Link>

      {/* 헤더 */}
      <div>
        <p className="text-sm text-mist">
          {orgName(member.churchId)} ·{" "}
          {member.joinPath === "signup" ? "직접 가입" : "관리자 등록"}
        </p>
        <h2 className="font-display mt-0.5 text-2xl font-bold">
          {user?.name ?? "—"}
        </h2>
        <p className="mt-1 text-sm text-mist">
          현재 단계 · {member.eduStage}.{EDU_STAGES[member.eduStage]}
        </p>
      </div>

      {/* 개인정보 (보기용) */}
      <Card className="flex flex-col gap-0">
        <p className="mb-1 text-sm font-medium text-mist">개인정보</p>
        <dl className="divide-y divide-line">
          <InfoRow label="연락처" value={member.phone} />
          <InfoRow label="이메일" value={member.email} />
          <InfoRow
            label="생년월일"
            value={
              member.birthDate
                ? `${member.birthDate} (만 ${ageOf(member.birthDate)}세)`
                : undefined
            }
          />
          <InfoRow
            label="성별"
            value={
              member.gender
                ? member.gender === "male"
                  ? "남"
                  : "여"
                : undefined
            }
          />
          <InfoRow label="주소" value={member.address} />
          <InfoRow label="교육 등록일" value={member.registeredAt} />
        </dl>
      </Card>

      {/* 5단계 여정 */}
      <Card>
        <p className="mb-3 text-sm font-medium text-mist">교육 여정</p>
        <StagePath labels={EDU_LABELS} current={member.eduStage} />
      </Card>

      {/* 현재 단계 진도율 */}
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-mist">
            현재 단계 진도율 · {EDU_STAGES[member.eduStage]}
          </p>
          <span className="nums text-sm text-mist">
            {current.total > 0
              ? Math.round((current.done / current.total) * 100)
              : 0}
            %
          </span>
        </div>
        <ProgressBar value={current.done} total={current.total} />
      </Card>

      {/* 단계별 진도 */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-mist">단계별 진도</p>
          <span className="nums text-xs text-mist">
            전체 {allDone}/{allTotal} 강의
          </span>
        </div>
        {perStage.map((p) => (
          <div key={p.stage} className="flex items-center gap-3">
            <span
              className={
                "w-28 shrink-0 text-sm " +
                (p.stage === member.eduStage
                  ? "font-semibold text-ink"
                  : "text-mist")
              }
            >
              {p.stage}.{EDU_STAGES[p.stage]}
            </span>
            <ProgressBar
              className="flex-1"
              value={p.done}
              total={p.total}
            />
          </div>
        ))}
      </Card>
    </div>
  );
}
