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
      className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-950 shadow-sm"
      role="status"
    >
      <p className="font-semibold text-amber-900">
        Modo navegador (con barra de direcciones)
      </p>
      <p className="mt-1 leading-snug text-amber-900/90">
        Una PWA no es una app de tienda: es la misma web en una ventana sin
        interfaz del navegador cuando la abrís{" "}
        <strong>desde el ícono que agregaste al inicio</strong>, no desde un
        enlace de WhatsApp ni desde una pestaña guardada.
      </p>
      {lan ? (
        <p className="mt-2 leading-snug text-amber-900/90">
          Estás usando <strong>http</strong> en la red local (ej. IP del Wi‑Fi).
          Muchos celulares <strong>no abren modo “app” real</strong> sin{" "}
          <strong>HTTPS</strong>. Para probar instalación completa: publicá la
          app en un host con HTTPS (Vercel, etc.) o usá{" "}
          <strong>localhost</strong> en el mismo equipo.
        </p>
      ) : null}
      <button
        type="button"
        className="mt-2 text-xs font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-950"
        onClick={() => {
          setShow(false);
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            /* ignore */
          }
        }}
      >
        Entendido, ocultar
      </button>
    </div>
  );
}
