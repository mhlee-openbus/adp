import { cn } from "@/lib/cn";

// 관리자 PC 표. 숫자 칼럼은 nums(tabular-nums) 클래스 권장.
export function Table({
  columns,
  children,
  className,
}: {
  columns: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-card border border-line bg-white", className)}>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-paper/60">
            {columns.map((c) => (
              <th
                key={c}
                className="px-4 py-3 font-semibold text-mist whitespace-nowrap"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  className,
  children,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-3 align-middle", className)} {...props}>
      {children}
    </td>
  );
}

export function Tr({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("hover:bg-paper/50", className)} {...props} />;
}
