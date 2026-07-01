"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store";
import { EDU_STAGES } from "@/lib/stages";
import type { EduStage, VideoSource } from "@/lib/types";

const SOURCE_LABEL: Record<VideoSource, string> = {
  youtube: "유튜브",
  vimeo: "비메오",
  upload: "자체 업로드",
};
const STAGES: EduStage[] = [1, 2, 3, 4, 5];

// 3-3 강의 큐레이션 보드 — 5단계 세로 스택, 교회별 패키지
export default function CurationPage() {
  const {
    currentUser,
    visibleChurchIds,
    orgName,
    lessonsOf,
    addLesson,
    updateLesson,
    deleteLesson,
    moveLesson,
  } = useStore();
  const toast = useToast();
  const churchIds = currentUser ? visibleChurchIds(currentUser) : [];
  const [churchId, setChurchId] = useState(churchIds[0] ?? "");

  if (!currentUser) return null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">강의 큐레이션 보드</h1>
          <p className="mt-1 text-sm text-mist">
            5단계 패키지를 교회별로 구성합니다.
          </p>
        </div>
        {churchIds.length > 1 && (
          <label className="flex items-center gap-2 text-sm text-mist">
            교회
            <Select
              value={churchId}
              onChange={(e) => setChurchId(e.target.value)}
              className="w-40"
            >
              {churchIds.map((id) => (
                <option key={id} value={id}>
                  {orgName(id)}
                </option>
              ))}
            </Select>
          </label>
        )}
      </header>

      <div className="flex flex-col gap-4">
        {STAGES.map((stage) => (
          <StageSection
            key={stage}
            stage={stage}
            churchId={churchId}
            lessons={lessonsOf(churchId, stage)}
            onAdd={(title, source, url) => {
              addLesson({ churchId, stage, title, source, url });
              toast("강의 추가됨");
            }}
            onUpdate={(id, patch) => {
              updateLesson(id, patch);
              toast("수정됨");
            }}
            onDelete={(id) => {
              deleteLesson(id);
              toast("삭제됨");
            }}
            onMove={moveLesson}
          />
        ))}
      </div>
    </div>
  );
}

function StageSection({
  stage,
  churchId,
  lessons,
  onAdd,
  onUpdate,
  onDelete,
  onMove,
}: {
  stage: EduStage;
  churchId: string;
  lessons: ReturnType<ReturnType<typeof useStore>["lessonsOf"]>;
  onAdd: (title: string, source: VideoSource, url: string) => void;
  onUpdate: (
    id: string,
    patch: { title?: string; source?: VideoSource; url?: string },
  ) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
}) {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState<VideoSource>("youtube");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftSource, setDraftSource] = useState<VideoSource>("youtube");
  const [draftUrl, setDraftUrl] = useState("");

  return (
    <Card>
      <div className="mb-3 flex items-baseline gap-2">
        <span className="nums flex h-7 w-7 items-center justify-center rounded-full bg-ink text-sm font-semibold text-paper">
          {stage}
        </span>
        <h2 className="font-display text-lg font-semibold">
          {EDU_STAGES[stage]}
        </h2>
        <span className="text-xs text-mist">강의 {lessons.length}개</span>
      </div>

      {lessons.length === 0 ? (
        <p className="mb-3 rounded-control bg-paper px-3 py-2 text-sm text-mist">
          강의 없음 — 교인 앱에서 “준비 중”으로 표시됩니다.
        </p>
      ) : (
        <ul className="mb-3 flex flex-col gap-2">
          {lessons.map((l, i) => (
            <li
              key={l.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-control border border-line px-3 py-2"
            >
              <span className="nums w-5 text-sm text-mist">{l.order}</span>
              {editingId === l.id ? (
                <>
                  <Input
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="강의 제목"
                    className="h-9 min-w-40 flex-1"
                  />
                  <Select
                    value={draftSource}
                    onChange={(e) =>
                      setDraftSource(e.target.value as VideoSource)
                    }
                    className="h-9 w-32"
                  >
                    {Object.entries(SOURCE_LABEL).map(([v, label]) => (
                      <option key={v} value={v}>
                        {label}
                      </option>
                    ))}
                  </Select>
                  <Input
                    value={draftUrl}
                    onChange={(e) => setDraftUrl(e.target.value)}
                    placeholder={
                      draftSource === "upload"
                        ? "파일 URL (선택)"
                        : draftSource === "vimeo"
                          ? "https://vimeo.com/..."
                          : "https://youtu.be/..."
                    }
                    className="h-9 min-w-48 flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      onUpdate(l.id, {
                        title: draftTitle,
                        source: draftSource,
                        url: draftUrl.trim() || "#",
                      });
                      setEditingId(null);
                    }}
                  >
                    저장
                  </Button>
                  <Button
                    size="sm"
                    variant="quiet"
                    onClick={() => setEditingId(null)}
                  >
                    취소
                  </Button>
                </>
              ) : (
                <>
                  <div className="min-w-40 flex-1">
                    <p className="font-medium">{l.title}</p>
                    {l.url && l.url !== "#" && (
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-xs text-royal hover:underline"
                      >
                        {l.url}
                      </a>
                    )}
                  </div>
                  <span className="rounded-full bg-paper px-2 py-0.5 text-xs text-mist">
                    {SOURCE_LABEL[l.source]}
                  </span>
                  <div className="flex items-center gap-1">
                    <IconBtn
                      label="위로"
                      disabled={i === 0}
                      onClick={() => onMove(l.id, -1)}
                    >
                      ↑
                    </IconBtn>
                    <IconBtn
                      label="아래로"
                      disabled={i === lessons.length - 1}
                      onClick={() => onMove(l.id, 1)}
                    >
                      ↓
                    </IconBtn>
                    <IconBtn
                      label="편집"
                      onClick={() => {
                        setEditingId(l.id);
                        setDraftTitle(l.title);
                        setDraftSource(l.source);
                        setDraftUrl(l.url && l.url !== "#" ? l.url : "");
                      }}
                    >
                      ✎
                    </IconBtn>
                    <IconBtn label="삭제" onClick={() => onDelete(l.id)}>
                      🗑
                    </IconBtn>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 강의 추가 */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="강의 제목"
          className="h-9 min-w-40 flex-1"
        />
        <Select
          value={source}
          onChange={(e) => setSource(e.target.value as VideoSource)}
          className="h-9 w-32"
        >
          {Object.entries(SOURCE_LABEL).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </Select>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={
            source === "upload"
              ? "파일 URL (선택)"
              : source === "vimeo"
                ? "https://vimeo.com/..."
                : "https://youtu.be/..."
          }
          className="h-9 min-w-48 flex-1"
        />
        <Button
          size="sm"
          disabled={!title.trim() || !churchId}
          onClick={() => {
            onAdd(title.trim(), source, url.trim());
            setTitle("");
            setSource("youtube");
            setUrl("");
          }}
        >
          + 강의 추가
        </Button>
      </div>
    </Card>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-control text-mist hover:bg-paper hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}
