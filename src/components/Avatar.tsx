import { initialsFromName } from "@/lib/avatar-initials";

type Props = {
  name: string;
  className?: string;
  variant: "gas" | "water" | "emerald" | "neutral";
};

const ring: Record<Props["variant"], string> = {
  gas: "bg-amber-400 text-white ring-amber-500",
  water: "bg-blue-600 text-white ring-blue-700",
  emerald: "bg-emerald-500 text-white ring-emerald-600",
  neutral: "bg-indigo-600 text-white ring-indigo-700",
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
