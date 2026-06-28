# ADP 프로토타입 — 빌드 명세 (Claude Code용)

> 짝 문서: `ADP_프로토타입_명세.md` (화면·흐름·규칙의 단일 출처)
> 이 문서는 그 위에 **무엇으로·어떻게 만들지**를 얹는다. 화면별 내용은 짝 문서를 그대로 따르고, 여기서는 스택·라우트·데이터·로직 구현·디자인 시스템·배포만 정의한다.

---

## 0. 구동 범위 (먼저 못 박을 것)

- **클라이언트 전용. 백엔드/DB 없음.** 모든 데이터는 목(mock) + 브라우저 상태.
- 화면과 화면 간 흐름은 **실제로 동작**한다(로그인 분기, 강의 잠금 해제, 자동 승급, 매칭 변경, 미션 체크 등이 진짜로 상태를 바꾼다).
- 상태는 **localStorage에 저장**해 새로고침해도 유지. "초기화" 액션으로 시드로 되돌린다.
- 인증은 **목 로그인**(비밀번호 검증 없음). 누구로 들어왔는지만 상태에 둔다.
- 배포는 **Vercel** 한 프로젝트.

---

## 1. 기술 스택 & 프로젝트 구조

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS** (디자인 토큰을 Tailwind config + CSS 변수로)
- 상태: **React Context 단일 스토어** + localStorage 영속화 (외부 상태 라이브러리 불필요)
- **단일 코드베이스, 3개 라우트 그룹.** 두 모바일 앱과 PC 관리자는 각자 독립 네비게이션(레이아웃)을 갖지만, 디자인 시스템과 목 스토어는 공유한다. 배포는 한 번.

```
app/
  layout.tsx                # 루트: 폰트, StoreProvider, 전역 스타일
  page.tsx                  # 런처(데모 진입): 3개 면으로 가는 인덱스
  (adp)/                    # ① ADP 앱 — 모바일 프레임 + 하단 탭
    layout.tsx
    login/page.tsx
    page.tsx                # 교인 내 대시보드
    courses/page.tsx        # 강의 목록
    courses/[lessonId]/page.tsx   # 강의 시청
    promoted/page.tsx       # 승급 완료
    church/page.tsx         # 우리교회 현황(목회자/관리자 모드, 보기 전용)
  (guide)/                  # ② 바이블가이드 앱 — 모바일 프레임
    layout.tsx
    login/page.tsx
    page.tsx                # 메인 대시보드(오늘의 미션)
    seekers/page.tsx        # 관심자 목록
    seekers/new/page.tsx    # 관심자 등록
    seekers/[id]/page.tsx   # 관심자 상세
    seekers/[id]/call/page.tsx    # 1:1 화상(레이아웃만)
  (admin)/                  # ③ 관리자 페이지 — PC 사이드바 레이아웃
    layout.tsx
    login/page.tsx
    page.tsx                # 대시보드(통계)
    curation/page.tsx       # 강의 큐레이션 보드
    members/page.tsx        # 교인 관리
    seekers/page.tsx        # 관심자 현황
    guides/page.tsx         # 바이블가이드 관리
    access/page.tsx         # 권한/조직 관리
lib/
  types.ts                  # 데이터 모델
  seed.ts                   # 목 데이터
  store.tsx                 # Context + localStorage + 액션/셀렉터
  stages.ts                 # 두 5단계 상수
components/
  ui/                       # 디자인 시스템 기본 컴포넌트
```

### 라우트 ↔ 화면 매핑 (짝 문서 번호)
| 화면 | 라우트 |
|---|---|
| 1-1 회원가입/로그인 | `/adp/login` |
| 1-2 내 대시보드(교인) | `/adp` |
| 1-3 강의 목록 | `/adp/courses` |
| 1-4 강의 시청 | `/adp/courses/[lessonId]` |
| 1-5 승급 완료 | `/adp/promoted` |
| 1-6 우리교회 현황 | `/adp/church` |
| 2-1 로그인 | `/guide/login` |
| 2-2 메인(오늘의 미션) | `/guide` |
| 2-3 관심자 목록 | `/guide/seekers` |
| 2-4 관심자 등록 | `/guide/seekers/new` |
| 2-5 관심자 상세 | `/guide/seekers/[id]` |
| 2-6 1:1 화상 | `/guide/seekers/[id]/call` |
| 3-1 로그인 | `/admin/login` |
| 3-2 대시보드 | `/admin` |
| 3-3 강의 큐레이션 보드 | `/admin/curation` |
| 3-4 교인 관리 | `/admin/members` |
| 3-5 관심자 현황 | `/admin/seekers` |
| 3-6 바이블가이드 관리 | `/admin/guides` |
| 3-7 권한/조직 관리 | `/admin/access` |

---

## 2. 데이터 모델 (`lib/types.ts`)

