"use client";

import { useState } from "react";
import Link from "next/link";
import { ReceiptUpload } from "@/components/ReceiptUpload";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Avatar } from "@/components/Avatar";
import { MonthHeader } from "@/components/MonthHeader";
import { useAppState } from "@/context/AppStateContext";
import {
  getMonthParticipants,
  getMonthRecord,
  peopleToParticipants,
  serviceParticipants,
  sharePerPerson,
} from "@/lib/billing";
import { formatMoney } from "@/lib/format";
import { getBillPageTheme } from "@/lib/service-ui";
import type { MonthKey, MonthParticipant } from "@/lib/types";

type Props = { serviceId: string };

export function ServiceBillPage({ serviceId }: Props) {
  const { ready, state, selectedMonthKey, goPrevMonth, goNextMonth } = useAppState();

  const def = state.services.find(s => s.id === serviceId);
  
  // Show loading until ready to prevent crashing before reading state
  if (!ready) return <LoadingScreen />;
  
  if (!def) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <h2 className="text-xl font-bold text-slate-800">Servicio no encontrado</h2>
        <p className="mt-2 text-sm text-slate-500">Este servicio no existe en el catálogo.</p>
        <Link href="/" className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const t = getBillPageTheme(def.theme);

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
  serviceId: string;
}) {
  const { state, upsertMonth, setMonthParticipants } = useAppState();
  const def = state.services.find(s => s.id === serviceId)!;
  const record = getMonthRecord(state, monthKey);
  const participants = serviceParticipants(state, monthKey, serviceId);
  const share = sharePerPerson(state, monthKey, serviceId);
  const total = record.totals[serviceId];
  const t = getBillPageTheme(def.theme);

  const [totalInput, setTotalInput] = useState(() =>
    total != null ? String(total) : "",
  );
  const [receipts, setReceipts] = useState<string[]>(() => [
    ...record.receiptDataUrls[serviceId],
  ]);
  const [savedToast, setSavedToast] = useState(false);
  const [showParticipantEditor, setShowParticipantEditor] = useState(false);

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
          Se divide entre quienes participan en{" "}
          <strong>{def.label}</strong> este mes ({participants.length} persona{participants.length !== 1 ? "s" : ""}).
        </p>
      </div>

      <div className={t.divisionBox}>
        <div className="flex items-center justify-between gap-2">
          <h2 className={t.divisionTitle}>División</h2>
          <button
            type="button"
            onClick={() => setShowParticipantEditor((v) => !v)}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            {showParticipantEditor ? "Cerrar" : "✏️ Editar participantes"}
          </button>
        </div>

        {showParticipantEditor && (
          <ParticipantEditor
            monthKey={monthKey}
            serviceId={serviceId}
            onClose={() => setShowParticipantEditor(false)}
          />
        )}

        {!showParticipantEditor && (
          <>
            {participants.length === 0 ? (
              <p className={t.emptyText}>
                No hay personas en este servicio. Editá los participantes arriba o agregá en{" "}
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
                      <Avatar name={p.name} variant="neutral" />
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
          </>
        )}
      </div>

      <ReceiptUpload
        label={`Comprobantes de ${def.label.toLowerCase()}`}
        dataUrls={receipts}
        accent={def.theme}
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

/**
 * Editor inline para gestionar qué personas participan en el mes actual.
 * Muestra todos los integrantes de state.people y permite activar/desactivar
 * su participación en el servicio para este mes específico.
 */
function ParticipantEditor({
  monthKey,
  serviceId,
  onClose,
}: {
  monthKey: MonthKey;
  serviceId: string;
  onClose: () => void;
}) {
  const { state, setMonthParticipants } = useAppState();

  // Snapshot actual del mes (o generado desde state.people si no existe)
  const currentParticipants = getMonthParticipants(state, monthKey);

  // Construimos el estado editable: todos los de state.people más
  // cualquiera que ya esté en el snapshot del mes (por si fueron eliminados globalmente)
  const allKnownPeople = buildKnownPeopleForEditor(
    state.people.map((p) => ({
      id: p.id,
      name: p.name,
      participatesIn: { ...p.participatesIn },
    })),
    currentParticipants,
  );

  // Estado local de participación en este servicio para este mes
  const [localActive, setLocalActive] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const p of allKnownPeople) {
      // ¿Está en el snapshot del mes con este servicio activo?
      const inSnapshot = currentParticipants.find((cp) => cp.id === p.id);
      map[p.id] = inSnapshot ? (inSnapshot.participatesIn[serviceId] ?? false) : false;
    }
    return map;
  });

  function toggle(id: string) {
    setLocalActive((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function applyChanges() {
    // Reconstruimos el snapshot completo del mes aplicando los cambios de este servicio
    const nextParticipants: MonthParticipant[] = allKnownPeople.map((p) => {
      const inSnapshot = currentParticipants.find((cp) => cp.id === p.id);
      const baseParticipatesIn = inSnapshot
        ? { ...inSnapshot.participatesIn }
        : { ...p.participatesIn };
      // Sobreescribimos solo el servicio que estamos editando
      baseParticipatesIn[serviceId] = localActive[p.id] ?? false;
      return {
        id: p.id,
        name: p.name,
        participatesIn: baseParticipatesIn,
      };
    });
    setMonthParticipants(monthKey, nextParticipants);
    onClose();
  }

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">
        Activá o desactivá quién participa en este servicio <strong>solo para este mes</strong>.
        No afecta otros meses.
      </p>
      <ul className="space-y-2">
        {allKnownPeople.map((p) => (
          <li key={p.id}>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-100">
              <input
                type="checkbox"
                checked={localActive[p.id] ?? false}
                onChange={() => toggle(p.id)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <Avatar name={p.name} variant="neutral" />
              <span className="text-sm font-medium text-slate-800">{p.name}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={applyChanges}
          className="flex-1 rounded-xl bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Aplicar cambios
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

/**
 * Combina state.people y el snapshot actual para tener una lista completa
 * de personas a mostrar en el editor (incluyendo eliminados del global
 * que aún existen en el snapshot histórico).
 */
function buildKnownPeopleForEditor(
  globalPeople: MonthParticipant[],
  snapshotPeople: MonthParticipant[],
): MonthParticipant[] {
  const seen = new Set<string>();
  const result: MonthParticipant[] = [];
  // Primero los globales (los actuales)
  for (const p of globalPeople) {
    seen.add(p.id);
    result.push(p);
  }
  // Luego los del snapshot que ya no existen globalmente (eliminados)
  for (const p of snapshotPeople) {
    if (!seen.has(p.id)) {
      result.push(p);
    }
  }
  return result;
}
