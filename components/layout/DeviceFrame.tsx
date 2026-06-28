import { TabBar, type TabItem } from "@/components/ui/TabBar";

// 모바일 두 면의 셸:
// - 데스크톱: 중앙 정렬 ~420px '디바이스 프레임' (배경 위에 떠 보이게)
// - 실제 모바일: 풀폭
// 하단 탭 네비 포함. top 으로 상단 바를 끼울 수 있음.
export function DeviceFrame({
  children,
  tabs,
  top,
}: {
  children: React.ReactNode;
  tabs?: TabItem[];
  top?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh justify-center bg-paper md:bg-[#e7e3da] md:py-6">
      <div className="flex min-h-dvh w-full flex-col bg-paper md:min-h-0 md:h-[calc(100dvh-3rem)] md:w-[var(--width-device)] md:overflow-hidden md:rounded-[28px] md:border md:border-line md:shadow-xl">
        {top}
        <main className="flex-1 overflow-y-auto">{children}</main>
        {tabs && <TabBar items={tabs} />}
      </div>
    </div>
  );
}

// 모바일 상단 바 (제목 + 좌/우 슬롯)
export function MobileTopBar({
  title,
  left,
  right,
}: {
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-paper/95 px-4 backdrop-blur">
      <div className="flex w-12 items-center">{left}</div>
      <h1 className="font-display truncate text-base font-semibold">{title}</h1>
      <div className="flex w-12 items-center justify-end">{right}</div>
    </header>
  );
}
