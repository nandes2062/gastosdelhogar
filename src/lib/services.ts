/** Temas de color disponibles para un servicio. */
export const THEMES = [
  "amber",
  "blue",
  "green",
  "purple",
  "rose",
  "slate",
] as const;

export type ServiceTheme = (typeof THEMES)[number];

/** Emojis disponibles al crear/editar un servicio. */
export const SERVICE_EMOJIS = [
  "🔥", "💧", "🌐", "💡", "🏠", "📱",
  "🚿", "❄️", "♻️", "🔑", "📺", "🔧",
] as const;
