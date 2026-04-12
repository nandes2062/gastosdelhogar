import { initialsFromName } from "@/lib/avatar-initials";

type Props = {
  name: string;
  className?: string;
};

export function Avatar({ name, className = "" }: Props) {
  const label = initialsFromName(name);
  return (
    <span
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-inset bg-indigo-600 text-white ring-indigo-700 ${className}`}
      aria-hidden
    >
      {label}
    </span>
  );
}