```ts
// 조직: 연합회 > 합회 > 교회 (이미 존재 — 보기용)
export type OrgLevel = "union" | "conference" | "church";
export interface Org { id: string; level: OrgLevel; name: string; parentId: string | null; }

// 계정 타입은 둘 뿐. 그 위에 권한/역할이 얹힌다.
export type AccountType = "pastor" | "member";
export interface User {
  id: string;
  name: string;
  accountType: AccountType;
  churchId: string;
  adminLevel: OrgLevel | null;   // 관리자 권한(없으면 null)
  isBibleGuide: boolean;         // 바이블가이드 역할
}

// 교육 단계 1~5 (영혼구원 → 세계선교) / 관심자 단계 1~5 (준비 → 보존)
export type EduStage = 1 | 2 | 3 | 4 | 5;
export type SeekerStage = 1 | 2 | 3 | 4 | 5;

// 교인 = 교육에 등록되어 단계를 가진 사용자
export type JoinPath = "signup" | "manual";
export interface Member {
  id: string;
  userId: string;
  churchId: string;
  eduStage: EduStage;            // 시작 1, 자동/수동으로 변동
  joinPath: JoinPath;
  completedLessonIds: string[];  // 시청 완료한 강의
}

// 강의 패키지 = 교회별. 단계마다 순서 있는 강의 묶음.
export type VideoSource = "youtube" | "vimeo" | "upload";
export interface Lesson {
  id: string;
  churchId: string;
  stage: EduStage;
  order: number;                 // 단계 내 순서(순차 잠금 기준)
  title: string;
  source: VideoSource;
  url: string;
}

// 관심자 = 회원 계정이 아닌 별도 데이터. 데이터의 주인.
export interface Anniversary { type: string; date: string; } // 생일/결혼 등
export interface Seeker {
  id: string;
  churchId: string;
  name: string;                  // 필수
  phone?: string;
  relations: string[];           // 복수 태그: 가족/친구/동료/미분류
  anniversaries: Anniversary[];  // 복수
  stage: SeekerStage;            // 시작 1(준비)
  assignedGuideId: string | null;// 담당 바이블가이드(미배정 가능)
  memo: string;                  // 비공개
  converted: boolean;            // 교인 전환 여부
}

// 미션 = 관심자별 "오늘 할 활동" 1건(프로토타입은 목)
export interface Mission { id: string; seekerId: string; date: string; text: string; done: boolean; }
```

관계 요약: `User`(churchId로 `Org`에 소속) → 일부는 `Member`(교육 단계 보유) / 일부는 `isBibleGuide`. `Lesson`은 churchId+stage로 묶여 패키지를 이룸. `Seeker`는 `assignedGuideId`로 `User`(바이블가이드)와 매칭. `Mission`은 `seekerId`로 `Seeker`에 종속.

---

## 3. 목 스토어 & 상태 (`lib/store.tsx`)

- `StoreProvider`가 `seed.ts`로 초기화한 전체 상태(`orgs, users, members, lessons, seekers, missions`)와 현재 로그인(`currentUserId`, ADP의 `viewMode: "member" | "pastor"`)을 보유.
- 변경 시 localStorage에 직렬화, 마운트 시 복원. `reset()` 제공.
- `<form>` 대신 onClick/onChange 핸들러로 상태 갱신.

핵심 액션/셀렉터(이름은 자유, 동작만 고정):

```ts
// 강의: 순차 잠금
isLessonUnlocked(memberId, lessonId): boolean
// = 같은 단계에서 order가 더 앞선 강의가 전부 completedLessonIds에 있으면 해제

completeLesson(memberId, lessonId): void
// = completedLessonIds에 추가 → 해당 단계 전 강의 완료면 maybePromote()

maybePromote(memberId): void
// = 현재 eduStage의 모든 lesson이 완료면 eduStage++ (최대 5에서 정지) → /adp/promoted 유도

setMemberStage(memberId, stage): void      // 관리자 수동 승급/강등
addMember({ name, churchId, startStage }): void  // 수동 등록, 시작 단계 지정 가능(기본 1)

// 관심자
addSeeker(input): void                     // 등록 시 assignedGuideId = 현재 바이블가이드, stage = 1
setSeekerStage(seekerId, stage): void      // 바이블가이드 수동(양방향)
convertSeeker(seekerId): void              // 교인 전환(프로토타입: 전 단계 가능)
reassignSeeker(seekerId, guideId | null): void  // 관리자 재지정(투웨이). 기록은 유지, 담당자만 교체

// 바이블가이드 역할
setBibleGuide(userId, on): void
// off로 바꾸면 assignedGuideId === userId 인 seeker들을 전부 null(미배정)로

// 미션
toggleMission(missionId): void             // 수동 체크 완료

// 권한 범위
visibleChurchIds(user): string[]
// church → [자기 교회] / conference → 산하 교회들 / union → 전체
seekersInScope(user) / membersInScope(user) // 위 범위로 필터
guideSeekers(guideId)                        // 바이블가이드 본인 담당만
```

**로그인 분기**: 목 로그인 화면에서 사용자(또는 역할)를 고르면 `currentUserId` 설정 후 그 면의 첫 화면으로. ADP는 추가로 교인 모드 / 목회자·관리자 모드 선택 → `viewMode`.

---

## 4. 디자인 시스템 (신규)

