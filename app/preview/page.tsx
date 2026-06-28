import Link from "next/link";

// /preview — 전 화면 인덱스 (명세 §3.5). 프로토타입 화면 흐름 점검용.
const GROUPS = [
  {
    surface: "① ADP 앱 (모바일)",
    note: "교인 / 목회자·관리자 · 보기 중심",
    screens: [
      { code: "1-1", name: "회원가입 / 로그인", href: "/adp/login" },
      { code: "1-2", name: "내 대시보드 (교인)", href: "/adp" },
      { code: "1-3", name: "강의 목록", href: "/adp/courses" },
      { code: "1-4", name: "강의 시청", href: "/adp/courses/l1-3" },
      { code: "1-5", name: "승급 완료", href: "/adp/promoted" },
      { code: "1-6", name: "우리교회 현황", href: "/adp/church" },
    ],
  },
  {
    surface: "② 바이블가이드 앱 (모바일)",
    note: "전도 도구 · ADP와 별개 앱",
    screens: [
      { code: "2-1", name: "로그인", href: "/guide/login" },
      { code: "2-2", name: "메인 (오늘의 미션)", href: "/guide" },
      { code: "2-3", name: "관심자 목록", href: "/guide/seekers" },
      { code: "2-4", name: "관심자 등록", href: "/guide/seekers/new" },
      { code: "2-5", name: "관심자 상세 (핵심)", href: "/guide/seekers/s-choi" },
      { code: "2-6", name: "1:1 화상", href: "/guide/seekers/s-choi/call" },
    ],
  },
  {
    surface: "③ 관리자 페이지 (PC)",
    note: "운영 · 제작 · 권한",
    screens: [
      { code: "3-1", name: "로그인", href: "/admin/login" },
      { code: "3-2", name: "대시보드 (통계)", href: "/admin" },
      { code: "3-3", name: "강의 큐레이션 보드", href: "/admin/curation" },
      { code: "3-4", name: "교인 관리", href: "/admin/members" },
      { code: "3-5", name: "관심자 현황", href: "/admin/seekers" },
      { code: "3-6", name: "바이블가이드 관리", href: "/admin/guides" },
      { code: "3-7", name: "권한 / 조직 관리", href: "/admin/access" },
    ],
  },
];

export default function PreviewIndexPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-amber text-sm font-medium">프로토타입 · 전 화면 인덱스</p>
      <h1 className="font-display mt-1 text-3xl font-bold">화면 미리보기</h1>
      <p className="text-mist mt-2 text-sm">
        13개 정의 화면(라우트 19개)으로 이동합니다. 관리자 화면은 권한 로그인이
        필요할 수 있습니다.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {GROUPS.map((g) => (
          <section key={g.surface}>
            <div className="mb-3">
              <h2 className="font-display text-xl font-semibold">{g.surface}</h2>
              <p className="text-mist text-sm">{g.note}</p>
            </div>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {g.screens.map((s) => (
                <li key={s.code}>
                  <Link
                    href={s.href}
                    className="flex items-center gap-3 rounded-card border border-line bg-white px-4 py-3 hover:border-royal"
                  >
                    <span className="nums rounded-full bg-paper px-2 py-0.5 text-xs font-semibold text-mist">
                      {s.code}
                    </span>
                    <span className="font-medium">{s.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-10 border-t border-line pt-5">
        <Link href="/" className="text-sm text-mist hover:text-ink">
          ← 런처로
        </Link>
      </div>
    </main>
  );
}
