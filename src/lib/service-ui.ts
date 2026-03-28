import type { ServiceTheme } from "./services";

type SummaryCard = { wrap: string; title: string; amount: string; meta: string };

const summaryCardTheme: Record<ServiceTheme, SummaryCard> = {
  amber: {
    wrap: "rounded-3xl border border-amber-100 bg-amber-50/50 p-5 shadow-[0_8px_30px_rgb(251,191,36,0.1)]",
    title: "text-[10px] font-bold uppercase tracking-wider text-amber-600",
    amount: "mt-1 text-3xl font-black text-amber-950",
    meta: "mt-1 text-xs font-medium text-amber-700/80",
  },
  blue: {
    wrap: "rounded-3xl border border-blue-100 bg-blue-50/50 p-5 shadow-[0_8px_30px_rgb(59,130,246,0.1)]",
    title: "text-[10px] font-bold uppercase tracking-wider text-blue-600",
    amount: "mt-1 text-3xl font-black text-blue-950",
    meta: "mt-1 text-xs font-medium text-blue-700/80",
  },
  green: {
    wrap: "rounded-3xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-[0_8px_30px_rgb(16,185,129,0.1)]",
    title: "text-[10px] font-bold uppercase tracking-wider text-emerald-600",
    amount: "mt-1 text-3xl font-black text-emerald-950",
    meta: "mt-1 text-xs font-medium text-emerald-700/80",
  },
  purple: {
    wrap: "rounded-3xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-[0_8px_30px_rgb(99,102,241,0.1)]",
    title: "text-[10px] font-bold uppercase tracking-wider text-indigo-600",
    amount: "mt-1 text-3xl font-black text-indigo-950",
    meta: "mt-1 text-xs font-medium text-indigo-700/80",
  },
  rose: {
    wrap: "rounded-3xl border border-rose-100 bg-rose-50/50 p-5 shadow-[0_8px_30px_rgb(244,63,94,0.1)]",
    title: "text-[10px] font-bold uppercase tracking-wider text-rose-600",
    amount: "mt-1 text-3xl font-black text-rose-950",
    meta: "mt-1 text-xs font-medium text-rose-700/80",
  },
  slate: {
    wrap: "rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm",
    title: "text-[10px] font-bold uppercase tracking-wider text-slate-500",
    amount: "mt-1 text-3xl font-black text-slate-950",
    meta: "mt-1 text-xs font-medium text-slate-600",
  },
};

export function getSummaryCardClass(theme: ServiceTheme): SummaryCard {
  return summaryCardTheme[theme] ?? summaryCardTheme.slate;
}

// ─── Payment chip / label ────────────────────────────────────────────────────

const chipPaid: Record<ServiceTheme, string> = {
  amber:  "bg-amber-400 text-white ring-amber-500",
  blue:   "bg-blue-600 text-white ring-blue-700",
  green:  "bg-emerald-500 text-white ring-emerald-600",
  purple: "bg-indigo-600 text-white ring-indigo-700",
  rose:   "bg-rose-500 text-white ring-rose-600",
  slate:  "bg-slate-800 text-white ring-slate-900",
};
const chipUnpaid: Record<ServiceTheme, string> = {
  amber:  "bg-white text-amber-700 ring-amber-200 shadow-sm",
  blue:   "bg-white text-blue-700 ring-blue-200 shadow-sm",
  green:  "bg-white text-emerald-700 ring-emerald-200 shadow-sm",
  purple: "bg-white text-indigo-700 ring-indigo-200 shadow-sm",
  rose:   "bg-white text-rose-700 ring-rose-200 shadow-sm",
  slate:  "bg-white text-slate-600 ring-slate-200 shadow-sm",
};
const labelColor: Record<ServiceTheme, string> = {
  amber:  "text-amber-600 font-bold",
  blue:   "text-blue-600 font-bold",
  green:  "text-emerald-600 font-bold",
  purple: "text-indigo-600 font-bold",
  rose:   "text-rose-600 font-bold",
  slate:  "text-slate-600 font-bold",
};

export function getPaymentChipClass(theme: ServiceTheme, paid: boolean): string {
  const map = paid ? chipPaid : chipUnpaid;
  return map[theme] ?? (paid ? chipPaid.slate : chipUnpaid.slate);
}

export function getPaymentLabelClass(theme: ServiceTheme): string {
  return labelColor[theme] ?? labelColor.slate;
}

// ─── Bill page theme ─────────────────────────────────────────────────────────

type BillPageTheme = {
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
};

