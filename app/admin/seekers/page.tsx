"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { StageChip } from "@/components/ui/StageChip";
import { Table, Td, Tr } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store";
import { SEEKER_STAGES, seekerName } from "@/lib/stages";
import type { SeekerStage } from "@/lib/types";

const STAGES: SeekerStage[] = [1, 2, 3, 4, 5];

// 3-5 관심자 현황 — 교회 전체 관심자 + 담당 매칭 조정(투웨이)
export default function AdminSeekersPage() {
  const {
    currentUser,
    seekersInScope,
    visibleChurchIds,
    users,
    orgName,
    reassignSeeker,
    addSeeker,
  } = useStore();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [stageFilter, setStageFilter] = useState<"all" | SeekerStage>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const churchIds = currentUser ? visibleChurchIds(currentUser) : [];
  const seekers = useMemo(
    () => (currentUser ? seekersInScope(currentUser) : []),
    [currentUser, seekersInScope],
  );

  const filtered = useMemo(() => {
    const kw = q.trim();
    return seekers.filter(
      (s) =>
        (!kw || s.name.includes(kw)) &&
        (stageFilter === "all" || s.stage === stageFilter),
    );
  }, [seekers, q, stageFilter]);

  if (!currentUser) return null;

  // 담당 후보: 범위 내 바이블가이드
  const guidesFor = (churchId: string) =>
    users.filter((u) => u.isBibleGuide && u.churchId === churchId);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">관심자 현황</h1>
          <p className="mt-1 text-sm text-mist">
            관심자 + 담당 바이블가이드 매칭을 조정합니다.
          </p>
        </div>
        <Button onClick={() => setShowAdd((s) => !s)}>관심자 추가</Button>
      </header>

      {showAdd && (
        <AddSeekerForm
          churchIds={churchIds}
          orgName={orgName}
          guidesFor={guidesFor}
          onAdd={(name, churchId, guideId) => {
            addSeeker({
              name,
              relations: [],
              anniversaries: [],
              churchId,
              assignedGuideId: guideId,
            });
            toast("관심자 추가됨");
            setShowAdd(false);
          }}
        />
      )}

      <div className="flex flex-wrap gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="이름으로 검색"
          className="max-w-xs"
        />
        <Select
          value={stageFilter}
          onChange={(e) =>
            setStageFilter(
              e.target.value === "all"
                ? "all"
                : (Number(e.target.value) as SeekerStage),
            )
          }
          className="w-36"
        >
          <option value="all">전체 단계</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}.{SEEKER_STAGES[s]}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={
            seekers.length === 0 ? "등록된 관심자가 없습니다" : "검색 결과 없음"
          }
        />
      ) : (
        <Table
          columns={["이름", "단계", "담당 바이블가이드", "교인 전환", "상세"]}
        >
          {filtered.map((s) => {
            const guides = guidesFor(s.churchId);
            return (
              <Tr key={s.id}>
                <Td className="font-medium">{s.name}</Td>
                <Td>
                  <StageChip
                    n={s.stage}
                    label={seekerName(s.stage)}
                    tone="default"
                  />
                </Td>
                <Td>
                  <Select
                    value={s.assignedGuideId ?? ""}
                    onChange={(e) => {
                      reassignSeeker(s.id, e.target.value || null);
                      toast("담당 재지정됨");
                    }}
                    className="h-9 w-44"
                  >
                    <option value="">(미배정)</option>
                    {guides.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  {s.converted ? (
                    <span className="rounded-full bg-sage-soft px-2 py-0.5 text-xs text-sage">
                      전환됨
                    </span>
                  ) : (
                    <span className="text-mist">—</span>
                  )}
                </Td>
                <Td>
                  <button
                    onClick={() =>
                      setExpanded((id) => (id === s.id ? null : s.id))
                    }
                    className="text-sm text-royal hover:underline"
                  >
                    {expanded === s.id ? "닫기" : "보기"}
                  </button>
                  {expanded === s.id && (
                    <div className="mt-2 space-y-1 rounded-control bg-paper p-3 text-xs text-mist">
                      <p>교회: {orgName(s.churchId)}</p>
                      <p>전화: {s.phone || "—"}</p>
                      <p>관계: {s.relations.join(", ") || "—"}</p>
                      <p>
                        기념일:{" "}
                        {s.anniversaries.length
                          ? s.anniversaries
                              .map((a) => `${a.type} ${a.date}`)
                              .join(", ")
                          : "—"}
                      </p>
                      <p>메모: {s.memo || "—"}</p>
                    </div>
                  )}
                </Td>
              </Tr>
            );
          })}
        </Table>
      )}
      <p className="text-xs text-mist">
        담당을 바꿔도 진행 기록(미션·메모·단계)은 그대로 유지되고 담당자만
        교체됩니다.
      </p>
    </div>
  );
}

function AddSeekerForm({
  churchIds,
  orgName,
  guidesFor,
  onAdd,
}: {
  churchIds: string[];
  orgName: (id: string) => string;
  guidesFor: (churchId: string) => { id: string; name: string }[];
  onAdd: (name: string, churchId: string, guideId: string | null) => void;
}) {
  const [name, setName] = useState("");
  const [churchId, setChurchId] = useState(churchIds[0] ?? "");
  const [guideId, setGuideId] = useState("");
  const guides = guidesFor(churchId);

  return (
    <Card className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">이름</span>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          className="h-9 w-44"
        />
      </label>
      {churchIds.length > 1 && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">교회</span>
          <Select
            value={churchId}
            onChange={(e) => {
              setChurchId(e.target.value);
              setGuideId("");
            }}
            className="h-9 w-40"
          >
            {churchIds.map((id) => (
              <option key={id} value={id}>
                {orgName(id)}
              </option>
            ))}
          </Select>
        </label>
      )}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">담당 (선택)</span>
        <Select
          value={guideId}
          onChange={(e) => setGuideId(e.target.value)}
          className="h-9 w-40"
        >
          <option value="">(미배정)</option>
          {guides.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </label>
      <Button
        disabled={!name.trim() || !churchId}
        onClick={() => onAdd(name.trim(), churchId, guideId || null)}
      >
        추가
      </Button>
    </Card>
  );
}
