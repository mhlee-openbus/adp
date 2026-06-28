# ADP 프로토타입

제칠일안식일예수재림교회 교인 교육 플랫폼 **ADP** 프로토타입. 화면 흐름과 정보 구조 검증용이며, 무거운 로직(1:1 화상 실제 연결·영상 추적·미션 자동배정)은 목/레이아웃으로 대체한다.

- 단일 출처: `ADP_프로토타입_명세.md` (화면·흐름·규칙), `ADP_빌드명세_ClaudeCode.md` (스택·데이터·로직)
- **클라이언트 전용** — 백엔드/DB/실제 인증 없음. 모든 데이터는 목 + `localStorage`(새로고침 유지). 런처의 "데이터 초기화"로 시드 복원.

## 스택

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · React Context 단일 스토어(외부 상태 라이브러리 없음) · 폰트: Noto Serif KR + Pretendard.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
npm run lint
```

## 구조

```
app/
  page.tsx            # 런처(데모 진입) · /preview 전 화면 인덱스
  adp/                # ① ADP 앱 (모바일) — 교인 학습 + 목회자 현황
  guide/              # ② 바이블가이드 앱 (모바일) — 전도/관심자 관리
  admin/              # ③ 관리자 페이지 (PC) — 운영/제작/권한
lib/
  types.ts stages.ts seed.ts store.tsx   # 데이터 모델 · 단계 상수 · 시드 · 스토어
components/ui/         # 디자인 시스템 (StagePath 시그니처 포함)
components/layout/     # 모바일 디바이스 프레임
```

세 면은 단일 코드베이스에서 각자 독립 네비게이션을 가지며 디자인 시스템과 목 스토어를 공유한다. 모바일 두 면은 데스크톱에서 중앙 ~420px 디바이스 프레임 + 하단 탭, 실제 모바일에선 풀폭. 관리자 면만 좌측 사이드바 + 넓은 PC 레이아웃.

## 목 로그인 (비밀번호 없음)

| 면 | 계정 | 비고 |
|---|---|---|
| ADP · 교인 | 김믿음(1.영혼구원 2/4) · 이소망 · 박사랑 | 진도/단계 다름 |
| ADP · 목회자·관리자 | 정한길 목사 | 우리교회 현황 |
| 바이블가이드 | 정성도(중앙·담당 2명) · 김서부(서부) | |
| 관리자 | 정한길(교회) · 이합회(합회) · 한연합(연합회) | 권한 레벨별 범위 차이 |

## 배포 (Vercel)

추가 설정 불필요. GitHub에 푸시 후 Vercel에서 Import 하면 `next build`로 자동 빌드된다(환경변수 없음, 클라이언트 전용 + localStorage).
