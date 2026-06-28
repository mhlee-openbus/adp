"use client";

import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { Table, Td, Tr } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store";
import { ORG_LEVEL_LABELS } from "@/lib/stages";
import type { OrgLevel } from "@/lib/types";

// 3-7 권한 / 조직 관리 — 조직 트리는 보기용(CRUD 없음), 권한 부여/회수 + 레벨 지정
export default function AccessPage() {
  const { currentUser, orgs, users, visibleChurchIds, orgName, setAdminLevel } =
    useStore();
  const toast = useToast();
  if (!currentUser) return null;

  const scope = visibleChurchIds(currentUser);
  const inScope = users.filter((u) => scope.includes(u.churchId));

  const union = orgs.find((o) => o.level === "union");
  const conferences = orgs.filter((o) => o.level === "conference");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-bold">권한 / 조직 관리</h1>
        <p className="mt-1 text-sm text-mist">
          상위 레벨일수록 넓게 봅니다 (교회 ⊂ 합회 ⊂ 연합회). 조직 구조는
          보기용입니다.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* 조직 트리 (보기용) */}
        <Card>
          <h2 className="mb-3 font-semibold">조직 트리</h2>
          {union && (
            <ul className="text-sm">
              <li className="font-medium text-ink">🏛 {union.name}</li>
              <li>
                <ul className="mt-1 ml-4 border-l border-line pl-3">
                  {conferences.map((c) => (
                    <li key={c.id} className="mt-1">
                      <span className="text-ink">{c.name}</span>
                      <ul className="mt-1 ml-3 border-l border-line pl-3 text-mist">
                        {orgs
                          .filter(
                            (o) => o.level === "church" && o.parentId === c.id,
                          )
                          .map((ch) => (
                            <li key={ch.id} className="mt-1">
                              {ch.name}
                            </li>
                          ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          )}
          <p className="mt-3 text-xs text-mist">
            * 조직 생성/편집(CRUD)은 이번 범위가 아닙니다.
          </p>
        </Card>

        {/* 회원 권한 */}
        <Card pad={false}>
          <Table columns={["이름", "교회", "계정", "관리자 권한 레벨"]}>
            {inScope.map((u) => (
              <Tr key={u.id}>
                <Td className="font-medium">{u.name}</Td>
                <Td className="text-mist">{orgName(u.churchId)}</Td>
                <Td className="text-mist">
                  {u.accountType === "pastor" ? "목회자" : "일반회원"}
                </Td>
                <Td>
                  <Select
                    value={u.adminLevel ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAdminLevel(u.id, v ? (v as OrgLevel) : null);
                      toast(
                        v
                          ? `${ORG_LEVEL_LABELS[v as OrgLevel]} 권한 부여됨`
                          : "권한 회수됨",
                      );
                    }}
                    className="h-9 w-40"
                  >
                    <option value="">없음</option>
                    <option value="church">교회</option>
                    <option value="conference">합회</option>
                    <option value="union">연합회</option>
                  </Select>
                </Td>
              </Tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
}
