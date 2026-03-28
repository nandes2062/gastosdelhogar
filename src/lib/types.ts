import type { ServiceId } from "./services";

export type PersonId = string;

export type Person = {
  id: PersonId;
  name: string;
  /** Participación en cada servicio del catálogo */
  participatesIn: Record<ServiceId, boolean>;
};

/** YYYY-MM */
export type MonthKey = string;

export type PersonMonthPayment = Record<ServiceId, boolean>;

export type MonthRecord = {
  totals: Record<ServiceId, number | null>;
  receiptDataUrls: Record<ServiceId, string[]>;
  payments: Record<PersonId, PersonMonthPayment>;
};

/** Actualización parcial de un mes (p. ej. solo un servicio). */
export type MonthRecordPatch = {
  totals?: Partial<Record<ServiceId, number | null>>;
  receiptDataUrls?: Partial<Record<ServiceId, string[]>>;
  payments?: Record<PersonId, PersonMonthPayment>;
};

export type AppState = {
  people: Person[];
  months: Record<MonthKey, MonthRecord>;
};

export const STORAGE_KEY = "gastosdelhogar:v1";

export const RECEIPT_MAX_BYTES = 1.5 * 1024 * 1024;

/** Límite de adjuntos por servicio para no saturar localStorage. */
export const RECEIPT_MAX_IMAGES = 12;
