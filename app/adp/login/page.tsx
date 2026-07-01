"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store";
import { eduName } from "@/lib/stages";
import { Logo } from "@/components/ui/Logo";
import type { AccountType } from "@/lib/types";

// 1-1 회원가입 / 로그인 (ADP 앱). 목 로그인(비밀번호 검증 없음).
export default function AdpLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { users, login, addMember, getMemberByUser } = useStore();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [mode, setMode] = useState<"member" | "pastor">("member");

  // 로그인 대상: 교인 모드 = 교인(멤버) / 목회자·관리자 모드 = 목회자 또는 관리자 권한
  const memberUsers = users.filter((u) => getMemberByUser(u.id));
  const staffUsers = users.filter(
    (u) => u.accountType === "pastor" || u.adminLevel,
  );
  const list = mode === "member" ? memberUsers : staffUsers;

  const doLogin = (userId: string) => {
    login(userId, mode);
    router.replace(mode === "pastor" ? "/adp/church" : "/adp");
  };

  return (
    <div className="flex min-h-full flex-col px-6 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size={76} />
        <p className="text-mist mt-5 text-sm font-medium">제칠일안식일예수재림교회</p>
        <h1 className="font-display mt-1 text-3xl font-bold">ADP</h1>
        <p className="text-mist mt-1 text-sm">교인 교육 플랫폼</p>
      </div>

      {/* 로그인 / 회원가입 전환 */}
      <div className="mb-6 flex rounded-control border border-line bg-white p-1 text-sm">
        {(["login", "signup"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "flex-1 rounded-[6px] py-2 font-medium " +
              (tab === t ? "bg-royal text-white" : "text-mist")
            }
          >
            {t === "login" ? "로그인" : "회원가입"}
          </button>
        ))}
      </div>

      {tab === "login" ? (
        <div className="flex flex-col gap-4">
          {/* 모드 선택: 교인 / 목회자·관리자 */}
          <div className="flex gap-2">
            {(
              [
                ["member", "교인"],
                ["pastor", "목회자·관리자"],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={
                  "flex-1 rounded-control border py-2 text-sm font-medium " +
                  (mode === m
                    ? "border-royal bg-royal-soft text-royal"
                    : "border-line text-mist")
                }
              >
                {label}
              </button>
            ))}
          </div>

          <p className="text-xs text-mist">
            계정을 선택해 로그인하세요.
          </p>

          <div className="flex flex-col gap-2">
            {list.map((u) => {
              const m = getMemberByUser(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => doLogin(u.id)}
                  className="flex items-center justify-between rounded-card border border-line bg-white px-4 py-3 text-left hover:border-royal"
                >
                  <span className="font-medium">{u.name}</span>
                  <span className="text-xs text-mist">
                    {mode === "member"
                      ? m
                        ? eduName(m.eduStage)
                        : "교인 아님"
                      : u.accountType === "pastor"
                        ? "목회자"
                        : "관리자"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <SignupForm
          onSignup={(name, type) => {
            if (type === "pastor") {
              // 목회자 가입 검증 방식은 미정(자가선택 vs 관리자 승인) — 명세 §6
              toast("목회자 계정 승인 방식은 미정입니다");
              return;
            }
            // 일반회원 가입 → 교인으로 등록, 시작 1.영혼구원 자동
            const userId = addMember({
              name,
              churchId: "church-central",
              startStage: 1,
            });
            login(userId, "member");
            router.replace("/adp");
          }}
        />
      )}
    </div>
  );
}

function SignupForm({
  onSignup,
}: {
  onSignup: (name: string, type: AccountType) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("member");

  return (
    <Card className="flex flex-col gap-4">
      <Field label="이름" required htmlFor="signup-name">
        <Input
          id="signup-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
        />
      </Field>
      <Field label="계정 타입" hint="가입 시 결정 (목회자 / 일반회원)">
        <div className="flex gap-2">
          {(
            [
              ["member", "일반회원"],
              ["pastor", "목회자"],
            ] as const
          ).map(([t, label]) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={
                "flex-1 rounded-control border py-2 text-sm font-medium " +
                (type === t
                  ? "border-royal bg-royal-soft text-royal"
                  : "border-line text-mist")
              }
            >
              {label}
            </button>
          ))}
        </div>
      </Field>
      <Button
        full
        disabled={!name.trim()}
        onClick={() => onSignup(name.trim(), type)}
      >
        가입하고 시작하기
      </Button>
    </Card>
  );
}
