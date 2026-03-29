import type { ServiceTheme } from "./services";

export type { ServiceTheme };

export type PersonId = string;

export type Person = {
  id: PersonId;
  name: string;
  /** Participación en cada servicio (keyed by service id) */
  participatesIn: Record<string, boolean>;
};

/** YYYY-MM */
export type MonthKey = string;

export type PersonMonthPayment = Record<string, boolean>;

/**
 * Snapshot de una persona tal como participaba en un mes concreto.
 */
export type MonthParticipant = {
  id: PersonId;
  name: string;
  participatesIn: Record<string, boolean>;
  /** Optional custom percentage per service (keyed by service id) */
  percentages?: Record<string, number>;
};

export type MonthRecord = {
  totals: Record<string, number | null>;
  receiptDataUrls: Record<string, string[]>;
  payments: Record<PersonId, PersonMonthPayment>;
  /**
   * Snapshot de los participantes de este mes.
   * Si es undefined (datos viejos), se usa state.people como fallback.
   */
  participants?: MonthParticipant[];
  /**
   * Servicios habilitados expresamente para este mes.
   * Si es undefined, se infiere según la historia o los globales.
   */
  activeServiceIds?: string[];
  /**
   * Observaciones o notas adicionales por servicio (keyed by service id).
   */
  observations?: Record<string, string>;
};

/** Actualización parcial de un mes. */
export type MonthRecordPatch = {
  totals?: Partial<Record<string, number | null>>;
  receiptDataUrls?: Partial<Record<string, string[]>>;
  payments?: Record<PersonId, PersonMonthPayment>;
  participants?: MonthParticipant[];
  activeServiceIds?: string[];
  observations?: Record<string, string>;
};

/** Definición de un servicio guardado en estado (dinámico). */
export type ServiceDef = {
  id: string;
  label: string;
  emoji: string;
  theme: ServiceTheme;
};

export type AppState = {
  services: ServiceDef[];
  people: Person[];
  months: Record<MonthKey, MonthRecord>;
};

export const STORAGE_KEY = "gastosdelhogar:v1";

export const RECEIPT_MAX_BYTES = 1.5 * 1024 * 1024;

/** Límite de adjuntos por servicio para no saturar localStorage. */
export const RECEIPT_MAX_IMAGES = 12;
