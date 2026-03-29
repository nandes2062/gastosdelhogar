"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAppState } from "@/context/AppStateContext";
import {
  getMonthRecord,
  monthFullyPaid,
  monthHasBills,
  calculateTotalDebts,
  PersonDebt,
} from "@/lib/billing";
import { formatMoney, formatMonthLabel } from "@/lib/format";
import type { MonthKey, ServiceDef } from "@/lib/types";
import { getActiveServiceIds } from "@/lib/billing";
import { shareWhatsAppText } from "@/lib/share";

export default function HistoryPage() {
  const router = useRouter();
  const { ready, state, setSelectedMonthKey } = useAppState();
  if (!ready) return <LoadingScreen />;

  const keys = Object.keys(state.months).sort().reverse() as MonthKey[];
  const totalDebts = calculateTotalDebts(state);

  const handleWhatsApp = async (debt: PersonDebt) => {
    const formattedMonths = debt.months.map(m => formatMonthLabel(m)).join(", ");
    const text = `Hola ${debt.name} 👋, te escribo para recordarte que tienes un saldo pendiente de *${formatMoney(debt.totalDebt)}* de las vaquitas mensuales. 🐮\n\nCorresponde a los meses de: ${formattedMonths}.`;
    await shareWhatsAppText(text);
  };

  return (
    <div className="space-y-5 pb-8">
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
                  activeServices={state.services.filter(s => getActiveServiceIds(state, key).includes(s.id))}
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

      {totalDebts.length > 0 && (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-amber-900">Deudas Acumuladas</h2>
          <ul className="space-y-3">
            {totalDebts.map((debt) => (
              <li key={debt.personId} className="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{debt.name}</p>
                  <p className="text-sm text-slate-600">
                    Debe: <strong className="text-amber-700">{formatMoney(debt.totalDebt)}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleWhatsApp(debt)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#20bd5a]"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Avisar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href="/"
        className="block text-center text-sm font-semibold text-blue-700 underline-offset-2 hover:underline !mt-6"
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
  activeServices,
  onOpen,
}: {
  monthKey: MonthKey;
  totals: Record<string, number | null>;
  hasBills: boolean;
  complete: boolean;
  activeServices: ServiceDef[];
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
            {activeServices.length > 0 ? activeServices.map((svc, i) => {
              const c = tone(i);
              const val = totals[svc.id];
              return (
                <span key={svc.id} className={c.text}>
                  <span className={c.label}>{svc.label}:</span>{" "}
                  <strong>{val != null ? formatMoney(val) : "—"}</strong>
                </span>
              );
            }) : (
              <span className="text-slate-500 italic">Sin servicios asignados</span>
            )}
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
