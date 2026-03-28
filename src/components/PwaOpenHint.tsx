"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "gastosdelhogar:dismiss-pwa-open-hint";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone ===
      true
  );
}

/** URL tipo http://192.168… sin HTTPS: el atajo suele seguir siendo el navegador. */
function isInsecureLanOrigin(): boolean {
  if (typeof window === "undefined") return false;
  const { protocol, hostname } = window.location;
  if (protocol !== "http:") return false;
  const loopback =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost");
  if (loopback) return false;
  return true;
}

export function PwaOpenHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (isStandalone()) return;
      try {
        if (sessionStorage.getItem(SESSION_KEY) === "1") return;
      } catch {
        /* ignore */
      }
      setShow(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!show) return null;

  const lan = isInsecureLanOrigin();

  return (
    <div
      className="mb-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-950 shadow-xl shadow-amber-900/5"
      role="status"
    >
      <p className="font-black text-amber-900 flex items-center gap-2">
        Aviso: Modo navegador 🌐
      </p>
      <p className="mt-2 leading-relaxed text-amber-900/90">
        Recordá que esta es una PWA: para la mejor experiencia, <strong>abrila siempre desde el ícono que agregaste a tu inicio</strong>.
      </p>
      {lan ? (
        <p className="mt-2 leading-relaxed text-amber-900/80">
          Nota: El modo "app" real suele requerir <strong>HTTPS</strong>.
        </p>
      ) : null}
      <button
        type="button"
        className="mt-4 text-sm font-black text-amber-600 underline underline-offset-4 hover:text-amber-700"
        onClick={() => {
          setShow(false);
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            /* ignore */
          }
        }}
      >
        Entendido
      </button>
    </div>
  );
}
