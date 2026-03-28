import type { AppState, MonthKey, MonthRecord, Person } from "./types";
import { defaultPersonPayment, emptyReceiptUrls, emptyTotals } from "./billing";

export const SEED_PERSON_YO = "p-yo";
export const SEED_PERSON_MAMA = "p-mama";
export const SEED_PERSON_HERMANO = "p-hermano";

export const EXAMPLE_MONTH: MonthKey = "2026-02";

const seedPeople: Person[] = [
  {
    id: SEED_PERSON_YO,
    name: "Yo",
    participatesIn: { ...defaultPersonPayment(), gas: true, water: true },
  },
  {
    id: SEED_PERSON_MAMA,
    name: "Mamá",
    participatesIn: { ...defaultPersonPayment(), gas: true, water: true },
  },
  {
    id: SEED_PERSON_HERMANO,
    name: "Hermano",
    participatesIn: { ...defaultPersonPayment(), gas: false, water: true },
  },
];

const exampleMonthRecord: MonthRecord = {
  totals: {
    ...emptyTotals(),
    gas: 14_500,
    water: 18_600,
  },
  receiptDataUrls: emptyReceiptUrls(),
  payments: {
    [SEED_PERSON_YO]: { ...defaultPersonPayment(), gas: true, water: false },
    [SEED_PERSON_MAMA]: { ...defaultPersonPayment(), gas: true, water: true },
    [SEED_PERSON_HERMANO]: {
      ...defaultPersonPayment(),
      gas: false,
      water: false,
    },
  },
};

export function createInitialAppState(): AppState {
  return {
    people: seedPeople.map((p) => ({
      ...p,
      participatesIn: { ...p.participatesIn },
    })),
    months: {
      [EXAMPLE_MONTH]: {
        totals: { ...exampleMonthRecord.totals },
        receiptDataUrls: {
          gas: [...exampleMonthRecord.receiptDataUrls.gas],
          water: [...exampleMonthRecord.receiptDataUrls.water],
        },
        payments: Object.fromEntries(
          Object.entries(exampleMonthRecord.payments).map(([k, v]) => [
            k,
            { ...v },
          ]),
        ),
      },
    },
  };
}

