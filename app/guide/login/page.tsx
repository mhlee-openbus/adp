"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

// 2-1 로그인 (바이블가이드 앱). 목 로그인.
export default function GuideLoginPage() {
  const router = useRouter();
  const { users, login, guideSeekers, orgName } = useStore();
  const guides = users.filter((u) => u.isBibleGuide);

  const doLogin = (id: string) => {
    login(id, "member");
    router.replace("/guide");
  };

  return (
    <div className="flex min-h-full flex-col px-6 py-10">
      <div className="mb-8 text-center">
        <p className="text-sage text-sm font-medium">전도 도구</p>
        <h1 className="font-display mt-1 text-3xl font-bold">바이블가이드</h1>
        <p className="text-mist mt-1 text-sm">오늘의 미션을 함께 합니다</p>
      </div>

      <p className="mb-3 text-xs text-mist">
        계정을 선택해 로그인하세요 (프로토타입 · 비밀번호 없음).
      </p>
      <div className="flex flex-col gap-2">
        {guides.map((u) => (
          <button
            key={u.id}
            onClick={() => doLogin(u.id)}
            className="flex items-center justify-between rounded-card border border-line bg-white px-4 py-3 text-left hover:border-royal"
          >
            <span>
              <span className="font-medium">{u.name}</span>
              <span className="ml-2 text-xs text-mist">{orgName(u.churchId)}</span>
            </span>
            <span className="nums text-xs text-mist">
              담당 {guideSeekers(u.id).length}명
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
