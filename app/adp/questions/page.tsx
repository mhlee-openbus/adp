"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store";

// 질문 — 교인은 1:1 게시판(본인 질문), 목회자는 1:다 답변 화면
export default function QuestionsPage() {
  const { viewMode } = useStore();
  return viewMode === "pastor" ? <PastorView /> : <MemberView />;
}

// ===== 교인 (1:1) =====
function MemberView() {
  const { currentUser, myQuestions, addQuestion } = useStore();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  if (!currentUser) return null;

  const questions = myQuestions(currentUser.id);
  const answered = (q: (typeof questions)[number]) =>
    q.replies.some((r) => r.role === "admin");

  const submit = () => {
    if (!title.trim()) return;
    addQuestion({ title: title.trim(), body: body.trim() });
    toast("질문이 등록되었습니다");
    setTitle("");
    setBody("");
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">질문</h2>
          <p className="mt-0.5 text-sm text-mist">
            궁금한 점을 남기면 담당자가 답변해 드려요.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen((o) => !o)}>
          {open ? "닫기" : "질문하기"}
        </Button>
      </div>

      {open && (
        <Card className="flex flex-col gap-3">
          <Field label="제목" required htmlFor="q-title">
            <Input
              id="q-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="무엇이 궁금하신가요?"
            />
          </Field>
          <Field label="내용" htmlFor="q-body">
            <Textarea
              id="q-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="자세히 적어주시면 답변에 도움이 됩니다."
            />
          </Field>
          <Button full disabled={!title.trim()} onClick={submit}>
            질문 등록
          </Button>
        </Card>
      )}

      {questions.length === 0 ? (
        <EmptyState
          title="아직 남긴 질문이 없어요"
          hint="‘질문하기’로 첫 질문을 남겨보세요."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {questions.map((q) => (
            <li key={q.id}>
              <Link
                href={`/adp/questions/${q.id}`}
                className="block rounded-card border border-line bg-white p-4 hover:border-royal"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{q.title}</p>
                  {answered(q) ? (
                    <span className="shrink-0 rounded-full bg-sage-soft px-2 py-0.5 text-xs text-sage">
                      답변 완료
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-amber-soft px-2 py-0.5 text-xs text-amber">
                      답변 대기
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-mist">{q.body}</p>
                <p className="nums mt-2 text-xs text-mist">{q.createdAt}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ===== 목회자 (1:다 · 답변) =====
type Filter = "all" | "open" | "answered";

function PastorView() {
  const { currentUser, questionsInScope, getUser, addQuestionReply } =
    useStore();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  if (!currentUser) return null;

  const all = questionsInScope(currentUser);
  const isAnswered = (item: (typeof all)[number]) =>
    item.replies.some((r) => r.role === "admin");
  const openCount = all.filter((i) => !isAnswered(i)).length;

  const items = all.filter((i) =>
    filter === "all" ? true : filter === "answered" ? isAnswered(i) : !isAnswered(i),
  );

  const FILTERS: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "전체", count: all.length },
    { key: "open", label: "대기", count: openCount },
    { key: "answered", label: "완료", count: all.length - openCount },
  ];

  return (
    <div className="flex flex-col gap-4 p-5">
      <div>
        <h2 className="font-display text-2xl font-bold">질문</h2>
        <p className="mt-0.5 text-sm text-mist">
          교인 질문에 답변합니다 · 대기{" "}
          <span className="nums font-semibold text-ink">{openCount}</span>건
        </p>
      </div>

      {/* 필터 */}
      <div className="flex rounded-control border border-line bg-white p-1 text-sm">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={
              "flex-1 rounded-[6px] py-1.5 font-medium " +
              (filter === f.key ? "bg-royal text-white" : "text-mist")
            }
          >
            {f.label}
            <span className="nums ml-1 text-xs opacity-80">{f.count}</span>
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={all.length === 0 ? "등록된 질문이 없습니다" : "해당 질문이 없습니다"}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const author = getUser(item.authorId);
            const answered = isAnswered(item);
            const expanded = openId === item.id;
            return (
              <li key={item.id}>
                <Card className="flex flex-col gap-0" pad={false}>
                  <button
                    onClick={() => {
                      setOpenId(expanded ? null : item.id);
                      setDraft("");
                    }}
                    className="flex items-center justify-between gap-2 p-4 text-left"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{item.title}</p>
                        {answered ? (
                          <span className="shrink-0 rounded-full bg-sage-soft px-2 py-0.5 text-xs text-sage">
                            완료
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-amber-soft px-2 py-0.5 text-xs text-amber">
                            대기
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-mist">
                        {author?.name ?? "교인"} ·{" "}
                        <span className="nums">{item.createdAt}</span>
                      </p>
                    </div>
                    <span className="shrink-0 text-mist" aria-hidden>
                      {expanded ? "▲" : "▼"}
                    </span>
                  </button>

                  {expanded && (
                    <div className="flex flex-col gap-3 border-t border-line p-4">
                      <div className="rounded-card bg-royal-soft/40 p-3">
                        <p className="mb-1 text-xs font-medium text-royal">
                          {author?.name ?? "교인"} 님의 질문
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-ink">
                          {item.body}
                        </p>
                      </div>

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

                      <div className="flex flex-col gap-2">
                        <Textarea
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          rows={3}
                          placeholder="답변을 입력하세요."
                        />
                        <Button
                          full
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
