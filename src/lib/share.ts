import type { AppState, MonthKey } from "./types";
import { getPayment, getMonthRecord, getMonthParticipants, sharePerPerson, getActiveServiceIds } from "./billing";
import { formatMoney, formatMonthLabel } from "./format";

export function buildShareMessage(state: AppState, monthKey: MonthKey): string {
  const record = getMonthRecord(state, monthKey);
  const monthName = formatMonthLabel(monthKey);
  const participants = getMonthParticipants(state, monthKey);

  const activeIds = getActiveServiceIds(state, monthKey);
  const activeServices = state.services.filter(s => activeIds.includes(s.id));

  const lines: string[] = [
    `🐮 *Hagamos Vaquita — ${monthName}* 🏡`,
    "",
    "📋 *Resumen del mes:*",
  ];

  // Totales por servicio
  const serviceLines: string[] = [];
  for (const svc of activeServices) {
    const t = record.totals[svc.id];
    if (t != null) {
      serviceLines.push(`${svc.emoji} ${svc.label}: *${formatMoney(t)}*`);
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
  for (const person of participants) {
    const pay = getPayment(record, person.id);
    const parts: string[] = [];
    let personTotal = 0;

    for (const svc of activeServices) {
      if (!person.participatesIn[svc.id]) continue;
      const total = record.totals[svc.id];
      if (total == null) continue;
      const share = sharePerPerson(state, monthKey, svc.id);
      personTotal += share;
      const status = pay[svc.id] ? "✅ pagado" : "⏳ pendiente";
      parts.push(`   ${svc.emoji} ${svc.label}: *${formatMoney(share)}* — ${status}`);
    }
    
    if (parts.length === 0) continue;

    lines.push(`*${person.name}*`);
    lines.push(...parts);

    if (parts.length > 1) {
      lines.push(`   💳 *Total: ${formatMoney(personTotal)}*`);
    }

    lines.push("");
  }

  lines.push("---");
  lines.push("📲 *Envío QR para realizar el pago.* 🙌😊");

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

