"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store";

type Filter = "all" | "open" | "answered";

// 3-8 질문 관리 (관리자) — 교인들이 올린 질문을 확인하고 답변 (1:다)
export default function AdminQuestionsPage() {
  const { currentUser, questionsInScope, getUser, orgName, addQuestionReply } =
    useStore();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const all = useMemo(
    () => (currentUser ? questionsInScope(currentUser) : []),
    [currentUser, questionsInScope],
  );

  const isAnswered = (item: (typeof all)[number]) =>
    item.replies.some((r) => r.role === "admin");

  const filtered = useMemo(() => {
    const kw = q.trim();
    return all.filter((item) => {
      const author = getUser(item.authorId)?.name ?? "";
      const matchKw = !kw || item.title.includes(kw) || author.includes(kw);
      const ans = isAnswered(item);
      const matchFilter =
        filter === "all" || (filter === "answered" ? ans : !ans);
      return matchKw && matchFilter;
    });
  }, [all, q, filter, getUser]);

  if (!currentUser) return null;

  const openCount = all.filter((i) => !isAnswered(i)).length;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-bold">질문 관리</h1>
        <p className="mt-1 text-sm text-mist">
          교인이 올린 질문을 확인하고 답변합니다 · 답변 대기{" "}
          <span className="nums font-semibold text-ink">{openCount}</span>건
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="제목·작성자 검색"
          className="max-w-xs"
        />
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          className="w-36"
        >
          <option value="all">전체</option>
          <option value="open">답변 대기</option>
          <option value="answered">답변 완료</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={all.length === 0 ? "등록된 질문이 없습니다" : "결과 없음"}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((item) => {
            const author = getUser(item.authorId);
            const answered = isAnswered(item);
            const expanded = openId === item.id;
            return (
              <li key={item.id}>
                <Card className="flex flex-col gap-0" pad={false}>
                  {/* 헤더 행 */}
                  <button
                    onClick={() => {
                      setOpenId(expanded ? null : item.id);
                      setDraft("");
                    }}
                    className="flex items-center justify-between gap-3 p-4 text-left"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{item.title}</p>
                        {answered ? (
                          <span className="shrink-0 rounded-full bg-sage-soft px-2 py-0.5 text-xs text-sage">
                            답변 완료
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-amber-soft px-2 py-0.5 text-xs text-amber">
                            답변 대기
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-mist">
                        {author?.name ?? "—"} · {orgName(item.churchId)} ·{" "}
                        <span className="nums">{item.createdAt}</span>
                      </p>
                    </div>
                    <span className="shrink-0 text-mist" aria-hidden>
                      {expanded ? "▲" : "▼"}
                    </span>
                  </button>

                  {expanded && (
                    <div className="flex flex-col gap-3 border-t border-line p-4">
                      {/* 질문 본문 */}
                      <div className="rounded-card bg-royal-soft/40 p-3">
                        <p className="mb-1 text-xs font-medium text-royal">
                          {author?.name ?? "교인"} 님의 질문
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-ink">
                          {item.body}
                        </p>
                      </div>

                      {/* 스레드 */}
                      {item.replies.length > 0 && (
                        <ul className="flex flex-col gap-2">
                          {item.replies.map((r) => {
                            const admin = r.role === "admin";
                            return (
                              <li
                                key={r.id}
                                className={
                                  "rounded-card border p-3 " +
                                  (admin
                                    ? "border-sage/30 bg-sage-soft/40"
                                    : "border-line bg-paper")
                                }
                              >
                                <p
                                  className={
                                    "mb-1 text-xs font-medium " +
                                    (admin ? "text-sage" : "text-mist")
                                  }
                                >
                                  {admin
                                    ? `${getUser(r.authorId)?.name ?? "담당자"} (답변)`
                                    : `${author?.name ?? "교인"} (추가 문의)`}{" "}
                                  · <span className="nums">{r.createdAt}</span>
                                </p>
                                <p className="whitespace-pre-wrap text-sm text-ink">
                                  {r.text}
                                </p>
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      {/* 답변 작성 */}
                      <div className="flex flex-col gap-2">
                        <Textarea
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          rows={3}
                          placeholder="답변을 입력하세요."
                        />
                        <div className="flex justify-end">
                          <Button
                            disabled={!draft.trim()}
                            onClick={() => {
                              addQuestionReply(item.id, draft.trim());
                              toast("답변이 등록되었습니다");
                              setDraft("");
                            }}
                          >
                            답변 등록
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
