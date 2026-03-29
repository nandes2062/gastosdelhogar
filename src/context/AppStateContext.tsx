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
  MonthParticipant,
  MonthRecord,
  MonthRecordPatch,
  Person,
  PersonId,
  PersonMonthPayment,
  ServiceDef,
} from "@/lib/types";
import { loadState, saveState } from "@/lib/storage";
import { addMonths, currentMonthKey } from "@/lib/format";
import {
  defaultPersonPayment,
  getMonthRecord,
  peopleToParticipants,
} from "@/lib/billing";

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
  setMonthParticipants: (
    monthKey: MonthKey,
    participants: MonthParticipant[],
  ) => void;
  addPerson: (p: Omit<Person, "id">) => void;
  updatePerson: (id: PersonId, p: Omit<Person, "id">) => void;
  deletePerson: (id: PersonId) => void;
  setActiveServiceIds: (monthKey: MonthKey, serviceIds: string[]) => void;
  saveServices: (services: ServiceDef[]) => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<AppState>(() => ({
    services: [],
    people: [],
    months: {},
  }));
  const [selectedMonthKey, setSelectedMonthKey] = useState<MonthKey>(() =>
    currentMonthKey(),
  );

  useEffect(() => {
    let mounted = true;
    loadState().then((s) => {
      if (!mounted) return;
      setState(s);
      setReady(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void saveState(state);
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

        // Si el mes no existe aún (no tiene participants todavía),
        // inicializamos su snapshot a partir de la lista global actual.
        const baseParticipants =
          prevRec.participants !== undefined
            ? prevRec.participants
            : peopleToParticipants(prev.people);

        const merged: MonthRecord = {
          totals: { ...prevRec.totals, ...(patch.totals ?? {}) } as Record<string, number | null>,
          receiptDataUrls: {
            ...prevRec.receiptDataUrls,
            ...(patch.receiptDataUrls ?? {}),
          } as Record<string, string[]>,
          payments:
            patch.payments !== undefined
              ? ({ ...prevRec.payments, ...patch.payments } as Record<PersonId, PersonMonthPayment>)
              : ({ ...prevRec.payments } as Record<PersonId, PersonMonthPayment>),
          // Usa el patch si existe, sino conserva o crea el snapshot.
          participants:
            patch.participants !== undefined
              ? patch.participants
              : baseParticipants,
          activeServiceIds:
            patch.activeServiceIds !== undefined
              ? patch.activeServiceIds
              : prevRec.activeServiceIds,
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
        const nextPay = { ...cur, ...patch } as PersonMonthPayment;
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

  /**
   * Reemplaza directamente la lista de participantes de un mes concreto.
   * Al llamar esto, el mes queda fijo con ese snapshot.
   */
  const setMonthParticipants = useCallback(
    (monthKey: MonthKey, participants: MonthParticipant[]) => {
      setState((prev) => {
        const prevRec = getMonthRecord(prev, monthKey);
        return {
          ...prev,
          months: {
            ...prev.months,
            [monthKey]: {
              ...prevRec,
              participants,
            },
          },
        };
      });
    },
    [],
  );

  const setActiveServiceIds = useCallback(
    (monthKey: MonthKey, serviceIds: string[]) => {
      setState((prev) => {
        const prevRec = getMonthRecord(prev, monthKey);
        return {
          ...prev,
          months: {
            ...prev.months,
            [monthKey]: {
              ...prevRec,
              activeServiceIds: serviceIds,
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
    // Solo actualiza la lista global; los meses históricos mantienen
    // su snapshot propio y no se ven afectados.
    setState((prev) => ({
      ...prev,
      people: prev.people.map((x) => (x.id === id ? { ...p, id } : x)),
    }));
  }, []);

  const deletePerson = useCallback((id: PersonId) => {
    // Solo elimina de la lista global; los meses históricos mantienen
    // su snapshot propio y no se ven afectados.
    setState((prev) => ({
      ...prev,
      people: prev.people.filter((x) => x.id !== id),
    }));
  }, []);

  const saveServices = useCallback((services: ServiceDef[]) => {
    setState((prev) => ({
      ...prev,
      services,
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
      setMonthParticipants,
      addPerson,
      updatePerson,
      deletePerson,
      setActiveServiceIds,
      saveServices,
    }),
    [
      ready,
      state,
      selectedMonthKey,
      goPrevMonth,
      goNextMonth,
      upsertMonth,
      setPayment,
      setMonthParticipants,
      addPerson,
      updatePerson,
      deletePerson,
      setActiveServiceIds,
      saveServices,
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
