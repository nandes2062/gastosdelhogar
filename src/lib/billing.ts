import type { AppState, MonthKey, MonthParticipant, MonthRecord, Person } from "./types";

// ─── Empty record helpers ────────────────────────────────────────────────────

export function emptyTotals(serviceIds: string[]): Record<string, number | null> {
  const out: Record<string, number | null> = {};
  for (const id of serviceIds) out[id] = null;
  return out;
}

export function emptyReceiptUrls(serviceIds: string[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const id of serviceIds) out[id] = [];
  return out;
}

/**
 * Devuelve un objeto vacío de pagos.
 * Con servicios dinámicos, no pre-populamos todas las keys — un key ausente
 * es equivalente a `false` (no pagado), lo que simplifica el modelo.
 */
export function defaultPersonPayment(): Record<string, boolean> {
  return {};
}

export function emptyMonthRecord(serviceIds: string[]): MonthRecord {
  return {
    totals:          emptyTotals(serviceIds),
    receiptDataUrls: emptyReceiptUrls(serviceIds),
    payments:        {},
    participants:    undefined,
    activeServiceIds: undefined,
    observations:    {},
  };
}

// ─── Month record access ─────────────────────────────────────────────────────

export function getMonthRecord(state: AppState, monthKey: MonthKey): MonthRecord {
  const existing = state.months[monthKey];
  if (existing) return existing;
  const serviceIds = state.services.map((s) => s.id);
  return emptyMonthRecord(serviceIds);
}

/**
 * Retorna los IDs de los servicios activos para el mes dado.
 * Si el mes no tiene `activeServiceIds` explícito, busca el mes más cercano
 * (hacia atrás o adelante) que sí los tenga. Si no hay ninguno, asume todos.
 */
export function getActiveServiceIds(state: AppState, monthKey: MonthKey): string[] {
  const record = state.months[monthKey];
  if (record?.activeServiceIds) return record.activeServiceIds;

  const existingKeys = Object.keys(state.months).filter(k => state.months[k].activeServiceIds);
  if (existingKeys.length === 0) {
    return state.services.map(s => s.id);
  }

  // Encontrar la llave más cercana en el tiempo
  // (Por simplicidad, al ordenar alfabéticamente "YYYY-MM", la distancia funciona)
  let closestKey = existingKeys[0];
  let minDistance = Infinity;

  const targetDate = new Date(`${monthKey}-01T00:00:00`).getTime();

  for (const k of existingKeys) {
    const kDate = new Date(`${k}-01T00:00:00`).getTime();
    const distance = Math.abs(kDate - targetDate);
    if (distance < minDistance) {
      minDistance = distance;
      closestKey = k;
    }
  }

  return state.months[closestKey].activeServiceIds!;
}

// ─── Participants (per-month snapshot) ──────────────────────────────────────

/**
 * Devuelve los participantes del mes.
 * Si el mes tiene su propio snapshot, lo usa; si no, usa state.people (fallback retrocompatible).
 */
export function getMonthParticipants(
  state: AppState,
  monthKey: MonthKey,
): MonthParticipant[] {
  const record = getMonthRecord(state, monthKey);
  if (record.participants !== undefined) {
    return record.participants;
  }
  return state.people.map((p) => ({
    id:             p.id,
    name:           p.name,
    participatesIn: { ...p.participatesIn },
  }));
}

/** Convierte Person[] en MonthParticipant[] para crear un snapshot inicial. */
export function peopleToParticipants(people: Person[]): MonthParticipant[] {
  return people.map((p) => ({
    id:             p.id,
    name:           p.name,
    participatesIn: { ...p.participatesIn },
  }));
}

// ─── Service participants ────────────────────────────────────────────────────

/** Filtra los participantes del mes que tienen activo el servicio dado. */
export function serviceParticipants(
  state: AppState,
  monthKey: MonthKey,
  serviceId: string,
): MonthParticipant[] {
  return getMonthParticipants(state, monthKey).filter(
    (p) => p.participatesIn[serviceId],
  );
}

