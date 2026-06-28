"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { TagInput } from "@/components/ui/TagInput";
import { RepeatableField } from "@/components/ui/RepeatableField";
import { MobileTopBar } from "@/components/layout/DeviceFrame";
import { useToast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store";
import type { Anniversary } from "@/lib/types";

const ANNIV_TYPES = ["생일", "결혼기념일", "기타"];

// 2-4 관심자 등록 — 시작 단계 준비(1) 자동
export default function SeekerNewPage() {
  const router = useRouter();
  const toast = useToast();
  const { addSeeker } = useStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relations, setRelations] = useState<string[]>([]);
  const [annivs, setAnnivs] = useState<Anniversary[]>([]);

  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const id = addSeeker({
      name: name.trim(),
      phone: phone.trim() || undefined,
      relations,
      anniversaries: annivs.filter((a) => a.date),
    });
    toast("등록됨");
    if (id) router.replace(`/guide/seekers/${id}`);
  };

  return (
    <div className="flex min-h-full flex-col">
      <MobileTopBar
        title="관심자 등록"
        left={
          <button
            onClick={() => router.back()}
            className="text-sm text-mist hover:text-ink"
          >
            ←
          </button>
        }
      />
      <div className="flex flex-col gap-5 p-5">
        <Field label="이름" required htmlFor="s-name">
          <Input
            id="s-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
          />
        </Field>

        <Field label="전화번호" htmlFor="s-phone">
          <Input
            id="s-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000"
            inputMode="tel"
          />
        </Field>

        <Field label="관계" hint="여러 개 추가 가능 (예: 친구+동료)">
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
            empty="기념일은 없어도 저장할 수 있어요."
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

        <p className="text-xs text-mist">시작 단계는 1.준비로 자동 설정됩니다.</p>

        <Button full disabled={!canSave} onClick={save}>
          저장
        </Button>
      </div>
    </div>
  );
}
