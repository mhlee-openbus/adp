import Image from "next/image";
import { cn } from "@/lib/cn";

// 재림교회 상징 로고 (성경·불꽃·십자가). public/logo.png.
export function Logo({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo.svg"
      alt="제칠일안식일예수재림교회"
      width={size}
      height={size}
      className={cn("select-none", className)}
    />
  );
}
