import type {
  AppState,
  MonthKey,
  MonthParticipant,
  MonthRecord,
  Person,
  PersonMonthPayment,
  ServiceDef,
} from "./types";
import { THEMES } from "./services";
import type { ServiceTheme } from "./services";
import { STORAGE_KEY } from "./types";
import { createInitialAppState, SEED_SERVICES } from "./initialData";
import { get, set } from "idb-keyval";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Raw = Record<string, unknown>;

function isRaw(v: unknown): v is Raw {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function isValidTheme(v: unknown): v is ServiceTheme {
  return typeof v === "string" && (THEMES as readonly string[]).includes(v);
}

// ─── Legacy receipt URL helper ────────────────────────────────────────────────

function receiptUrlsFromRaw(raw: Raw, keyArray: string, keyLegacy: string): string[] {
  const arr = raw[keyArray];
  if (Array.isArray(arr)) {
    return arr.filter((x): x is string => typeof x === "string" && x.length > 0);
  }
  const legacy = raw[keyLegacy];
  if (typeof legacy === "string" && legacy.length > 0) return [legacy];
  return [];
}

// ─── Services normalization ───────────────────────────────────────────────────

function normalizeService(raw: unknown): ServiceDef | null {
  if (!isRaw(raw)) return null;
  if (typeof raw.id !== "string" || typeof raw.label !== "string") return null;
  return {
    id:    raw.id,
    label: raw.label,
    emoji: typeof raw.emoji === "string" ? raw.emoji : "🏠",
    theme: isValidTheme(raw.theme) ? raw.theme : "slate",
  };
}

function normalizeServices(raw: unknown): ServiceDef[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeService).filter((s): s is ServiceDef => s !== null);
}

// ─── Payments normalization ───────────────────────────────────────────────────

function normalizePersonPayment(raw: unknown): PersonMonthPayment {
  const out: PersonMonthPayment = {};
  if (!isRaw(raw)) return out;
  // Legacy format
  if ("gasPaid" in raw || "waterPaid" in raw) {
    if (typeof raw.gasPaid  === "boolean") out.gas   = raw.gasPaid;
    if (typeof raw.waterPaid === "boolean") out.water = raw.waterPaid;
    return out;
  }
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "boolean") out[k] = v;
  }
  return out;
}

function normalizePayments(raw: unknown): Record<string, PersonMonthPayment> {
  if (!isRaw(raw)) return {};
  const out: Record<string, PersonMonthPayment> = {};
  for (const [k, v] of Object.entries(raw)) {
    out[k] = normalizePersonPayment(v);
  }
  return out;
}

// ─── Participants normalization ───────────────────────────────────────────────

function normalizeParticipants(raw: unknown): MonthParticipant[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: MonthParticipant[] = [];
  for (const item of raw) {
    if (!isRaw(item)) continue;
    if (typeof item.id !== "string" || typeof item.name !== "string") continue;
    const participatesIn: Record<string, boolean> = {};
    if (isRaw(item.participatesIn)) {
      for (const [k, v] of Object.entries(item.participatesIn)) {
        participatesIn[k] = v === true;
      }
    }
    const percentages: Record<string, number> = {};
    if (isRaw(item.percentages)) {
      for (const [k, v] of Object.entries(item.percentages)) {
        if (typeof v === "number") percentages[k] = v;
      }
    }
    out.push({ id: item.id, name: item.name, participatesIn, percentages });
  }
  return out.length > 0 ? out : undefined;
}

// ─── Month record normalization ───────────────────────────────────────────────

