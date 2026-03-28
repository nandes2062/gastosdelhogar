"use client";

import { formatMonthLabel } from "@/lib/format";
import type { MonthKey } from "@/lib/types";

type Props = {
  monthKey: MonthKey;
  onPrev: () => void;
  onNext: () => void;
};

export function MonthHeader({ monthKey, onPrev, onNext }: Props) {
  const label = formatMonthLabel(monthKey);
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <button
        type="button"
        onClick={onPrev}
        className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 active:bg-slate-50"
        aria-label="Mes anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <p className="flex-1 text-center text-base font-semibold capitalize text-slate-900">
        {label}
      </p>
      <button
        type="button"
        onClick={onNext}
        className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 active:bg-slate-50"
        aria-label="Mes siguiente"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
