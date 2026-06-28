"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StageChip } from "@/components/ui/StageChip";
import { useStore } from "@/lib/store";
import {
  EDU_STAGES,
  ORG_LEVEL_LABELS,
  SEEKER_STAGES,
} from "@/lib/stages";
import type { EduStage, SeekerStage } from "@/lib/types";

// 3-2 대시보드 (통계) — 권한 범위 안에서 교육·전도 현황 한눈에
export default function AdminDashboard() {
  const { currentUser, membersInScope, seekersInScope, visibleChurchIds, orgName } =
    useStore();
  if (!currentUser) return null;

  const members = membersInScope(currentUser);
  const seekers = seekersInScope(currentUser);
  const churchIds = visibleChurchIds(currentUser);
  const scopeLabel = currentUser.adminLevel
    ? ORG_LEVEL_LABELS[currentUser.adminLevel]
    : "교회";

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm text-mist">
          {scopeLabel} 단위 · {churchIds.map((id) => orgName(id)).join(", ")}
        </p>
        <h1 className="font-display mt-1 text-3xl font-bold">대시보드</h1>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* ① 교인 단계별 분포 */}
        <Distribution
          href="/admin/members"
          title="교인 단계별 분포"
          total={members.length}
          totalLabel="교인"
          rows={([1, 2, 3, 4, 5] as EduStage[]).map((s) => ({
            n: s,
            label: EDU_STAGES[s],
            count: members.filter((m) => m.eduStage === s).length,
          }))}
        />

        {/* ② 관심자 단계별 분포 */}
        <Distribution
          href="/admin/seekers"
          title="관심자 단계별 분포"
          total={seekers.length}
          totalLabel="관심자"
          rows={([1, 2, 3, 4, 5] as SeekerStage[]).map((s) => ({
            n: s,
            label: SEEKER_STAGES[s],
            count: seekers.filter((k) => k.stage === s).length,
          }))}
        />
      </div>

      {/* ③ 신규 유입 추이 (보기용 목 데이터) */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">신규 유입 추이</h2>
          <span className="text-xs text-mist">최근 6개월 · 목 데이터</span>
        </div>
        <div className="flex h-40 items-end gap-3">
          {[3, 5, 4, 7, 6, 9].map((v, i) => (
            <div
              key={i}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1"
            >
              <span className="nums text-xs text-mist">{v}</span>
              <div
                className="w-full rounded-t bg-royal/80"
                style={{ height: `${(v / 9) * 90}%` }}
              />
              <span className="text-xs text-mist">{i + 1}월</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Distribution({
  href,
  title,
  total,
  totalLabel,
  rows,
}: {
  href: string;
  title: string;
  total: number;
  totalLabel: string;
  rows: { n: number; label: string; count: number }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <Link href={href} className="block">
      <Card className="h-full transition-colors hover:border-royal">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-semibold">{title}</h2>
          <span className="text-sm text-mist">
            총 <span className="nums font-semibold text-ink">{total}</span>{" "}
            {totalLabel}
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          {rows.map((r) => (
            <div key={r.n} className="flex items-center gap-3">
              <div className="w-24 shrink-0">
                <StageChip n={r.n} label={r.label} tone="default" />
              </div>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-paper">
                <div
                  className="h-full rounded-full bg-royal"
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
              </div>
              <span className="nums w-5 shrink-0 text-right text-sm font-semibold">
                {r.count}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </Link>
  );
}
