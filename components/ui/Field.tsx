import { cn } from "@/lib/cn";

const controlBase =
  "w-full rounded-control border border-line bg-white px-3 text-base text-ink placeholder:text-mist/70 focus:border-royal focus:outline-none";

// 라벨 + 입력을 묶는 필드 래퍼
export function Field({
  label,
  required,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-amber"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-mist">{hint}</p>}
      {error && <p className="text-xs text-[#9b3b3b]">{error}</p>}
    </div>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlBase, "h-11", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(controlBase, "py-2 leading-relaxed", className)} {...props} />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlBase, "h-11", className)} {...props} />;
}