const billTheme: Record<ServiceTheme, BillPageTheme> = {
  amber: {
    pageTitle:     "text-2xl font-black text-amber-950 tracking-tight",
    link:          "text-sm font-bold text-amber-600 hover:text-amber-700",
    inputRing:     "ring-amber-400 focus:ring-4 focus:ring-amber-200",
    amountCard:    "rounded-3xl border border-amber-100 bg-white p-6 shadow-xl shadow-amber-900/5",
    divisionBox:   "rounded-3xl bg-amber-50 p-6 border border-amber-100",
    divisionTitle: "text-base font-black text-amber-950",
    emptyText:     "text-sm font-medium text-amber-700/60",
    listCard:      "flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-amber-100",
    amountStrong:  "text-lg font-black text-amber-950",
    saveBtn:       "w-full rounded-2xl bg-amber-400 py-4 text-sm font-black text-white shadow-xl shadow-amber-400/30 hover:bg-amber-500 active:scale-[0.98] transition-all",
  },
  blue: {
    pageTitle:     "text-2xl font-black text-blue-950 tracking-tight",
    link:          "text-sm font-bold text-blue-600 hover:text-blue-700",
    inputRing:     "ring-blue-400 focus:ring-4 focus:ring-blue-200",
    amountCard:    "rounded-3xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-900/5",
    divisionBox:   "rounded-3xl bg-blue-50 p-6 border border-blue-100",
    divisionTitle: "text-base font-black text-blue-950",
    emptyText:     "text-sm font-medium text-blue-700/60",
    listCard:      "flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-blue-100",
    amountStrong:  "text-lg font-black text-blue-950",
    saveBtn:       "w-full rounded-2xl bg-blue-600 py-4 text-sm font-black text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 active:scale-[0.98] transition-all",
  },
  green: {
    pageTitle:     "text-2xl font-black text-emerald-950 tracking-tight",
    link:          "text-sm font-bold text-emerald-600 hover:text-emerald-700",
    inputRing:     "ring-emerald-400 focus:ring-4 focus:ring-emerald-200",
    amountCard:    "rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-900/5",
    divisionBox:   "rounded-3xl bg-emerald-50 p-6 border border-emerald-100",
    divisionTitle: "text-base font-black text-emerald-950",
    emptyText:     "text-sm font-medium text-emerald-700/60",
    listCard:      "flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-emerald-100",
    amountStrong:  "text-lg font-black text-emerald-950",
    saveBtn:       "w-full rounded-2xl bg-emerald-500 py-4 text-sm font-black text-white shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 active:scale-[0.98] transition-all",
  },
  purple: {
    pageTitle:     "text-2xl font-black text-indigo-950 tracking-tight",
    link:          "text-sm font-bold text-indigo-600 hover:text-indigo-700",
    inputRing:     "ring-indigo-400 focus:ring-4 focus:ring-indigo-200",
    amountCard:    "rounded-3xl border border-indigo-100 bg-white p-6 shadow-xl shadow-indigo-900/5",
    divisionBox:   "rounded-3xl bg-indigo-50 p-6 border border-indigo-100",
    divisionTitle: "text-base font-black text-indigo-950",
    emptyText:     "text-sm font-medium text-indigo-700/60",
    listCard:      "flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-indigo-100",
    amountStrong:  "text-lg font-black text-indigo-950",
    saveBtn:       "w-full rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 active:scale-[0.98] transition-all",
  },
  rose: {
    pageTitle:     "text-2xl font-black text-rose-950 tracking-tight",
    link:          "text-sm font-bold text-rose-600 hover:text-rose-700",
    inputRing:     "ring-rose-400 focus:ring-4 focus:ring-rose-200",
    amountCard:    "rounded-3xl border border-rose-100 bg-white p-6 shadow-xl shadow-rose-900/5",
    divisionBox:   "rounded-3xl bg-rose-50 p-6 border border-rose-100",
    divisionTitle: "text-base font-black text-rose-950",
    emptyText:     "text-sm font-medium text-rose-700/60",
    listCard:      "flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-rose-100",
    amountStrong:  "text-lg font-black text-rose-950",
    saveBtn:       "w-full rounded-2xl bg-rose-500 py-4 text-sm font-black text-white shadow-xl shadow-rose-500/30 hover:bg-rose-600 active:scale-[0.98] transition-all",
  },
  slate: {
    pageTitle:     "text-2xl font-black text-slate-900 tracking-tight",
    link:          "text-sm font-bold text-slate-600 hover:text-slate-700",
    inputRing:     "ring-slate-400 focus:ring-4 focus:ring-slate-200",
    amountCard:    "rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5",
    divisionBox:   "rounded-3xl bg-slate-50 p-6 border border-slate-100",
    divisionTitle: "text-base font-black text-slate-900",
    emptyText:     "text-sm font-medium text-slate-500",
    listCard:      "flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100",
    amountStrong:  "text-lg font-black text-slate-900",
    saveBtn:       "w-full rounded-2xl bg-slate-800 py-4 text-sm font-black text-white shadow-xl shadow-slate-800/20 hover:bg-slate-900 active:scale-[0.98] transition-all",
  },
};

export function getBillPageTheme(theme: ServiceTheme): BillPageTheme {
  return billTheme[theme] ?? billTheme.slate;
}

// ─── Theme dot (settings color picker) ──────────────────────────────────────

const themeDotBg: Record<ServiceTheme, string> = {
  amber:  "bg-amber-400",
  blue:   "bg-blue-500",
  green:  "bg-emerald-500",
  purple: "bg-violet-500",
  rose:   "bg-rose-500",
  slate:  "bg-slate-500",
};

export function getThemeDotBg(theme: ServiceTheme): string {
  return themeDotBg[theme] ?? themeDotBg.slate;
}

// ─── History card tone (cycling colors for service rows) ────────────────────

const historyTones = [
  { text: "text-amber-900",   label: "text-amber-700/80"   },
  { text: "text-blue-900",    label: "text-blue-700/80"    },
  { text: "text-emerald-900", label: "text-emerald-700/80" },
  { text: "text-violet-900",  label: "text-violet-700/80"  },
  { text: "text-rose-900",    label: "text-rose-700/80"    },
  { text: "text-slate-700",   label: "text-slate-500"      },
] as const;

export function getHistoryTone(index: number) {
  return historyTones[index % historyTones.length];
}