// ─── Share per person ────────────────────────────────────────────────────────

/**
 * Divide el total entre los participantes y redondea al siguiente
 * múltiplo de Bs. 0,10.  Ej: Bs. 10 / 3 personas → Bs. 3,40.
 */
export function sharePerPerson(
  state: AppState,
  monthKey: MonthKey,
  serviceId: string,
): number {
  const record = getMonthRecord(state, monthKey);
  const n = serviceParticipants(state, monthKey, serviceId).length;
  const total = record.totals[serviceId];
  if (total == null || n === 0) return 0;
  const raw = total / n;
  const rounded = Math.ceil(Math.round(raw * 1000) / 100) / 10;
  return Math.round(rounded * 10) / 10;
}

// ─── Payment helpers ─────────────────────────────────────────────────────────

export function getPayment(
  record: MonthRecord,
  personId: string,
): Record<string, boolean> {
  return record.payments[personId] ?? defaultPersonPayment();
}

// ─── Month status ────────────────────────────────────────────────────────────

/** True si todos los participantes pagaron todos los servicios con recibo. */
export function monthFullyPaid(state: AppState, monthKey: MonthKey): boolean {
  const record = getMonthRecord(state, monthKey);
  const serviceIds = state.services.map((s) => s.id);
  const hasAnyBill = serviceIds.some((id) => {
    const t = record.totals[id];
    return t != null && t > 0;
  });
  if (!hasAnyBill) return false;
  const participants = getMonthParticipants(state, monthKey);
  for (const p of participants) {
    const pay = getPayment(record, p.id);
    for (const serviceId of serviceIds) {
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
  const record = getMonthRecord(state, monthKey);
  const serviceIds = state.services.map((s) => s.id);
  return serviceIds.some((id) => record.totals[id] != null);
}

// ─── Debts ───────────────────────────────────────────────────────────────────

export type PersonDebt = {
  personId: string;
  name: string;
  totalDebt: number;
  months: string[];
};

/**
 * Calcula la deuda total acumulada para todas las personas a lo largo de todos los meses.
 */
export function calculateTotalDebts(state: AppState): PersonDebt[] {
  const personsMap: Record<string, PersonDebt> = {};

  const monthKeys = Object.keys(state.months).sort();

  for (const monthKey of monthKeys) {
    const record = state.months[monthKey];
    const participants = getMonthParticipants(state, monthKey);
    const activeServiceIds = getActiveServiceIds(state, monthKey);

    for (const p of participants) {
      if (!personsMap[p.id]) {
        // Find latest name from state.people if exists, else keep snapshot name
        const latestName = state.people.find(person => person.id === p.id)?.name || p.name;
        personsMap[p.id] = { personId: p.id, name: latestName, totalDebt: 0, months: [] };
      }

      const payments = getPayment(record, p.id);
      let owingInThisMonth = false;
      let monthDebt = 0;

      for (const serviceId of activeServiceIds) {
        const total = record.totals[serviceId];
        if (total && total > 0 && p.participatesIn[serviceId] && !payments[serviceId]) {
          const share = sharePerPerson(state, monthKey, serviceId);
          monthDebt += share;
          owingInThisMonth = true;
        }
      }

      if (owingInThisMonth && monthDebt > 0) {
        personsMap[p.id].totalDebt += monthDebt;
        personsMap[p.id].months.push(monthKey);
      }
    }
  }

  // Filter out those with no debt and round the totals to avoid float precision issues
  return Object.values(personsMap)
    .filter(debt => debt.totalDebt > 0)
    .map(debt => ({
      ...debt,
      totalDebt: Math.round(debt.totalDebt * 10) / 10,
    }))
    .sort((a, b) => b.totalDebt - a.totalDebt);
}
