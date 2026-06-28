"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { eduName } from "@/lib/stages";
import type { VideoSource } from "@/lib/types";

const SOURCE_LABEL: Record<VideoSource, string> = {
  youtube: "유튜브",
  vimeo: "비메오",
  upload: "자체 업로드",
};

// 1-3 강의 목록 (교인) — 현재 단계 패키지를 순서대로, 순차 잠금
export default function CoursesPage() {
  const { currentUser, getMemberByUser, lessonsOf, isLessonUnlocked } =
    useStore();
  if (!currentUser) return null;
  const member = getMemberByUser(currentUser.id);
  if (!member) return null;

  const lessons = lessonsOf(member.churchId, member.eduStage);
  const done = lessons.filter((l) => member.completedLessonIds.includes(l.id));

  return (
    <div className="flex flex-col gap-5 p-5">
      <div>
        <p className="text-sm text-mist">현재 단계</p>
        <h2 className="font-display mt-0.5 text-2xl font-bold">
          {member.eduStage}.{eduName(member.eduStage)}
        </h2>
      </div>

      {lessons.length === 0 ? (
        <EmptyState
          title="준비 중"
          hint="이 단계의 강의가 아직 등록되지 않았습니다."
        />
      ) : (
        <>
          <Card>
            <p className="mb-2 text-sm font-medium text-mist">진도율</p>
            <ProgressBar value={done.length} total={lessons.length} />
          </Card>

          <ul className="flex flex-col gap-2">
            {lessons.map((l) => {
              const completed = member.completedLessonIds.includes(l.id);
              const unlocked = isLessonUnlocked(member.id, l.id);
              const body = (
                <div className="flex items-center gap-3">
                  <span
                    className={
                      "nums flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold " +
                      (completed
                        ? "bg-sage text-white"
                        : unlocked
                          ? "bg-royal-soft text-royal"
                          : "bg-paper text-mist")
                    }
                  >
                    {completed ? "✓" : l.order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={
                        "truncate font-medium " +
                        (unlocked ? "text-ink" : "text-mist")
                      }
                    >
                      {l.title}
                    </p>
                    <p className="text-xs text-mist">
                      {SOURCE_LABEL[l.source]}
                      {completed
                        ? " · 완료"
                        : unlocked
                          ? ""
                          : " · 잠김"}
                    </p>
                  </div>
                  {!unlocked && !completed && (
                    <span className="text-mist" aria-hidden>
                      🔒
                    </span>
                  )}
                </div>
              );

              return (
                <li key={l.id}>
                  {unlocked ? (
                    <Link
                      href={`/adp/courses/${l.id}`}
                      className="block rounded-card border border-line bg-white p-3 hover:border-royal"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div
                      aria-disabled
                      className="cursor-not-allowed rounded-card border border-line bg-white/60 p-3"
                    >
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
