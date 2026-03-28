"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAppState } from "@/context/AppStateContext";
import {
  getMonthRecord,
  monthFullyPaid,
  monthHasBills,
} from "@/lib/billing";
import { formatMoney, formatMonthLabel } from "@/lib/format";
import type { MonthKey } from "@/lib/types";
import { SERVICES } from "@/lib/services";

export default function HistoryPage() {
  const router = useRouter();
  const { ready, state, setSelectedMonthKey } = useAppState();
  if (!ready) return <LoadingScreen />;

  const keys = Object.keys(state.months).sort().reverse() as MonthKey[];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-lg font-bold text-slate-900">Historial</h1>
        <p className="text-sm text-slate-500">Meses guardados en este dispositivo</p>
      </header>

      {keys.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
          Todavía no hay meses registrados. Cargá montos desde los servicios del
          mes actual.
        </p>
      ) : (
        <ul className="space-y-3">
          {keys.map((key) => {
            const rec = getMonthRecord(state, key);
            const hasBills = monthHasBills(state, key);
            const complete = monthFullyPaid(state, key);
            return (
              <li key={key}>
                <HistoryCard
                  monthKey={key}
                  totals={rec.totals}
                  hasBills={hasBills}
                  complete={complete}
                  onOpen={() => {
                    setSelectedMonthKey(key);
                    router.push("/");
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/"
        className="block text-center text-sm font-semibold text-blue-700 underline-offset-2 hover:underline"
      >
        Volver al resumen
      </Link>
    </div>
  );
}

function HistoryCard({
  monthKey,
  totals,
  hasBills,
  complete,
  onOpen,
}: {
  monthKey: MonthKey;
  totals: Record<string, number | null>;
  hasBills: boolean;
  complete: boolean;
  onOpen: () => void;
}) {
  const badge = !hasBills
    ? "bg-slate-100 text-slate-700 ring-slate-200"
    : complete
      ? "bg-emerald-100 text-emerald-800 ring-emerald-200"
      : "bg-amber-100 text-amber-900 ring-amber-200";

  const badgeLabel = !hasBills
    ? "Sin cargar"
    : complete
      ? "Completo"
      : "Pendientes";

  const tone = (i: number) => {
    const t = ["text-amber-900", "text-blue-900", "text-emerald-900"] as const;
    const u = ["text-amber-700/80", "text-blue-700/80", "text-emerald-700/80"] as const;
    return { text: t[i % 3], label: u[i % 3] };
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold capitalize text-slate-900">
            {formatMonthLabel(monthKey)}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {SERVICES.map((svc, i) => {
              const c = tone(i);
              const val = totals[svc.id];
              return (
                <span key={svc.id} className={c.text}>
                  <span className={c.label}>{svc.label}:</span>{" "}
                  <strong>{val != null ? formatMoney(val) : "—"}</strong>
                </span>
              );
            })}
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${badge}`}
        >
          {badgeLabel}
        </span>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Ver en resumen
      </button>
    </div>
  );
}
