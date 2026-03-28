import { initialsFromName } from "@/lib/avatar-initials";

type Props = {
  name: string;
  className?: string;
  variant: "gas" | "water" | "emerald" | "neutral";
};

const ring: Record<Props["variant"], string> = {
  gas: "bg-amber-100 text-amber-900 ring-amber-200",
  water: "bg-blue-100 text-blue-900 ring-blue-200",
  emerald: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  neutral: "bg-slate-200 text-slate-800 ring-slate-300",
};

export function Avatar({ name, className = "", variant }: Props) {
  const label = initialsFromName(name);
  return (
    <span
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-inset ${ring[variant]} ${className}`}
      aria-hidden
    >
      {label}
    </span>
  );
}
