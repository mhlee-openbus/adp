"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store";

// 질문 상세 (교인) — 질문 + 답변 스레드, 추가 문답 가능
export default function MemberQuestionThreadPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, questions, addQuestionReply } = useStore();
  const toast = useToast();
  const [text, setText] = useState("");
  if (!currentUser) return null;

  const q = questions.find((x) => x.id === id);
  // 본인 질문만 열람 (1:1)
  if (!q || q.authorId !== currentUser.id) {
    return (
      <div className="p-5">
        <EmptyState
          title="질문을 찾을 수 없습니다"
          action={<ButtonLink href="/adp/questions">질문 목록</ButtonLink>}
        />
      </div>
    );
  }

  const send = () => {
    if (!text.trim()) return;
    addQuestionReply(q.id, text.trim());
    toast("전송되었습니다");
    setText("");
  };

  return (
    <div className="flex flex-col gap-4 p-5">
      <Link href="/adp/questions" className="text-sm text-mist hover:text-ink">
        ‹ 질문 목록
      </Link>

      {/* 질문 본문 */}
      <div>
        <h2 className="font-display text-xl font-bold">{q.title}</h2>
        <p className="nums mt-0.5 text-xs text-mist">{q.createdAt}</p>
      </div>
      <Card className="bg-royal-soft/50">
        <p className="mb-1 text-xs font-medium text-royal">내 질문</p>
        <p className="whitespace-pre-wrap text-sm text-ink">{q.body}</p>
      </Card>

      {/* 스레드 */}
      {q.replies.length === 0 ? (
        <p className="py-2 text-center text-sm text-mist">
          아직 답변이 없어요. 담당자가 확인 후 답변드립니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {q.replies.map((r) => {
            const isAdmin = r.role === "admin";
            return (
              <li
                key={r.id}
                className={isAdmin ? "" : "flex flex-col items-end"}
              >
                <div
                  className={
                    "max-w-[85%] rounded-card border p-3 " +
                    (isAdmin
                      ? "border-sage/30 bg-sage-soft/50"
                      : "border-line bg-white")
                  }
                >
                  <p
                    className={
                      "mb-1 text-xs font-medium " +
                      (isAdmin ? "text-sage" : "text-mist")
                    }
                  >
                    {isAdmin ? "담당자 답변" : "나"}
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-ink">
                    {r.text}
                  </p>
                  <p className="nums mt-1 text-[11px] text-mist">
                    {r.createdAt}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* 추가 문답 */}
      <Card className="flex flex-col gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="추가로 궁금한 점을 남겨보세요."
        />
        <Button full disabled={!text.trim()} onClick={send}>
          보내기
        </Button>
      </Card>
    </div>
  );
}
