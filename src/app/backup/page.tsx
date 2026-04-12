"use client";

import { useRef, useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { normalizeAppState } from "@/lib/storage";
import type { AppState } from "@/lib/types";
import { STORAGE_KEY } from "@/lib/types";
import { set } from "idb-keyval";

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────

function deepCloneWithoutImages(state: AppState): AppState {
  const months: AppState["months"] = {};
  for (const [k, rec] of Object.entries(state.months)) {
    const emptyUrls: typeof rec.receiptDataUrls = {} as typeof rec.receiptDataUrls;
    for (const svcId of Object.keys(rec.receiptDataUrls) as (keyof typeof rec.receiptDataUrls)[]) {
      emptyUrls[svcId] = [];
    }
    months[k] = {
      totals: { ...rec.totals },
      payments: JSON.parse(JSON.stringify(rec.payments)) as typeof rec.payments,
      receiptDataUrls: emptyUrls,
      participants: rec.participants ? JSON.parse(JSON.stringify(rec.participants)) : undefined,
      activeServiceIds: rec.activeServiceIds ? [...rec.activeServiceIds] : undefined,
      observations: rec.observations ? { ...rec.observations } : undefined,
    };
  }
  return {
    people: JSON.parse(JSON.stringify(state.people)) as AppState["people"],
    services: JSON.parse(JSON.stringify(state.services)) as AppState["services"],
    months,
  };
}

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function todaySlug(): string {
  return new Date().toISOString().slice(0, 10);
}

function countImages(state: AppState): number {
  let n = 0;
  for (const rec of Object.values(state.months)) {
    for (const urls of Object.values(rec.receiptDataUrls)) {
      n += (urls as string[]).length;
    }
  }
  return n;
}

// ────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────

export default function BackupPage() {
  const { ready, state } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [withImages, setWithImages] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!ready) return <LoadingScreen />;

  const imageCount = countImages(state);

  // ── Export ──────────────────────────────────────
  function handleExport() {
    const data = withImages ? state : deepCloneWithoutImages(state);
    const suffix = withImages ? "_con_imagenes" : "_sin_imagenes";
    downloadJson(data, `gastosdelhogar_backup_${todaySlug()}${suffix}.json`);
  }

  // ── Import ──────────────────────────────────────
  function handleImportClick() {
    setImportError(null);
    setImportSuccess(false);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setBusy(true);
    setImportError(null);
    setImportSuccess(false);

    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);

      if (typeof parsed !== "object" || parsed === null || !("people" in parsed) || !("months" in parsed)) {
        throw new Error("El archivo no tiene el formato esperado.");
      }

      const normalized = normalizeAppState(parsed);
      // Persist directly to IndexedDB; the page will pick it up on next load.
      await set(STORAGE_KEY, JSON.stringify(normalized));
      // Just in case, clean up any old localStorage data to prevent conflicts
      window.localStorage.removeItem(STORAGE_KEY);
      setImportSuccess(true);

      // Wait briefly then reload so the context hydrates with fresh data.
      window.setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setImportError(
        err instanceof SyntaxError
          ? "El archivo no es un JSON válido."
          : err instanceof Error
            ? err.message
            : "Error desconocido al importar.",
      );
    } finally {
      setBusy(false);
    }
  }

  // ── UI ──────────────────────────────────────────
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-lg font-bold text-slate-900">Backup</h1>
        <p className="text-sm text-slate-500">
          Exportá o importá todos tus datos de gastos del hogar.
        </p>
      </header>

      {/* ── Export card ───────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <IconDownload />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900">Exportar respaldo</h2>
            <p className="text-xs text-slate-500">Descarga un archivo JSON con toda la información.</p>
          </div>
        </div>

        {imageCount > 0 && (
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div
              role="checkbox"
              aria-checked={withImages}
              tabIndex={0}
              onClick={() => setWithImages((v) => !v)}
              onKeyDown={(e) => e.key === " " && setWithImages((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${withImages ? "bg-blue-600" : "bg-slate-300"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${withImages ? "translate-x-5" : "translate-x-0.5"}`}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">Incluir imágenes</p>
              <p className="text-xs text-slate-500">
                {imageCount} imagen{imageCount !== 1 ? "es" : ""} adjunta{imageCount !== 1 ? "s" : ""} · el archivo será más grande
              </p>
            </div>
          </label>
        )}

        <button
          type="button"
          onClick={handleExport}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-transform"
        >
          <IconDownload className="h-4 w-4" />
          Exportar{withImages && imageCount > 0 ? " con imágenes" : ""}
        </button>

        <p className="text-center text-xs text-slate-400">
          Solo datos de este dispositivo · quedará guardado en tu carpeta de descargas
        </p>
      </section>

      {/* ── Import card ───────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <IconUpload />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900">Importar respaldo</h2>
            <p className="text-xs text-slate-500">
              Restaura datos desde un archivo JSON exportado previamente.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs text-amber-800 font-medium">
            ⚠️ Atención: importar reemplazará <strong>todos</strong> los datos actuales en este dispositivo.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(e) => void handleFileChange(e)}
        />

        <button
          type="button"
          onClick={handleImportClick}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-100 active:scale-95 transition-transform disabled:opacity-60"
        >
          <IconUpload className="h-4 w-4" />
          {busy ? "Importando…" : "Seleccionar archivo JSON"}
        </button>

        {importError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {importError}
          </p>
        )}
        {importSuccess && (
          <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 font-medium" role="status">
            ✅ Respaldo importado correctamente. Recargando…
          </p>
        )}
      </section>

      {/* ── Info card ─────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-1">
        <p className="text-xs font-semibold text-slate-600">¿Qué incluye el backup?</p>
        <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-500">
          <li>Lista de personas y sus servicios</li>
          <li>Montos de cada servicio por mes</li>
          <li>Registro de pagos por persona</li>
          <li>Comprobantes (imágenes) — opcional al exportar</li>
        </ul>
      </section>
    </div>
  );
}

// ────────────────────────────────────────────────
// Icons
// ────────────────────────────────────────────────

function IconDownload({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUpload({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21V9m0 0l-4 4m4-4l4 4M4 7V5a2 2 0 012-2h12a2 2 0 012 2v2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
