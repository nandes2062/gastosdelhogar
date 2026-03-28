"use client";

import { useState } from "react";
import { MonthHeader } from "@/components/MonthHeader";
import { Avatar } from "@/components/Avatar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAppState } from "@/context/AppStateContext";
import {
  getMonthRecord,
  getPayment,
  serviceParticipants,
  sharePerPerson,
} from "@/lib/billing";
import { formatMoney } from "@/lib/format";
import { buildShareMessage, shareWhatsAppText } from "@/lib/share";
import {
  paymentChipClass,
  paymentLabelClass,
  summaryCardClass,
} from "@/lib/service-ui";
import { SERVICES } from "@/lib/services";

function servicesSubtitle(): string {
  const labels = SERVICES.map((s) => s.label.toLowerCase());
  if (labels.length <= 1) return labels[0] ?? "";
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
  } = useAppState();
  const [sharing, setSharing] = useState(false);

  if (!ready) return <LoadingScreen />;

  const record = getMonthRecord(state, selectedMonthKey);

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
      <header>
        <h1 className="text-lg font-bold text-slate-900">Resumen</h1>
        <p className="text-sm text-slate-500">
          Gastos del hogar · {servicesSubtitle()}
        </p>
      </header>

      <MonthHeader
        monthKey={selectedMonthKey}
        onPrev={goPrevMonth}
        onNext={goNextMonth}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((svc) => {
          const total = record.totals[svc.id];
          const participants = serviceParticipants(state.people, svc.id);
          const each = sharePerPerson(state, selectedMonthKey, svc.id);
          const card = summaryCardClass[svc.theme];
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
        })}
      </div>

      <section className="space-y-3" aria-label="Pagos por persona">
        <h2 className="text-sm font-semibold text-slate-800">Personas</h2>
        <ul className="space-y-3">
          {state.people.map((person) => {
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
                      {SERVICES.map((svc) =>
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
        disabled={sharing}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-60"
      >
        {sharing ? "Abriendo…" : "Compartir desglose (WhatsApp)"}
      </button>
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
  theme: (typeof SERVICES)[number]["theme"];
  amountLabel: string;
  paid: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  const chip = paymentChipClass(theme, paid);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
      <div>
        <span
          className={`text-xs font-semibold ${paymentLabelClass(theme)}`}
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
