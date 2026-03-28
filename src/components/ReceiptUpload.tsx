"use client";

import { useCallback, useId, useState } from "react";
import {
  RECEIPT_MAX_BYTES,
  RECEIPT_MAX_IMAGES,
} from "@/lib/types";

type Props = {
  label: string;
  dataUrls: string[];
  accent: "gas" | "water" | "emerald";
  onChange: (urls: string[]) => void;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      if (typeof res === "string") resolve(res);
      else reject(new Error("Invalid result"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("read error"));
    reader.readAsDataURL(file);
  });
}

export function ReceiptUpload({ label, dataUrls, accent, onChange }: Props) {
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const addFiles = useCallback(
    async (files: FileList | File[] | null) => {
      setError(null);
      if (!files || (Array.isArray(files) && files.length === 0)) return;
      const list = Array.isArray(files) ? files : Array.from(files);
      if (list.length === 0) return;

      const room = RECEIPT_MAX_IMAGES - dataUrls.length;
      if (room <= 0) {
        setError(`Máximo ${RECEIPT_MAX_IMAGES} imágenes por servicio.`);
        return;
      }

      setBusy(true);
      const next = [...dataUrls];
      const issues: string[] = [];
      for (const file of list) {
        if (next.length >= RECEIPT_MAX_IMAGES) {
          issues.push(`Límite de ${RECEIPT_MAX_IMAGES} imágenes.`);
          break;
        }
        if (!file.type.startsWith("image/")) {
          issues.push(`“${file.name}” no es una imagen.`);
          continue;
        }
        if (file.size > RECEIPT_MAX_BYTES) {
          issues.push(
            `“${file.name}” supera ${Math.round(RECEIPT_MAX_BYTES / 1024 / 1024)} MB.`,
          );
          continue;
        }
        try {
          next.push(await readFileAsDataUrl(file));
        } catch {
          issues.push(`No se pudo leer “${file.name}”.`);
        }
      }
      if (next.length > dataUrls.length) onChange(next);
      setError(issues.length > 0 ? issues[issues.length - 1] : null);
      setBusy(false);
    },
    [dataUrls, onChange],
  );

  const removeAt = useCallback(
    (index: number) => {
      onChange(dataUrls.filter((_, i) => i !== index));
      setViewerIndex((v) => {
        if (v === null) return null;
        if (v === index) return null;
        if (v > index) return v - 1;
        return v;
      });
    },
    [dataUrls, onChange],
  );

  const border =
    accent === "gas"
      ? "border-amber-200 bg-amber-50/50"
      : accent === "water"
        ? "border-blue-200 bg-blue-50/50"
        : "border-emerald-200 bg-emerald-50/50";

  const btnPrimary =
    accent === "gas"
      ? "bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
      : accent === "water"
        ? "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50";

  const viewerUrl =
    viewerIndex != null && dataUrls[viewerIndex] ? dataUrls[viewerIndex] : null;
  const hasMany = dataUrls.length > 1;

  return (
    <div className={`rounded-2xl border p-4 ${border}`}>
      <p className="text-sm font-medium text-slate-800">{label}</p>
      <p className="mt-1 text-xs text-slate-500">
        Podés subir varias fotos (factura, comprobante de pago, etc.). Hasta{" "}
        {RECEIPT_MAX_IMAGES} imágenes de ~{Math.round(RECEIPT_MAX_BYTES / 1024 / 1024)}{" "}
        MB c/u. Todo queda solo en este dispositivo.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <label
          htmlFor={inputId}
          className={`inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm ${btnPrimary} ${busy ? "pointer-events-none opacity-60" : ""}`}
        >
          {busy ? "Leyendo…" : "Agregar imágenes"}
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={busy || dataUrls.length >= RECEIPT_MAX_IMAGES}
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {dataUrls.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 shadow-sm"
          >
            Quitar todas
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {dataUrls.length > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {dataUrls.map((url, i) => (
            <li
              key={`${i}-${url.slice(0, 24)}`}
              className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Comprobante ${i + 1}`}
                className="h-32 w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/55 p-1">
                <button
                  type="button"
                  onClick={() => setViewerIndex(i)}
                  className="flex-1 rounded-lg py-1.5 text-xs font-semibold text-white"
                >
                  Ver
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="rounded-lg bg-red-600/90 px-2 text-xs font-semibold text-white"
                  aria-label={`Quitar imagen ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {viewerUrl != null && viewerIndex != null ? (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada del comprobante"
        >
          <div className="relative flex max-h-[90dvh] w-full max-w-lg flex-1 items-center justify-center">
            {hasMany ? (
              <button
                type="button"
                className="absolute left-0 z-10 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm disabled:opacity-30"
                disabled={viewerIndex <= 0}
                onClick={() => setViewerIndex((v) => (v != null && v > 0 ? v - 1 : v))}
                aria-label="Imagen anterior"
              >
                ‹
              </button>
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={viewerUrl}
              alt={`Comprobante ${viewerIndex + 1} de ${dataUrls.length}`}
              className="max-h-full max-w-full rounded-lg object-contain"
            />
            {hasMany ? (
              <button
                type="button"
                className="absolute right-0 z-10 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm disabled:opacity-30"
                disabled={viewerIndex >= dataUrls.length - 1}
                onClick={() =>
                  setViewerIndex((v) =>
                    v != null && v < dataUrls.length - 1 ? v + 1 : v,
                  )
                }
                aria-label="Imagen siguiente"
              >
                ›
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-center text-sm text-white/90">
            {viewerIndex + 1} / {dataUrls.length}
          </p>
          <button
            type="button"
            className="mt-3 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-slate-900"
            onClick={() => setViewerIndex(null)}
          >
            Cerrar
          </button>
        </div>
      ) : null}
    </div>
  );
}
