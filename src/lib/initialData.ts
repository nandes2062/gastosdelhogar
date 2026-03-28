import type { AppState, MonthKey, MonthRecord, Person, ServiceDef } from "./types";

export const SEED_SERVICES: ServiceDef[] = [
  { id: "gas",   label: "Gas",  emoji: "🔥", theme: "amber" },
  { id: "water", label: "Agua", emoji: "💧", theme: "blue"  },
];

export const SEED_PERSON_YO      = "p-yo";
export const SEED_PERSON_MAMA    = "p-mama";
export const SEED_PERSON_HERMANO = "p-hermano";

export const EXAMPLE_MONTH: MonthKey = "2026-02";

const seedPeople: Person[] = [
  {
    id: SEED_PERSON_YO,
    name: "Yo",
    participatesIn: { gas: true, water: true },
  },
  {
    id: SEED_PERSON_MAMA,
    name: "Mamá",
    participatesIn: { gas: true, water: true },
  },
  {
    id: SEED_PERSON_HERMANO,
    name: "Hermano",
    participatesIn: { gas: false, water: true },
  },
];

const exampleMonthRecord: MonthRecord = {
  totals:          { gas: 14_500, water: 18_600 },
  receiptDataUrls: { gas: [],     water: [] },
  payments: {
    [SEED_PERSON_YO]:      { gas: true,  water: false },
    [SEED_PERSON_MAMA]:    { gas: true,  water: true  },
    [SEED_PERSON_HERMANO]: { gas: false, water: false },
  },
  participants: seedPeople.map((p) => ({
    id:             p.id,
    name:           p.name,
    participatesIn: { ...p.participatesIn },
  })),
};

export function createInitialAppState(): AppState {
  return {
    services: SEED_SERVICES.map((s) => ({ ...s })),
    people: seedPeople.map((p) => ({
      ...p,
      participatesIn: { ...p.participatesIn },
    })),
    months: {
      [EXAMPLE_MONTH]: {
        totals:          { ...exampleMonthRecord.totals },
        receiptDataUrls: { gas: [], water: [] },
        payments: Object.fromEntries(
          Object.entries(exampleMonthRecord.payments).map(([k, v]) => [k, { ...v }]),
        ),
        participants: exampleMonthRecord.participants?.map((p) => ({
          ...p,
          participatesIn: { ...p.participatesIn },
        })),
      },
    },
  };
}