export function normalizeMonthRecord(raw: unknown): MonthRecord {
  const totals:          Record<string, number | null> = {};
  const receiptDataUrls: Record<string, string[]>       = {};

  if (!isRaw(raw)) {
    return {
      totals,
      receiptDataUrls,
      payments: {},
      participants: undefined,
      activeServiceIds: undefined,
    };
  }

  // Current format: raw.totals is an object
  if (isRaw(raw.totals)) {
    for (const [k, v] of Object.entries(raw.totals)) {
      totals[k] = typeof v === "number" ? v : null;
    }
  }
  // Legacy format: gasTotal / waterTotal
  if ("gasTotal" in raw) {
    totals.gas = typeof raw.gasTotal === "number" ? raw.gasTotal : null;
  }
  if ("waterTotal" in raw) {
    totals.water = typeof raw.waterTotal === "number" ? raw.waterTotal : null;
  }

  // Current format: raw.receiptDataUrls
  if (isRaw(raw.receiptDataUrls)) {
    for (const [k, v] of Object.entries(raw.receiptDataUrls)) {
      if (Array.isArray(v)) {
        receiptDataUrls[k] = v.filter((x): x is string => typeof x === "string");
      }
    }
  }
  // Legacy format
  if ("gasReceiptDataUrls" in raw || "gasReceiptDataUrl" in raw) {
    receiptDataUrls.gas = receiptUrlsFromRaw(raw, "gasReceiptDataUrls", "gasReceiptDataUrl");
  }
  if ("waterReceiptDataUrls" in raw || "waterReceiptDataUrl" in raw) {
    receiptDataUrls.water = receiptUrlsFromRaw(raw, "waterReceiptDataUrls", "waterReceiptDataUrl");
  }

  // Active Service IDs
  let activeServiceIds: string[] | undefined = undefined;
  if (Array.isArray(raw.activeServiceIds)) {
    activeServiceIds = raw.activeServiceIds.filter((x): x is string => typeof x === "string");
  }

  // Observations
  const observations: Record<string, string> = {};
  if (isRaw(raw.observations)) {
    for (const [k, v] of Object.entries(raw.observations)) {
      if (typeof v === "string") observations[k] = v;
    }
  }

  return {
    totals,
    receiptDataUrls,
    payments:         normalizePayments(raw.payments),
    participants:     normalizeParticipants(raw.participants),
    activeServiceIds,
    observations,
  };
}

// ─── Person normalization ─────────────────────────────────────────────────────

function normalizePerson(raw: unknown): Person | null {
  if (!isRaw(raw)) return null;
  if (typeof raw.id !== "string" || typeof raw.name !== "string") return null;

  const participatesIn: Record<string, boolean> = {};

  if (isRaw(raw.participatesIn)) {
    for (const [k, v] of Object.entries(raw.participatesIn)) {
      participatesIn[k] = v === true;
    }
  } else {
    // Legacy
    if (raw.participatesInGas   === true) participatesIn.gas   = true;
    if (raw.participatesInWater === true) participatesIn.water = true;
  }

  return { id: raw.id, name: raw.name, participatesIn };
}

// ─── Full app state normalization ─────────────────────────────────────────────

export function normalizeAppState(parsed: unknown): AppState {
  const raw = isRaw(parsed) ? parsed : {};

  // Services — with migration from legacy (no services field)
  let services = normalizeServices(raw.services);
  if (services.length === 0) {
    // Backup viejo: reconstruir servicios base
    services = SEED_SERVICES.map((s) => ({ ...s }));
  }

  // People
  const people: Person[] = Array.isArray(raw.people)
    ? (raw.people.map(normalizePerson).filter(Boolean) as Person[])
    : [];

  // Months
  const months: AppState["months"] = {};
  if (isRaw(raw.months)) {
    for (const [k, v] of Object.entries(raw.months)) {
      months[k as MonthKey] = normalizeMonthRecord(v);
    }
  }

  return { services, people, months };
}

// ─── Load / Save ──────────────────────────────────────────────────────────────

export async function loadState(): Promise<AppState> {
  if (typeof window === "undefined") {
    return createInitialAppState();
  }
  try {
    // 1. Try from IndexedDB
    const idbRaw = await get<string>(STORAGE_KEY);
    if (idbRaw) {
      const parsed = JSON.parse(idbRaw) as unknown;
      if (isRaw(parsed) && parsed.people && parsed.months) {
        return normalizeAppState(parsed);
      }
    }

    // 2. If nothing in IDB or invalid, check localStorage for migration
    const localRaw = window.localStorage.getItem(STORAGE_KEY);
    if (localRaw) {
      const parsed = JSON.parse(localRaw) as unknown;
      if (isRaw(parsed) && parsed.people && parsed.months) {
        const state = normalizeAppState(parsed);
        // Save to IndexedDB (as string to match logic)
        await set(STORAGE_KEY, JSON.stringify(state));
        // Clear old space
        window.localStorage.removeItem(STORAGE_KEY);
        return state;
      }
    }

    // 3. Fallback: initialized empty state
    const initial = createInitialAppState();
    await set(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch (err) {
    console.warn("Storage Error, falling back to initial state", err);
    const initial = createInitialAppState();
    try {
      await set(STORAGE_KEY, JSON.stringify(initial));
    } catch { /* ignore */ }
    return initial;
  }
}

export async function saveState(state: AppState): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await set(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota or private mode */ }
}
