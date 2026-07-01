import Link from "next/link";
import { ResetButton } from "@/components/ResetButton";
import { Logo } from "@/components/ui/Logo";

// 런처(데모 진입): 3개 면으로 가는 인덱스. (목 로그인·모드 전환은 5단계에서 채움)
const surfaces = [
  {
    href: "/adp",
    title: "ADP 앱",
    sub: "모바일 · 보기 중심(학습 + 모니터링)",
    who: "교인 / 목회자·관리자",
  },
  {
    href: "/guide",
    title: "바이블가이드 앱",
    sub: "모바일 · 전도 도구 (ADP와 별개 앱)",
    who: "바이블가이드",
  },
  {
    href: "/admin",
    title: "ADP 관리자 페이지",
    sub: "PC · 운영(제작·등록·권한)",
    who: "관리자",
  },
];

export default function LauncherPage() {
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col justify-center px-6 py-16">
      <Logo size={88} />
      <h1 className="font-display mt-5 text-3xl font-bold">ADP 교육 플랫폼</h1>
      <p className="text-mist mt-2">
        제칠일안식일예수재림교회 교인 교육 플랫폼. 아래에서 들어갈 면을
        고르세요.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {surfaces.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="border-line hover:border-royal block rounded-card border bg-white p-5 transition-colors"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-semibold">{s.title}</span>
              <span className="text-mist text-xs">{s.who}</span>
            </div>
            <p className="text-mist mt-1 text-sm">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
        <Link href="/preview" className="text-sm text-mist hover:text-ink">
          전 화면 미리보기 (/preview)
        </Link>
        <ResetButton />
      </div>
    </main>
  );
}
