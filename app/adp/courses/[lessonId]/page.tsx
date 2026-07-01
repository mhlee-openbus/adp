"use client";

import { useParams, useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store";
import type { VideoSource } from "@/lib/types";

const SOURCE_LABEL: Record<VideoSource, string> = {
  youtube: "유튜브",
  vimeo: "비메오",
  upload: "자체 업로드",
};

// 1-4 강의 시청 (교인). 재생은 placeholder, "완료" 버튼으로 판정(재생률 추적 없음).
export default function WatchPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const toast = useToast();
  const { currentUser, getMemberByUser, lessonsOf, completeLesson } =
    useStore();

  if (!currentUser) return null;
  const member = getMemberByUser(currentUser.id);
  if (!member) return null;

  const lessons = lessonsOf(member.churchId, member.eduStage);
  const lesson = lessons.find((l) => l.id === lessonId);

  if (!lesson) {
    return (
      <div className="p-5">
        <EmptyState
          title="강의를 찾을 수 없습니다"
          hint="현재 단계의 강의만 시청할 수 있어요."
          action={<ButtonLink href="/adp/courses">강의 목록</ButtonLink>}
        />
      </div>
    );
  }

  const completed = member.completedLessonIds.includes(lesson.id);
  const idx = lessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = lessons[idx + 1];
  const isLastInStage = idx === lessons.length - 1;

  const onComplete = () => {
    const { promoted } = completeLesson(member.id, lesson.id);
    toast("완료됨");
    if (promoted) {
      router.push("/adp/promoted");
    } else if (nextLesson) {
      router.push(`/adp/courses/${nextLesson.id}`);
    } else {
      router.push("/adp/courses");
    }
  };

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* 영상 플레이어 placeholder */}
      <div className="flex aspect-video w-full items-center justify-center rounded-card bg-ink text-paper">
        <div className="text-center">
          <p className="text-3xl" aria-hidden>
            ▶
          </p>
          <p className="mt-1 text-xs text-paper/70">
            {SOURCE_LABEL[lesson.source]} 영상
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs text-mist">강의 {lesson.order}</p>
        <h2 className="font-display mt-0.5 text-xl font-bold">{lesson.title}</h2>
      </div>

      {/* 다음 강의 안내 */}
      <Card className="bg-paper/60">
        <p className="text-xs font-medium text-mist">다음 강의</p>
        <p className="mt-1 font-medium">
          {nextLesson
            ? nextLesson.title
            : isLastInStage
              ? "이 단계의 마지막 강의입니다 — 완료 시 자동 승급"
              : "—"}
        </p>
      </Card>

      {completed ? (
        <div className="flex flex-col gap-2">
          <p className="text-center text-sm font-medium text-sage">
            이미 완료한 강의입니다 ✓
          </p>
          {nextLesson ? (
            <ButtonLink full href={`/adp/courses/${nextLesson.id}`}>
              다음 강의로
            </ButtonLink>
          ) : (
            <ButtonLink full variant="quiet" href="/adp/courses">
              강의 목록으로
            </ButtonLink>
          )}
        </div>
      ) : (
        <Button full onClick={onComplete}>
          완료
        </Button>
      )}
    </div>
  );
}
