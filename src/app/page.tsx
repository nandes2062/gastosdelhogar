"use client";

import { useState } from "react";
import { MonthHeader } from "@/components/MonthHeader";
import { Avatar } from "@/components/Avatar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAppState } from "@/context/AppStateContext";
import {
  getMonthParticipants,
  getMonthRecord,
  getPayment,
  serviceParticipants,
  sharePerPerson,
  getActiveServiceIds,
} from "@/lib/billing";
import { formatMoney } from "@/lib/format";
import { buildShareMessage, shareWhatsAppText } from "@/lib/share";
import {
  getPaymentChipClass,
  getPaymentLabelClass,
  getSummaryCardClass,
} from "@/lib/service-ui";
import type { ServiceTheme } from "@/lib/services";
import type { ServiceDef } from "@/lib/types";

function servicesSubtitle(activeServices: ServiceDef[]): string {
  const labels = activeServices.map((s) => s.label.toLowerCase());
  if (labels.length === 0) return "Sin servicios";
  if (labels.length === 1) return labels[0] ?? "";
  if (labels.length === 2) return `${labels[0]} y ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} y ${labels[labels.length - 1]}`;
}

export default function HomePage() {
  const {
    ready,
    state,
    selectedMonthKey,
    goPrevMonth,
    goNextMonth,
    setPayment,
    setActiveServiceIds,
  } = useAppState();
  const [sharing, setSharing] = useState(false);
  const [manageServicesOpen, setManageServicesOpen] = useState(false);

  if (!ready) return <LoadingScreen />;

  const record = getMonthRecord(state, selectedMonthKey);
  const activeIds = getActiveServiceIds(state, selectedMonthKey);
  const activeServices = state.services.filter(s => activeIds.includes(s.id));

  // Usamos el snapshot del mes (o fallback a state.people si el mes no tiene snapshot aún)
  const monthParticipants = getMonthParticipants(state, selectedMonthKey);

  async function onShare() {
    setSharing(true);
    try {
      const text = buildShareMessage(state, selectedMonthKey);
      await shareWhatsAppText(text);
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-2">
          Hagamos Vaquita 🐮
        </h1>
        <p className="text-sm font-bold text-brand-blue/80">
          Tu vaquita mensual, sin cuentas, sin internet, y sin enredos.
        </p>
        <p className="text-xs font-medium text-slate-400">
          {activeServices.length} servicios activos este mes
        </p>
      </header>

      <MonthHeader
        monthKey={selectedMonthKey}
        onPrev={goPrevMonth}
        onNext={goNextMonth}
      />

      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-3xl border border-slate-100">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Servicios del mes</h2>
        <button
          onClick={() => setManageServicesOpen(true)}
          className="text-xs font-bold text-brand-blue hover:underline"
        >
          Editar lista
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {activeServices.length === 0 ? (
          <p className="text-sm text-slate-500 italic py-2">No hay servicios habilitados para este mes.</p>
        ) : (
          activeServices.map((svc) => {
          const total = record.totals[svc.id];
          const participants = serviceParticipants(state, selectedMonthKey, svc.id);
          const each = sharePerPerson(state, selectedMonthKey, svc.id);
          const card = getSummaryCardClass(svc.theme);
          return (
            <div key={svc.id} className={card.wrap}>
              <p className={card.title}>{svc.label}</p>
              <p className={card.amount}>
                {total != null ? formatMoney(total) : "—"}
              </p>
              <p className={card.meta}>
                {participants.length > 0 && total != null
                  ? `${formatMoney(each)} c/u (${participants.length} persona${participants.length !== 1 ? "s" : ""})`
                  : participants.length === 0
                    ? `Nadie asignado a ${svc.label.toLowerCase()}`
                    : "Sin monto cargado"}
              </p>
            </div>
          );
        })
        )}
      </div>

      <section className="space-y-4" aria-label="Pagos por persona">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">Integrantes</h2>
        <ul className="space-y-3">
          {monthParticipants.map((person) => {
            const pay = getPayment(record, person.id);
            return (
              <li
                key={person.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={person.name} variant="neutral" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{person.name}</p>
                    <div className="mt-3 space-y-2">
                      {activeServices.map((svc) =>
                        person.participatesIn[svc.id] ? (
                          <PaymentRow
                            key={svc.id}
                            label={svc.label}
                            theme={svc.theme}
                            amountLabel={
                              record.totals[svc.id] != null
                                ? formatMoney(
                                    sharePerPerson(
                                      state,
                                      selectedMonthKey,
                                      svc.id,
                                    ),
                                  )
                                : "Sin recibo"
                            }
                            disabled={record.totals[svc.id] == null}
                            paid={pay[svc.id]}
                            onToggle={() =>
                              setPayment(selectedMonthKey, person.id, {
                                [svc.id]: !pay[svc.id],
                              })
                            }
                          />
                        ) : (
                          <p key={svc.id} className="text-xs text-slate-400">
                            {svc.label}: no aplica
                          </p>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <button
        type="button"
        onClick={() => void onShare()}
        disabled={sharing || activeServices.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-blue py-4 text-sm font-black text-white shadow-xl shadow-brand-blue/30 hover:bg-brand-blue/90 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {sharing ? "Abriendo…" : "Compartir por WhatsApp"}
      </button>

      {manageServicesOpen && (
        <ManageMonthServicesModal
          services={state.services}
          activeIds={activeIds}
          onSave={(newActiveIds) => {
            setActiveServiceIds(selectedMonthKey, newActiveIds);
            setManageServicesOpen(false);
          }}
          onClose={() => setManageServicesOpen(false)}
        />
      )}
    </div>
  );
}

function PaymentRow({
  label,
  theme,
  amountLabel,
  paid,
  disabled,
  onToggle,
}: {
  label: string;
  theme: ServiceTheme;
  amountLabel: string;
  paid: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  const chip = getPaymentChipClass(theme, paid);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
      <div>
        <span
          className={`text-xs font-semibold ${getPaymentLabelClass(theme)}`}
        >
          {label}
        </span>
        <p className="text-sm font-medium text-slate-800">{amountLabel}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${chip} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {paid ? "Pagado" : "Pendiente"}
      </button>
    </div>
  );
}

// ─── Modal para administrar servicios del mes ────────────────────────────────

function ManageMonthServicesModal({
  services,
  activeIds,
  onSave,
  onClose,
}: {
  services: ServiceDef[];
  activeIds: string[];
  onSave: (ids: string[]) => void;
  onClose: () => void;
}) {
  const [localIds, setLocalIds] = useState<Set<string>>(new Set(activeIds));

  function toggle(id: string) {
    const next = new Set(localIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLocalIds(next);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900">Servicios del mes</h2>
        <p className="mt-1 text-sm text-slate-500">
          ¿Cuáles servicios se cobran en este mes?
        </p>

        <div className="mt-5 space-y-3">
          {services.length === 0 && (
            <p className="text-sm text-red-500">No hay servicios en el catálogo global.</p>
          )}
          {services.map(svc => (
            <label key={svc.id} className="flex items-center gap-3">
              <input 
                type="checkbox"
                checked={localIds.has(svc.id)}
                onChange={() => toggle(svc.id)}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-base text-slate-800">{svc.emoji} {svc.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => onSave(Array.from(localIds))}
            className="flex-1 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Guardar
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
