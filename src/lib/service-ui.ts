import type { ServiceDefinition } from "./services";

type Theme = ServiceDefinition["theme"];

/** Tarjetas del resumen (inicio) */
export const summaryCardClass: Record<
  Theme,
  { wrap: string; title: string; amount: string; meta: string }
> = {
  amber: {
    wrap: "rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm",
    title: "text-xs font-semibold uppercase tracking-wide text-amber-800",
    amount: "mt-1 text-2xl font-bold text-amber-950",
    meta: "mt-1 text-xs text-amber-900/80",
  },
  blue: {
    wrap: "rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 p-4 shadow-sm",
    title: "text-xs font-semibold uppercase tracking-wide text-blue-800",
    amount: "mt-1 text-2xl font-bold text-blue-950",
    meta: "mt-1 text-xs text-blue-900/80",
  },
};

/** Fila de pago pendiente / pagado (inicio) */
export const paymentChipClass = (
  theme: Theme,
  paid: boolean,
): string => {
  if (theme === "amber") {
    return paid
      ? "bg-amber-100 text-amber-900 ring-amber-200"
      : "bg-amber-50 text-amber-800 ring-amber-200";
  }
  if (theme === "blue") {
    return paid
      ? "bg-blue-100 text-blue-900 ring-blue-200"
      : "bg-blue-50 text-blue-800 ring-blue-200";
  }
  return paid
    ? "bg-emerald-100 text-emerald-900 ring-emerald-200"
    : "bg-emerald-50 text-emerald-800 ring-emerald-200";
};

export const paymentLabelClass = (theme: Theme): string => {
  if (theme === "amber") return "text-amber-800";
  if (theme === "blue") return "text-blue-800";
  return "text-emerald-800";
};

/** Pantalla de un servicio (recibo / división) */
export const billPageTheme: Record<
  Theme,
  {
    pageTitle: string;
    link: string;
    inputRing: string;
    amountCard: string;
    divisionBox: string;
    divisionTitle: string;
    emptyText: string;
    listCard: string;
    amountStrong: string;
    saveBtn: string;
  }
> = {
  amber: {
    pageTitle: "text-lg font-bold text-amber-950",
    link: "text-sm font-medium text-amber-800 underline-offset-2 hover:underline",
    inputRing: "ring-amber-300 focus:ring-2",
    amountCard:
      "rounded-2xl border border-amber-200 bg-white p-4 shadow-sm ring-1 ring-amber-100",
    divisionBox: "rounded-2xl border border-amber-200 bg-amber-50/80 p-4",
    divisionTitle: "text-sm font-semibold text-amber-950",
    emptyText: "mt-2 text-sm text-amber-900",
    listCard:
      "flex items-center justify-between gap-2 rounded-xl bg-white/90 px-3 py-2 shadow-sm ring-1 ring-amber-100",
    amountStrong: "shrink-0 font-semibold text-amber-950",
    saveBtn:
      "w-full rounded-2xl bg-amber-500 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600",
  },
  blue: {
    pageTitle: "text-lg font-bold text-blue-950",
    link: "text-sm font-medium text-blue-800 underline-offset-2 hover:underline",
    inputRing: "ring-blue-300 focus:ring-2",
    amountCard:
      "rounded-2xl border border-blue-200 bg-white p-4 shadow-sm ring-1 ring-blue-100",
    divisionBox: "rounded-2xl border border-blue-200 bg-blue-50/80 p-4",
    divisionTitle: "text-sm font-semibold text-blue-950",
    emptyText: "mt-2 text-sm text-blue-900",
    listCard:
      "flex items-center justify-between gap-2 rounded-xl bg-white/90 px-3 py-2 shadow-sm ring-1 ring-blue-100",
    amountStrong: "shrink-0 font-semibold text-blue-950",
    saveBtn:
      "w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700",
  },
};
