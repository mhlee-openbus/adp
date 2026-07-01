"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { useStore } from "@/lib/store";
import { ORG_LEVEL_LABELS } from "@/lib/stages";

// 3-1 로그인 (관리자 페이지). 목 로그인. 권한 레벨별로 보는 범위가 달라짐을 데모.
export default function AdminLoginPage() {
  const router = useRouter();
  const { users, login, orgName } = useStore();
  const admins = users.filter((u) => u.adminLevel);

  const doLogin = (id: string) => {
    login(id, "member");
    router.replace("/admin");
  };

  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <Card className="w-full max-w-md" pad={false}>
        <div className="flex flex-col items-center border-b border-line p-6 text-center">
          <Logo size={64} />
          <p className="text-mist mt-4 text-sm font-medium">ADP 관리자 페이지</p>
          <h1 className="font-display mt-1 text-2xl font-bold">로그인</h1>
          <p className="mt-1 text-sm text-mist">
            권한 레벨에 따라 보는 범위가 달라집니다
          </p>
        </div>
        <div className="flex flex-col gap-2 p-6">
          {admins.map((u) => (
            <button
              key={u.id}
              onClick={() => doLogin(u.id)}
              className="flex items-center justify-between rounded-card border border-line bg-white px-4 py-3 text-left hover:border-royal"
            >
              <span>
                <span className="font-medium">{u.name}</span>
                <span className="ml-2 text-xs text-mist">
                  {orgName(u.churchId)}
                </span>
              </span>
              <span className="rounded-full bg-royal-soft px-2.5 py-1 text-xs font-medium text-royal">
                {ORG_LEVEL_LABELS[u.adminLevel!]}
              </span>
            </button>
          ))}
          <p className="mt-2 text-xs text-mist">
            권한 없는 회원은 접근이 차단됩니다.
          </p>
        </div>
      </Card>
    </div>
  );
}
