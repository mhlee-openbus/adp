"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Table, Td, Tr } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store";

// 3-6 바이블가이드 관리
export default function GuidesPage() {
  const {
    currentUser,
    users,
    visibleChurchIds,
    guideSeekers,
    setBibleGuide,
    orgName,
  } = useStore();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");

  if (!currentUser) return null;
  const scope = visibleChurchIds(currentUser);
  const inScope = users.filter((u) => scope.includes(u.churchId));
  const guides = inScope.filter((u) => u.isBibleGuide);
  const candidates = inScope.filter(
    (u) => !u.isBibleGuide && (!q.trim() || u.name.includes(q.trim())),
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">바이블가이드 관리</h1>
          <p className="mt-1 text-sm text-mist">
            교회 회원 중 바이블가이드 역할을 지정/해제합니다.
          </p>
        </div>
        <Button onClick={() => setAdding((a) => !a)}>바이블가이드 추가</Button>
      </header>

      {adding && (
        <Card className="flex flex-col gap-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="기존 회원 이름 검색"
            className="max-w-xs"
          />
          {candidates.length === 0 ? (
            <p className="text-sm text-mist">해당하는 회원이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {candidates.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between rounded-control border border-line px-4 py-2.5"
                >
                  <span>
                    <span className="font-medium">{u.name}</span>
                    <span className="ml-2 text-xs text-mist">
                      {orgName(u.churchId)}
                    </span>
                  </span>
                  <Button
                    size="sm"
                    onClick={() => {
                      setBibleGuide(u.id, true);
                      toast(`${u.name} 님에게 역할 부여됨`);
                    }}
                  >
                    역할 부여
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {guides.length === 0 ? (
        <EmptyState
          title="지정된 바이블가이드가 없습니다"
          hint="‘바이블가이드 추가’로 회원에게 역할을 부여하세요."
        />
      ) : (
        <Table columns={["이름", "교회", "담당 관심자", ""]}>
          {guides.map((g) => (
            <Tr key={g.id}>
              <Td className="font-medium">{g.name}</Td>
              <Td className="text-mist">{orgName(g.churchId)}</Td>
              <Td className="nums">{guideSeekers(g.id).length}명</Td>
              <Td className="text-right">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    const n = guideSeekers(g.id).length;
                    setBibleGuide(g.id, false);
                    toast(
                      n > 0
                        ? `역할 해제 · 담당 ${n}명 미배정으로 풀림`
                        : "역할 해제됨",
                    );
                  }}
                >
                  역할 해제
                </Button>
              </Td>
            </Tr>
          ))}
        </Table>
      )}
      <p className="text-xs text-mist">
        역할을 해제하면 담당 관심자는 ‘미배정’으로 풀려 관심자 현황에서 다시
        지정할 수 있습니다.
      </p>
    </div>
  );
}
