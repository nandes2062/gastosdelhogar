import type { AppState, MonthKey } from "./types";
import { getPayment, getMonthRecord, sharePerPerson } from "./billing";
import { formatMoney, formatMonthLabel } from "./format";
import { SERVICES } from "./services";

/** Emoji asociado a cada servicio; fallback genérico si se agrega uno nuevo. */
const SERVICE_EMOJI: Record<string, string> = {
  gas: "🔥",
  water: "💧",
  luz: "⚡",
};

function svcEmoji(id: string): string {
  return SERVICE_EMOJI[id] ?? "🏠";
}

export function buildShareMessage(state: AppState, monthKey: MonthKey): string {
  const record = getMonthRecord(state, monthKey);
  const monthName = formatMonthLabel(monthKey);

  const lines: string[] = [
    `🏡 *Gastos del Hogar — ${monthName}*`,
    "",
    "📋 *Resumen del mes:*",
  ];

  // Totales por servicio
  const serviceLines: string[] = [];
  for (const svc of SERVICES) {
    const t = record.totals[svc.id];
    if (t != null) {
      serviceLines.push(`${svcEmoji(svc.id)} ${svc.label}: *${formatMoney(t)}*`);
    }
  }
  if (serviceLines.length === 0) {
    lines.push("_(sin montos cargados este mes)_");
  } else {
    lines.push(...serviceLines);
  }
  lines.push("");
  lines.push("👥 *Lo que le toca a cada uno:*");
  lines.push("");

  // Desglose por persona
  for (const person of state.people) {
    const pay = getPayment(record, person.id);
    const parts: string[] = [];
    let personTotal = 0;

    for (const svc of SERVICES) {
      if (!person.participatesIn[svc.id]) continue;
      const total = record.totals[svc.id];
      if (total == null) continue;
      const share = sharePerPerson(state, monthKey, svc.id);
      personTotal += share;
      const status = pay[svc.id] ? "✅ pagado" : "⏳ pendiente";
      parts.push(`   ${svcEmoji(svc.id)} ${svc.label}: *${formatMoney(share)}* — ${status}`);
    }
    if (parts.length === 0) continue;

    lines.push(`*${person.name}*`);
    lines.push(...parts);

    // Solo mostrar total si tiene más de un servicio con monto cargado
    if (parts.length > 1) {
      lines.push(`   💳 *Total: ${formatMoney(personTotal)}*`);
    }

    lines.push("");
  }

  lines.push("📲 Envío QR para realizar el pago 🙌😊");

  return lines.join("\n").trim();
}

export async function shareWhatsAppText(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
  }
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

