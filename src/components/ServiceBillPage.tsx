"use client";

import { useState } from "react";
import Link from "next/link";
import { ReceiptUpload } from "@/components/ReceiptUpload";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Avatar } from "@/components/Avatar";
import { MonthHeader } from "@/components/MonthHeader";
import { useAppState } from "@/context/AppStateContext";
import {
  getMonthRecord,
  serviceParticipants,
  sharePerPerson,
} from "@/lib/billing";
import { formatMoney } from "@/lib/format";
import { billPageTheme } from "@/lib/service-ui";
import type { ServiceId } from "@/lib/services";
import { getService } from "@/lib/services";
import type { MonthKey } from "@/lib/types";

type Props = { serviceId: ServiceId };

export function ServiceBillPage({ serviceId }: Props) {
  const def = getService(serviceId);
  if (!def) throw new Error(`Servicio inválido: ${serviceId}`);

  const { ready, selectedMonthKey, goPrevMonth, goNextMonth } = useAppState();
  const t = billPageTheme[def.theme];

  if (!ready) return <LoadingScreen />;

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h1 className={t.pageTitle}>{def.label}</h1>
          <Link href="/" className={t.link}>
            Ir al resumen
          </Link>
        </div>
        <MonthHeader
          monthKey={selectedMonthKey}
          onPrev={goPrevMonth}
          onNext={goNextMonth}
        />
      </header>

      <ServiceMonthBody
        key={selectedMonthKey}
        monthKey={selectedMonthKey}
        serviceId={serviceId}
      />
    </div>
  );
}

function ServiceMonthBody({
  monthKey,
  serviceId,
}: {
  monthKey: MonthKey;
  serviceId: ServiceId;
}) {
  const def = getService(serviceId)!;
  const { state, upsertMonth } = useAppState();
  const record = getMonthRecord(state, monthKey);
  const participants = serviceParticipants(state.people, serviceId);
  const share = sharePerPerson(state, monthKey, serviceId);
  const total = record.totals[serviceId];
  const t = billPageTheme[def.theme];

  const [totalInput, setTotalInput] = useState(() =>
    total != null ? String(Math.round(total)) : "",
  );
  const [receipts, setReceipts] = useState<string[]>(() => [
    ...record.receiptDataUrls[serviceId],
  ]);
  const [savedToast, setSavedToast] = useState(false);

  function save() {
    const trimmed = totalInput.trim();
    const n = trimmed === "" ? null : Number.parseFloat(trimmed.replace(",", "."));
    const nextTotal =
      n == null || Number.isNaN(n) || n < 0 ? null : Math.round(n * 100) / 100;
    upsertMonth(monthKey, {
      totals: { [serviceId]: nextTotal },
      receiptDataUrls: { [serviceId]: receipts },
    });
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2000);
  }

  return (
    <>
      <div className={t.amountCard}>
        <label className="block text-sm font-medium text-slate-800">
          Monto total del recibo
        </label>
        <input
          inputMode="decimal"
          className={`mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900 outline-none ring-0 ${t.inputRing}`}
          placeholder="Ej: 14500"
          value={totalInput}
          onChange={(e) => setTotalInput(e.target.value)}
        />
        <p className="mt-2 text-xs text-slate-500">
          Se divide entre quienes tengan <strong>{def.label}</strong> activo en
          Personas ({participants.length} ahora).
        </p>
      </div>

      <div className={t.divisionBox}>
        <h2 className={t.divisionTitle}>División</h2>
        {participants.length === 0 ? (
          <p className={t.emptyText}>
            No hay personas en este servicio. Agregá participantes en{" "}
            <Link href="/people" className="font-semibold underline">
              Personas
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {participants.map((p) => (
              <li key={p.id} className={t.listCard}>
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar name={p.name} variant={def.avatarVariant} />
                  <span className="truncate font-medium text-slate-900">
                    {p.name}
                  </span>
                </div>
                <span className={t.amountStrong}>
                  {total != null ? formatMoney(share) : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ReceiptUpload
        label={`Comprobantes de ${def.label.toLowerCase()}`}
        dataUrls={receipts}
        accent={def.receiptAccent}
        onChange={setReceipts}
      />

      <button type="button" onClick={save} className={t.saveBtn}>
        Guardar registro del mes
      </button>

      {savedToast ? (
        <p
          className="text-center text-sm font-medium text-green-700"
          role="status"
        >
          Guardado en este dispositivo
        </p>
      ) : null}
    </>
  );
}
