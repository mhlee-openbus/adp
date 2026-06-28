"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Table, Td, Tr } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store";
import { EDU_STAGES, eduName } from "@/lib/stages";
import type { EduStage } from "@/lib/types";

const STAGES: EduStage[] = [1, 2, 3, 4, 5];

// 3-4 교인 관리
export default function MembersPage() {
  const {
    currentUser,
    membersInScope,
    visibleChurchIds,
    getUser,
    orgName,
    lessonsOf,
    setMemberStage,
    addMember,
  } = useStore();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const churchIds = currentUser ? visibleChurchIds(currentUser) : [];
  const members = useMemo(
    () => (currentUser ? membersInScope(currentUser) : []),
    [currentUser, membersInScope],
  );

  const filtered = useMemo(() => {
    const kw = q.trim();
    return members.filter((m) => {
      const name = getUser(m.userId)?.name ?? "";
      return !kw || name.includes(kw);
    });
  }, [members, q, getUser]);

  if (!currentUser) return null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">교인 관리</h1>
          <p className="mt-1 text-sm text-mist">
            교인 등록·조회 + 단계 진행 조정
          </p>
        </div>
        <Button onClick={() => setShowAdd((s) => !s)}>교인 수동 등록</Button>
      </header>

      {showAdd && (
        <AddMemberForm
          churchIds={churchIds}
          orgName={orgName}
          onAdd={(name, churchId, startStage) => {
            addMember({ name, churchId, startStage });
            toast("교인 등록됨");
            setShowAdd(false);
          }}
        />
      )}

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="이름으로 검색"
        className="max-w-xs"
      />

      {filtered.length === 0 ? (
        <EmptyState
          title={members.length === 0 ? "등록된 교인이 없습니다" : "검색 결과 없음"}
          hint={
            members.length === 0
              ? "‘교인 수동 등록’으로 첫 교인을 추가하세요."
              : undefined
          }
        />
      ) : (
        <Table columns={["이름", "교회", "현재 단계 (조정)", "진도", "가입 경로"]}>
          {filtered.map((m) => {
            const name = getUser(m.userId)?.name ?? "—";
            const total = lessonsOf(m.churchId, m.eduStage).length;
            const done = lessonsOf(m.churchId, m.eduStage).filter((l) =>
              m.completedLessonIds.includes(l.id),
            ).length;
            return (
              <Tr key={m.id}>
                <Td className="font-medium">{name}</Td>
                <Td className="text-mist">{orgName(m.churchId)}</Td>
                <Td>
                  <Select
                    value={m.eduStage}
                    onChange={(e) => {
                      setMemberStage(m.id, Number(e.target.value) as EduStage);
                      toast(`${eduName(Number(e.target.value) as EduStage)}로 조정됨`);
                    }}
                    className="h-9 w-40"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}.{EDU_STAGES[s]}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td className="nums">
                  {done}/{total}
                </Td>
                <Td className="text-mist">
                  {m.joinPath === "signup" ? "회원가입" : "수동등록"}
                </Td>
              </Tr>
            );
          })}
        </Table>
      )}
    </div>
  );
}

function AddMemberForm({
  churchIds,
  orgName,
  onAdd,
}: {
  churchIds: string[];
  orgName: (id: string) => string;
  onAdd: (name: string, churchId: string, startStage: EduStage) => void;
}) {
  const [name, setName] = useState("");
  const [churchId, setChurchId] = useState(churchIds[0] ?? "");
  const [startStage, setStartStage] = useState<EduStage>(1);

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
            onChange={(e) => setChurchId(e.target.value)}
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
        <span className="font-medium">시작 단계</span>
        <Select
          value={startStage}
          onChange={(e) => setStartStage(Number(e.target.value) as EduStage)}
          className="h-9 w-40"
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}.{EDU_STAGES[s]}
            </option>
          ))}
        </Select>
      </label>
      <Button
        disabled={!name.trim() || !churchId}
        onClick={() => onAdd(name.trim(), churchId, startStage)}
      >
        등록
      </Button>
    </Card>
  );
}
