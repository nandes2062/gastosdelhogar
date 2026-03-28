"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AppState,
  MonthKey,
  MonthRecord,
  MonthRecordPatch,
  Person,
  PersonId,
  PersonMonthPayment,
} from "@/lib/types";
import { loadState, saveState } from "@/lib/storage";
import { addMonths, currentMonthKey } from "@/lib/format";
import { defaultPersonPayment, getMonthRecord } from "@/lib/billing";

type AppStateContextValue = {
  ready: boolean;
  state: AppState;
  selectedMonthKey: MonthKey;
  setSelectedMonthKey: (k: MonthKey) => void;
  goPrevMonth: () => void;
  goNextMonth: () => void;
  upsertMonth: (monthKey: MonthKey, patch: MonthRecordPatch) => void;
  setPayment: (
    monthKey: MonthKey,
    personId: PersonId,
    patch: Partial<PersonMonthPayment>,
  ) => void;
  addPerson: (p: Omit<Person, "id">) => void;
  updatePerson: (id: PersonId, p: Omit<Person, "id">) => void;
  deletePerson: (id: PersonId) => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

function stripPersonFromMonths(
  months: AppState["months"],
  personId: PersonId,
): AppState["months"] {
  const next: AppState["months"] = {};
  for (const [k, rec] of Object.entries(months)) {
    const payments = { ...rec.payments };
    delete payments[personId];
    next[k] = { ...rec, payments };
  }
  return next;
}

export function AppStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<AppState>(() => ({
    people: [],
    months: {},
  }));
  const [selectedMonthKey, setSelectedMonthKey] = useState<MonthKey>(() =>
    currentMonthKey(),
  );

  useEffect(() => {
    const s = loadState();
    // Hidratación desde localStorage solo en cliente (evita mismatch SSR).
    queueMicrotask(() => {
      setState(s);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveState(state);
  }, [state, ready]);

  const goPrevMonth = useCallback(() => {
    setSelectedMonthKey((k) => addMonths(k, -1));
  }, []);

  const goNextMonth = useCallback(() => {
    setSelectedMonthKey((k) => addMonths(k, 1));
  }, []);

  const upsertMonth = useCallback(
    (monthKey: MonthKey, patch: MonthRecordPatch) => {
      setState((prev) => {
        const prevRec = getMonthRecord(prev, monthKey);
        const merged: MonthRecord = {
          totals: { ...prevRec.totals, ...(patch.totals ?? {}) },
          receiptDataUrls: {
            ...prevRec.receiptDataUrls,
            ...(patch.receiptDataUrls ?? {}),
          },
          payments:
            patch.payments !== undefined
              ? { ...prevRec.payments, ...patch.payments }
              : { ...prevRec.payments },
        };
        return {
          ...prev,
          months: { ...prev.months, [monthKey]: merged },
        };
      });
    },
    [],
  );

  const setPayment = useCallback(
    (
      monthKey: MonthKey,
      personId: PersonId,
      patch: Partial<PersonMonthPayment>,
    ) => {
      setState((prev) => {
        const prevRec = getMonthRecord(prev, monthKey);
        const cur = prevRec.payments[personId] ?? defaultPersonPayment();
        const nextPay = { ...cur, ...patch };
        return {
          ...prev,
          months: {
            ...prev.months,
            [monthKey]: {
              ...prevRec,
              payments: { ...prevRec.payments, [personId]: nextPay },
            },
          },
        };
      });
    },
    [],
  );

  const addPerson = useCallback((p: Omit<Person, "id">) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `p-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      people: [...prev.people, { ...p, id }],
    }));
  }, []);

  const updatePerson = useCallback((id: PersonId, p: Omit<Person, "id">) => {
    setState((prev) => ({
      ...prev,
      people: prev.people.map((x) => (x.id === id ? { ...p, id } : x)),
    }));
  }, []);

  const deletePerson = useCallback((id: PersonId) => {
    setState((prev) => ({
      ...prev,
      people: prev.people.filter((x) => x.id !== id),
      months: stripPersonFromMonths(prev.months, id),
    }));
  }, []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      ready,
      state,
      selectedMonthKey,
      setSelectedMonthKey,
      goPrevMonth,
      goNextMonth,
      upsertMonth,
      setPayment,
      addPerson,
      updatePerson,
      deletePerson,
    }),
    [
      ready,
      state,
      selectedMonthKey,
      goPrevMonth,
      goNextMonth,
      upsertMonth,
      setPayment,
      addPerson,
      updatePerson,
      deletePerson,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return ctx;
}
