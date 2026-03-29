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
          const hasCustomPcts = participants.some(p => p.percentages?.[svc.id] != null && p.percentages[svc.id] > 0);
          const card = getSummaryCardClass(svc.theme);
          return (
            <div key={svc.id} className={card.wrap}>
              <p className={card.title}>{svc.label}</p>
              <p className={card.amount}>
                {total != null ? formatMoney(total) : "—"}
              </p>
              <p className={card.meta}>
                {participants.length === 0
                   ? `Nadie asignado a ${svc.label.toLowerCase()}`
                   : total == null
                     ? "Sin monto cargado"
                     : hasCustomPcts
                       ? `Montos variables (${participants.length} persona${participants.length !== 1 ? "s" : ""})`
                       : `${formatMoney(sharePerPerson(state, selectedMonthKey, svc.id, participants[0].id))} c/u (${participants.length} persona${participants.length !== 1 ? "s" : ""})`}
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
                                      person.id
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
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-4 text-sm font-black text-white shadow-xl shadow-[#25D366]/30 transition-all hover:bg-[#20bd5a] active:scale-[0.98] disabled:opacity-50"
      >
        {!sharing && (
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        )}
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
