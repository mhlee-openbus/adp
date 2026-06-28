"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Select } from "@/components/ui/Field";
import { TagInput } from "@/components/ui/TagInput";
import { RepeatableField } from "@/components/ui/RepeatableField";
import { StageChip } from "@/components/ui/StageChip";
import { StagePath } from "@/components/ui/StagePath";
import { EmptyState } from "@/components/ui/EmptyState";
import { MobileTopBar } from "@/components/layout/DeviceFrame";
import { useToast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store";
import { SEEKER_LABELS, seekerName } from "@/lib/stages";
import type { Anniversary, SeekerStage } from "@/lib/types";

const ANNIV_TYPES = ["생일", "결혼기념일", "기타"];

// 2-5 관심자 상세 (핵심 화면)
export default function SeekerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const {
    seekers,
    missionForSeeker,
    toggleMission,
    setSeekerStage,
    convertSeeker,
    updateSeeker,
  } = useStore();

  const seeker = seekers.find((s) => s.id === id);
  const [open, setOpen] = useState(false);
  // 더보기 편집 상태 (마운트 시 1회 초기화)
  const [phone, setPhone] = useState(seeker?.phone ?? "");
  const [relations, setRelations] = useState<string[]>(seeker?.relations ?? []);
  const [annivs, setAnnivs] = useState<Anniversary[]>(
    seeker?.anniversaries ?? [],
  );
  const [memo, setMemo] = useState(seeker?.memo ?? "");

  if (!seeker) {
    return (
      <div className="p-5">
        <EmptyState
          title="관심자를 찾을 수 없습니다"
          action={<ButtonLink href="/guide/seekers">관심자 목록</ButtonLink>}
        />
      </div>
    );
  }

  const mission = missionForSeeker(seeker.id);

  const changeStage = (next: SeekerStage, msg: string) => {
    setSeekerStage(seeker.id, next);
    toast(msg);
  };

  return (
    <div className="flex min-h-full flex-col">
      <MobileTopBar
        title={seeker.name}
        left={
          <button
            onClick={() => router.back()}
            className="text-sm text-mist hover:text-ink"
          >
            ←
          </button>
        }
      />

      <div className="flex flex-col gap-4 p-5">
        {/* 오늘의 미션 — 최상단·가장 크게 (알고리즘 자동 배정) */}
        <Card className="border-amber/40 bg-amber-soft/40">
          <p className="text-xs font-medium text-amber">
            오늘의 미션 · 알고리즘 추천
          </p>
          {mission ? (
            <>
              <p
                className={
                  "font-display mt-1 text-xl font-semibold " +
                  (mission.done ? "text-mist line-through" : "text-ink")
                }
              >
                {mission.text}
              </p>
              <Button
                full
                variant={mission.done ? "quiet" : "primary"}
                className="mt-3"
                onClick={() => {
                  toggleMission(mission.id);
                  toast(mission.done ? "완료 취소됨" : "완료됨");
                }}
              >
                {mission.done ? "완료 취소" : "완료 체크"}
              </Button>
            </>
          ) : (
            <p className="mt-1 text-sm text-mist">오늘 예정된 미션이 없어요.</p>
          )}
        </Card>

        {/* 이름 + 현재 단계 (간단히) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold">{seeker.name}</h2>
            {seeker.converted && (
              <span className="rounded-full bg-sage-soft px-2 py-0.5 text-xs text-sage">
                교인 전환됨
              </span>
            )}
          </div>
          <StageChip
            n={seeker.stage}
            label={seekerName(seeker.stage)}
            tone="current"
          />
        </div>

        <Card>
          <p className="mb-3 text-sm font-medium text-mist">관심자 여정</p>
          <StagePath labels={SEEKER_LABELS} current={seeker.stage} />
          {/* 단계 승급 / 강등 (양방향, 수동) */}
          <div className="mt-4 flex gap-2">
            <Button
              variant="quiet"
              size="sm"
              full
              disabled={seeker.stage <= 1}
              onClick={() =>
                changeStage((seeker.stage - 1) as SeekerStage, "강등됨")
              }
            >
              ↓ 강등
            </Button>
            <Button
              size="sm"
              full
              disabled={seeker.stage >= 5}
              onClick={() =>
                changeStage((seeker.stage + 1) as SeekerStage, "승급됨")
              }
            >
              ↑ 승급
            </Button>
          </div>
        </Card>

        {/* 액션: 교인 전환 · 1:1 화상 */}
        <div className="flex flex-col gap-2">
          <ButtonLink
            href={`/guide/seekers/${seeker.id}/call`}
            variant="quiet"
            full
          >
            📹 1:1 화상 시작
          </ButtonLink>
          <Button
            variant="quiet"
            full
            disabled={seeker.converted}
            onClick={() => {
              convertSeeker(seeker.id);
              toast("교인으로 전환됨");
            }}
          >
            {seeker.converted ? "이미 교인으로 전환됨" : "교인으로 전환"}
          </Button>
          <p className="text-center text-xs text-mist">
            정식 규칙은 보존(5) 단계만 — 프로토타입은 전 단계에서 전환 가능
          </p>
        </div>

        {/* 더보기: 전화·관계·기념일·메모 (접힘) */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center justify-between rounded-control border border-line bg-white px-4 py-3 text-sm font-medium text-mist"
        >
          더보기 (전화·관계·기념일·메모)
          <span aria-hidden>{open ? "▲" : "▼"}</span>
        </button>

        {open && (
          <Card className="flex flex-col gap-4">
            <Field label="전화번호" htmlFor="d-phone">
              <Input
                id="d-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
              />
            </Field>
            <Field label="관계">
              <TagInput
                value={relations}
                onChange={setRelations}
                presets={["가족", "친구", "동료", "미분류"]}
              />
            </Field>
            <Field label="기념일">
              <RepeatableField<Anniversary>
                items={annivs}
                onChange={setAnnivs}
                makeNew={() => ({ type: "생일", date: "" })}
                addLabel="기념일 추가"
                empty="등록된 기념일이 없습니다."
                renderRow={(item, update) => (
                  <>
                    <Select
                      value={item.type}
                      onChange={(e) => update({ type: e.target.value })}
                      className="w-32"
                    >
                      {ANNIV_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                    <Input
                      type="date"
                      value={item.date}
                      onChange={(e) => update({ date: e.target.value })}
                    />
                  </>
                )}
              />
            </Field>
            <Field label="메모" hint="비공개 메모입니다.">
              <Textarea
                rows={3}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="이 관심자에 대한 메모를 남기세요."
              />
            </Field>
            <Button
              onClick={() => {
                updateSeeker(seeker.id, {
                  phone: phone.trim() || undefined,
                  relations,
                  anniversaries: annivs.filter((a) => a.date),
                  memo,
                });
                toast("저장됨");
              }}
            >
              정보 저장
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
