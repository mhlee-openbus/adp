import type { AppData } from "./types";

// 오늘 날짜(고정) — 미션 "오늘 할 활동" 기준. SSR/CSR 일치를 위해 상수.
export const TODAY = "2026-06-28";

// ===== 목 데이터 (명세 §5) =====
// reset() 가 항상 새 복사본을 얻도록 팩토리로 제공.
export function makeSeed(): AppData {
  return {
    // 5.1 조직 (보기용): 한국연합회 > 동중한합회 > 중앙교회 / 서부교회
    orgs: [
      { id: "union-1", level: "union", name: "한국연합회", parentId: null },
      {
        id: "conf-1",
        level: "conference",
        name: "동중한합회",
        parentId: "union-1",
      },
      {
        id: "church-central",
        level: "church",
        name: "중앙교회",
        parentId: "conf-1",
      },
      {
        id: "church-west",
        level: "church",
        name: "서부교회",
        parentId: "conf-1",
      },
    ],

    users: [
      // 중앙교회
      {
        id: "u-kim",
        name: "김믿음",
        accountType: "member",
        churchId: "church-central",
        adminLevel: null,
        isBibleGuide: false,
      },
      {
        id: "u-lee",
        name: "이소망",
        accountType: "member",
        churchId: "church-central",
        adminLevel: null,
        isBibleGuide: false,
      },
      {
        id: "u-park",
        name: "박사랑",
        accountType: "member",
        churchId: "church-central",
        adminLevel: null,
        isBibleGuide: false,
      },
      {
        id: "u-jung",
        name: "정성도",
        accountType: "member",
        churchId: "church-central",
        adminLevel: null,
        isBibleGuide: true, // 바이블가이드 (담당 관심자 2명)
      },
      {
        id: "u-pastor",
        name: "정한길 목사",
        accountType: "pastor",
        churchId: "church-central",
        adminLevel: "church", // 교회 관리자 + 목회자
        isBibleGuide: false,
      },
      {
        id: "u-confadmin",
        name: "이합회",
        accountType: "member",
        churchId: "church-central",
        adminLevel: "conference", // 합회 관리자(산하 교회들)
        isBibleGuide: false,
      },
      {
        id: "u-unionadmin",
        name: "한연합",
        accountType: "member",
        churchId: "church-central",
        adminLevel: "union", // 연합회 관리자(전체)
        isBibleGuide: false,
      },
      // 서부교회 (권한 범위 데모용)
      {
        id: "u-west-m",
        name: "최서부",
        accountType: "member",
        churchId: "church-west",
        adminLevel: null,
        isBibleGuide: false,
      },
      {
        id: "u-west-g",
        name: "김서부",
        accountType: "member",
        churchId: "church-west",
        adminLevel: null,
        isBibleGuide: true,
      },
    ],

    // 5.2 교인 (중앙교회) + 서부교회 1명
    members: [
      {
        id: "m-kim",
        userId: "u-kim",
        churchId: "church-central",
        eduStage: 1, // 영혼구원
        joinPath: "signup",
        completedLessonIds: ["l1-1", "l1-2"], // 2/4
      },
      {
        id: "m-lee",
        userId: "u-lee",
        churchId: "church-central",
        eduStage: 2, // 정착
        joinPath: "manual",
        completedLessonIds: ["l2-1"], // 1/3
      },
      {
        id: "m-park",
        userId: "u-park",
        churchId: "church-central",
        eduStage: 4, // 지도자양성
        joinPath: "signup",
        completedLessonIds: ["l4-1", "l4-2", "l4-3"], // 3/3 (승급 대기)
      },
      {
        id: "m-west",
        userId: "u-west-m",
        churchId: "church-west",
        eduStage: 1,
        joinPath: "signup",
        completedLessonIds: [],
      },
    ],

    // 5.3 강의 패키지 (중앙교회). 3·5단계는 비워 "준비 중" 노출.
    lessons: [
      // 1.영혼구원 (명세 §5.3 예시 그대로)
      lesson("l1-1", "church-central", 1, 1, "성경은 어떤 책인가", "youtube"),
      lesson("l1-2", "church-central", 1, 2, "하나님은 누구신가", "vimeo"),
      lesson("l1-3", "church-central", 1, 3, "예수님의 생애", "upload"),
      lesson("l1-4", "church-central", 1, 4, "구원의 길", "youtube"),
      // 2.정착
      lesson("l2-1", "church-central", 2, 1, "안식일의 의미", "youtube"),
      lesson("l2-2", "church-central", 2, 2, "십계명 살펴보기", "vimeo"),
      lesson("l2-3", "church-central", 2, 3, "교회 생활 안내", "upload"),
      // 4.지도자양성
      lesson("l4-1", "church-central", 4, 1, "리더의 자세", "youtube"),
      lesson("l4-2", "church-central", 4, 2, "소그룹 인도법", "vimeo"),
      lesson("l4-3", "church-central", 4, 3, "전도 실습 안내", "upload"),
      // 서부교회 1.영혼구원
      lesson("lw-1", "church-west", 1, 1, "성경 개관", "youtube"),
      lesson("lw-2", "church-west", 1, 2, "창조 이야기", "youtube"),
    ],

    // 5.4 관심자 (담당 바이블가이드 매칭 포함)
    seekers: [
      {
        id: "s-choi",
        churchId: "church-central",
        name: "최영희",
        phone: "010-1234-5678",
        relations: ["친구", "동료"],
        anniversaries: [{ type: "생일", date: "1990-05-12" }],
        stage: 1, // 준비
        assignedGuideId: "u-jung", // 정성도
        memo: "교회 행사에 관심을 보임.",
        converted: false,
      },
      {
        id: "s-han",
        churchId: "church-central",
        name: "한기쁨",
        phone: "010-2222-3333",
        relations: ["가족"],
        anniversaries: [{ type: "결혼기념일", date: "2015-09-20" }],
        stage: 3, // 양육
        assignedGuideId: "u-jung",
        memo: "",
        converted: false,
      },
      {
        id: "s-yun",
        churchId: "church-central",
        name: "윤평강",
        phone: undefined,
        relations: ["친구"],
        anniversaries: [],
        stage: 4, // 추수
        assignedGuideId: null, // 미배정
        memo: "",
        converted: false,
      },
      {
        id: "s-kang",
        churchId: "church-west",
        name: "강소망",
        phone: "010-9999-0000",
        relations: ["동료"],
        anniversaries: [],
        stage: 2, // 심기
        assignedGuideId: "u-west-g",
        memo: "",
        converted: false,
      },
    ],

    // 5.4 오늘의 미션 (관심자별 1건). 윤평강은 미배정이라 미션 없음(—).
    missions: [
      {
        id: "ms-choi",
        seekerId: "s-choi",
        date: TODAY,
        text: "안부 문자 보내기",
        done: false,
      },
      {
        id: "ms-han",
        seekerId: "s-han",
        date: TODAY,
        text: "함께 볼 영상 링크 공유",
        done: false,
      },
    ],
  };
}

function lesson(
  id: string,
  churchId: string,
  stage: 1 | 2 | 3 | 4 | 5,
  order: number,
  title: string,
  source: "youtube" | "vimeo" | "upload",
): AppData["lessons"][number] {
  return { id, churchId, stage, order, title, source, url: "#" };
}

// 5.5 바이블가이드(중앙교회): 정성도(u-jung), 담당 관심자 2명 — users 에 반영됨.