브리프: 제칠일안식일예수재림교회의 교육·전도 플랫폼. 톤은 **차분하고 신뢰감 있으며 따뜻한**, 그러나 현대적인 학습 앱. 흔한 SaaS 블루나 화려함은 피한다.

**팔레트** (6색, CSS 변수 `--`)
- `paper` `#F8F6F1` — 배경(따뜻한 종이빛)
- `ink` `#1E2540` — 기본 텍스트 / 딥 브랜드(말씀의 깊이)
- `royal` `#34508C` — 주요 액션/링크
- `amber` `#C68A3E` — **악센트(딱 한 곳에만)**: 현재 단계·진행·승급(빛을 향함)
- `sage` `#4F8A6B` — 완료/긍정
- `line` `#E6E1D6` 보더 · `mist` `#6C7080` 보조 텍스트

**타이포** (역할 분리)
- 디스플레이/화면 제목·큰 숫자: **Noto Serif KR** (절제해서, 경건·말씀의 결) — `next/font/google`
- 본문/UI: **Pretendard** (깔끔한 한글 산세) — CDN 또는 `@fontsource`
- 숫자(관리자 통계·표): Pretendard tabular-nums

타입 스케일(예): 32 / 24 / 20 / 16(본문) / 14 / 12. 본문 16px, 줄간 1.6.

**레이아웃**
- 모바일 두 앱: 데스크톱에서 **중앙 정렬 ~420px '디바이스 프레임'**(실제 모바일에선 풀폭), **하단 탭 네비**. 앱처럼 보이게.
- PC 관리자: **좌측 사이드바 + 콘텐츠** 2단, 넓은 폭, 표 중심.
- 라운드: 카드 12px, 인풋/버튼 8px. 스페이싱 4 기반(4/8/12/16/24/32/48).

**시그니처 요소 — Stage Path.** 두 핵심 체계가 모두 *순서 있는 5단계 여정*이므로(숫자 1~5가 실제 의미를 가짐) 이를 공통 모티프로 쓴다: 5칸 경로 위에서 완료(`sage`)→현재(`amber`)→예정(`line`)이 채워지는 진행 표시. 교인 대시보드, 관심자 상세, 관리자 통계에 일관되게 등장. 악센트(amber)는 여기와 "현재/다음 행동"에만 쓰고 나머지는 조용히 둔다.

**기본 컴포넌트(`components/ui/`)**: `Button`(primary=royal / quiet) · `Card` · `Input`/`Field` · `TagInput`(관계 복수) · `RepeatableField`(기념일 복수) · `StageChip`(단계 칩, 1~5) · `StagePath`(시그니처) · `ProgressBar` · `TabBar`(모바일) · `Sidebar`(PC) · `Table` · `EmptyState` · `Toast`.

**품질 바닥선**: 모바일까지 반응형, 키보드 포커스 가시, `prefers-reduced-motion` 존중. 빈 화면은 분위기가 아니라 **다음 행동 안내**("첫 관심자를 등록하세요" 같은, 짝 문서의 빈 상태 문구 사용).

**카피 규칙**: 사용자 언어로, 동사로 무슨 일이 일어나는지(버튼 "완료" → 토스트 "완료됨"). 시스템 용어 금지. (AI 표현이 생기면 "알고리즘"으로 — 교단 제약.)

---

## 5. 배포 (Vercel)

1. GitHub 저장소에 푸시 → Vercel에서 Import (또는 `vercel` CLI).
2. 빌드: `next build` / 출력: 기본값. 환경변수 불필요(백엔드 없음).
3. 클라이언트 전용 + localStorage라 추가 인프라 없이 그대로 동작.

---

## 6. Claude Code 작업 순서

1. **스캐폴드**: Next.js(App Router·TS·Tailwind) 생성, 폰트(Noto Serif KR·Pretendard) 연결.
2. **디자인 시스템**: 토큰(CSS 변수 + Tailwind config), 전역 스타일, `components/ui` 기본 컴포넌트, 모바일 프레임/사이드바 레이아웃, 시그니처 `StagePath`.
3. **데이터 레이어**: `types.ts` → `stages.ts` → `seed.ts` → `store.tsx`(Context + localStorage + 위 액션/셀렉터).
4. **화면 빌드(면 단위, 짝 문서 5칸대로)**: ① ADP 앱 → ② 바이블가이드 앱 → ③ 관리자 페이지. 각 라우트 그룹은 자기 레이아웃/네비 보유.
5. **목 로그인 + 런처 인덱스(`/`)**: 역할/사용자 선택, ADP 교인·목회자 모드 전환.
6. **로직 연결**: 순차 잠금 → 자동 승급 → 관리자 수동 조정 → 매칭 투웨이/재지정 → 바이블가이드 해제 시 미배정 → 교인 전환 → 미션 체크 → 권한 범위 필터.
7. **마감**: 빈 상태·반응형·포커스·reduced-motion 점검.
8. **배포**: Vercel.

> 빌드 전 점검: 짝 문서(`ADP_프로토타입_명세.md`)를 같이 읽힐 것. 화면 안의 "보이는 것/행동/빈 상태"는 전부 거기서 가져오고, 이 문서는 구조·데이터·로직만 책임진다.
