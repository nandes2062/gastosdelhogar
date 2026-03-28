import type { AppState, MonthKey, MonthRecord, Person } from "./types";
import type { ServiceId } from "./services";
import { SERVICE_IDS } from "./services";

export function emptyTotals(): Record<ServiceId, number | null> {
  const out = {} as Record<ServiceId, number | null>;
  for (const id of SERVICE_IDS) out[id] = null;
  return out;
}

export function emptyReceiptUrls(): Record<ServiceId, string[]> {
  const out = {} as Record<ServiceId, string[]>;
  for (const id of SERVICE_IDS) out[id] = [];
  return out;
}

export function defaultPersonPayment(): Record<ServiceId, boolean> {
  const out = {} as Record<ServiceId, boolean>;
  for (const id of SERVICE_IDS) out[id] = false;
  return out;
}

export function emptyMonthRecord(): MonthRecord {
  return {
    totals: emptyTotals(),
    receiptDataUrls: emptyReceiptUrls(),
    payments: {},
  };
}

export function getMonthRecord(
  state: AppState,
  monthKey: MonthKey,
): MonthRecord {
  const existing = state.months[monthKey];
  if (existing) return existing;
  return emptyMonthRecord();
}

export function serviceParticipants(
  people: Person[],
  serviceId: ServiceId,
): Person[] {
  return people.filter((p) => p.participatesIn[serviceId]);
}

/**
 * Divide el total entre los participantes y redondea al siguiente
 * múltiplo de Bs. 0,10 inmediato superior (la parte de centavos
 * siempre termina en 0).  Ej: Bs. 10 / 3 personas → Bs. 3,40.
 */
export function sharePerPerson(
  state: AppState,
  monthKey: MonthKey,
  serviceId: ServiceId,
): number {
  const record = getMonthRecord(state, monthKey);
  const n = serviceParticipants(state.people, serviceId).length;
  const total = record.totals[serviceId];
  if (total == null || n === 0) return 0;
  const raw = total / n;
  // Redondeo al siguiente múltiplo de 0.10, con máximo 2 decimales.
  const rounded = Math.ceil(Math.round(raw * 1000) / 100) / 10;
  return Math.round(rounded * 10) / 10;
}

export function getPayment(
  record: MonthRecord,
  personId: string,
): Record<ServiceId, boolean> {
  return record.payments[personId] ?? defaultPersonPayment();
}

/** True if every participant has paid for each service that has a recibo cargado. */
export function monthFullyPaid(state: AppState, monthKey: MonthKey): boolean {
  const record = getMonthRecord(state, monthKey);
  const hasAnyBill = SERVICE_IDS.some((id) => {
    const t = record.totals[id];
    return t != null && t > 0;
  });
  if (!hasAnyBill) return false;
  for (const p of state.people) {
    const pay = getPayment(record, p.id);
    for (const serviceId of SERVICE_IDS) {
      const total = record.totals[serviceId];
      const hasBill = total != null && total > 0;
      if (p.participatesIn[serviceId] && hasBill && !pay[serviceId]) {
        return false;
      }
    }
  }
  return true;
}

export function monthHasBills(state: AppState, monthKey: MonthKey): boolean {
  const r = getMonthRecord(state, monthKey);
  return SERVICE_IDS.some((id) => r.totals[id] != null);
}
