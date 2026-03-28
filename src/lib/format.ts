import type { MonthKey } from "./types";

/** Bolívares soberanos: prefijo "Bs." y separadores en español (ej. Bs. 1.234,56). */
const amountFmt = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number): string {
  return `Bs. ${amountFmt.format(amount)}`;
}

export function formatMonthLabel(monthKey: MonthKey): string {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  return new Intl.DateTimeFormat("es", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function currentMonthKey(): MonthKey {
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${mo}`;
}

export function addMonths(monthKey: MonthKey, delta: number): MonthKey {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  const ny = d.getUTCFullYear();
  const nm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${ny}-${nm}`;
}
