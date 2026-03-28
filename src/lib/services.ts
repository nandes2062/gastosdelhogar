/** Catálogo de servicios del hogar. Para agregar uno nuevo: una entrada aquí + página en app/<route>/page.tsx que reutilice ServiceBillPage. */

export const SERVICES = [
  {
    id: "gas",
    label: "Gas",
    route: "/gas",
    navLabel: "Gas",
    theme: "amber",
    avatarVariant: "gas",
    receiptAccent: "gas",
  },
  {
    id: "water",
    label: "Agua",
    route: "/water",
    navLabel: "Agua",
    theme: "blue",
    avatarVariant: "water",
    receiptAccent: "water",
  },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];

export type ServiceDefinition = (typeof SERVICES)[number];

export const SERVICE_IDS = SERVICES.map((s) => s.id) as ServiceId[];

export function getService(id: string): ServiceDefinition | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function assertServiceId(id: string): asserts id is ServiceId {
  if (!SERVICES.some((s) => s.id === id)) {
    throw new Error(`Servicio desconocido: ${id}`);
  }
}
