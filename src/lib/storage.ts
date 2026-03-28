import type {
  AppState,
  MonthKey,
  MonthRecord,
  Person,
  PersonId,
  PersonMonthPayment,
} from "./types";
import type { ServiceId } from "./services";
import { STORAGE_KEY } from "./types";
import { createInitialAppState } from "./initialData";
import { defaultPersonPayment, emptyReceiptUrls, emptyTotals } from "./billing";
import { SERVICE_IDS } from "./services";

type LegacyMonth = Record<string, unknown>;

function receiptUrlsFromRaw(raw: LegacyMonth, keyArray: string, keyLegacy: string): string[] {
  const arr = raw[keyArray];
  if (Array.isArray(arr)) {
    return arr.filter((x): x is string => typeof x === "string" && x.length > 0);
  }
  const legacy = raw[keyLegacy];
  if (typeof legacy === "string" && legacy.length > 0) return [legacy];
  return [];
}

function isLegacyPaymentObject(o: Record<string, unknown>): boolean {
  return "gasPaid" in o || "waterPaid" in o;
}

function normalizePersonPayment(raw: unknown): PersonMonthPayment {
  const out = defaultPersonPayment();
  if (raw == null || typeof raw !== "object") return out;
  const o = raw as Record<string, unknown>;
  if (isLegacyPaymentObject(o)) {
    if (typeof o.gasPaid === "boolean") out.gas = o.gasPaid;
    if (typeof o.waterPaid === "boolean") out.water = o.waterPaid;
    return out;
  }
  for (const id of SERVICE_IDS) {
    const v = o[id];
    if (typeof v === "boolean") out[id] = v;
  }
  return out;
}

function normalizePayments(raw: unknown): Record<PersonId, PersonMonthPayment> {
  if (raw == null || typeof raw !== "object") return {};
  const out: Record<PersonId, PersonMonthPayment> = {};
  for (const [k, v] of Object.entries(raw)) {
    out[k] = normalizePersonPayment(v);
  }
  return out;
}

function isLegacyMonthShape(raw: LegacyMonth): boolean {
  return "gasTotal" in raw || "waterTotal" in raw;
}

/** Compatible con datos guardados antes del modelo por servicios. */
export function normalizeMonthRecord(raw: LegacyMonth): MonthRecord {
  if (!isLegacyMonthShape(raw) && raw.totals != null && typeof raw.totals === "object") {
    const totals = emptyTotals();
    const rtot = raw.totals as Record<string, unknown>;
    for (const id of SERVICE_IDS) {
      const t = rtot[id];
      totals[id] =
        typeof t === "number" || t === null ? (t as number | null) : null;
    }
    const receiptDataUrls = emptyReceiptUrls();
    const rr = raw.receiptDataUrls;
    if (rr != null && typeof rr === "object") {
      for (const id of SERVICE_IDS) {
        const arr = (rr as Record<string, unknown>)[id];
        if (Array.isArray(arr)) {
          receiptDataUrls[id] = arr.filter(
            (x): x is string => typeof x === "string" && x.length > 0,
          );
        }
      }
    }
    return {
      totals,
      receiptDataUrls,
      payments: normalizePayments(raw.payments),
    };
  }

  const totals = emptyTotals();
  totals.gas =
    typeof raw.gasTotal === "number" || raw.gasTotal === null
      ? (raw.gasTotal as number | null)
      : null;
  totals.water =
    typeof raw.waterTotal === "number" || raw.waterTotal === null
      ? (raw.waterTotal as number | null)
      : null;

  const receiptDataUrls = emptyReceiptUrls();
  receiptDataUrls.gas = receiptUrlsFromRaw(
    raw,
    "gasReceiptDataUrls",
    "gasReceiptDataUrl",
  );
  receiptDataUrls.water = receiptUrlsFromRaw(
    raw,
    "waterReceiptDataUrls",
    "waterReceiptDataUrl",
  );

  return {
    totals,
    receiptDataUrls,
    payments: normalizePayments(raw.payments),
  };
}

function normalizePerson(raw: unknown): Person | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.name !== "string") return null;

  const participatesIn = defaultPersonPayment();
  for (const id of SERVICE_IDS) {
    participatesIn[id] = false;
  }

  if (o.participatesIn != null && typeof o.participatesIn === "object") {
    const pi = o.participatesIn as Record<string, unknown>;
    for (const id of SERVICE_IDS) {
      participatesIn[id] = pi[id] === true;
    }
  } else {
    participatesIn.gas = o.participatesInGas === true;
    participatesIn.water = o.participatesInWater === true;
  }

  return {
    id: o.id,
    name: o.name,
    participatesIn,
  };
}

export function normalizeAppState(parsed: AppState): AppState {
  const months: AppState["months"] = {};
  for (const [k, v] of Object.entries(parsed.months ?? {})) {
    months[k as MonthKey] = normalizeMonthRecord(v as LegacyMonth);
  }
  const peopleRaw = parsed.people;
  const people: Person[] = Array.isArray(peopleRaw)
    ? (peopleRaw.map(normalizePerson).filter(Boolean) as Person[])
    : [];
  return { people, months };
}

export function loadState(): AppState {
  if (typeof window === "undefined") {
    return createInitialAppState();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialAppState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed?.people || !parsed?.months) {
      const initial = createInitialAppState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return normalizeAppState(parsed);
  } catch {
    const initial = createInitialAppState();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch {
      /* ignore */
    }
    return initial;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode */
  }
}
