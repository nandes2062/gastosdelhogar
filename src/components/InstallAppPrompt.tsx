"use client";

import { useCallback, useEffect, useState } from "react";

const SESSION_HIDE_KEY = "gastosdelhogar:hide-install-prompt";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone ===
      true
  );
}

export function InstallAppPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_HIDE_KEY) === "1") {
        setDismissed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      sessionStorage.setItem(SESSION_HIDE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const runInstall = useCallback(async () => {
    if (!deferred) return;
    setBusy(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      setBusy(false);
      setDeferred(null);
    }
  }, [deferred]);

  if (dismissed || isStandalone()) return null;

  const showIosHint = isIOS() && !deferred;
  const showAndroidHint = isAndroid() && !deferred && !isIOS();

  if (!deferred && !showIosHint && !showAndroidHint) return null;

  return (
    <div className="mb-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 p-3 shadow-sm ring-1 ring-blue-100">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-blue-950">
            Usar como app en el teléfono
          </p>
          {deferred ? (
            <p className="mt-0.5 text-xs text-blue-900/85">
              Te crea un acceso en el inicio. Después, <strong>abrí siempre
              desde ese ícono</strong> (no es una app de Play Store/App Store;
              es la misma página en modo sin barra del navegador).
            </p>
          ) : showIosHint ? (
            <p className="mt-0.5 text-xs text-blue-900/85">
              En iPhone o iPad, agregala a tu inicio desde el menú Compartir del
              navegador.
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-blue-900/85">
              En Chrome u otro navegador compatible, instalala desde el menú del
              navegador cuando aparezca la opción.
            </p>
          )}
          {showIosHint && stepsOpen ? (
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-blue-950">
              <li>
                Tocá el botón <strong>Compartir</strong>{" "}
                <span aria-hidden>(□↑)</span> en Safari o Chrome.
              </li>
              <li>
                Elegí <strong>“Añadir a inicio”</strong> o{" "}
                <strong>“Añadir a la pantalla de inicio”</strong>.
              </li>
              <li>Confirmá y abrila desde el ícono, sin barra del navegador.</li>
            </ol>
          ) : null}
          {showAndroidHint && stepsOpen ? (
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-blue-950">
              <li>
                Abrí el menú del navegador (<strong>⋮</strong> en Chrome).
              </li>
              <li>
                Buscá <strong>“Instalar aplicación”</strong>,{" "}
                <strong>“Añadir a la pantalla de inicio”</strong> o similar.
              </li>
              <li>Confirmá: quedará un ícono como una app.</li>
            </ol>
          ) : null}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-blue-800/70 hover:bg-blue-100/80"
          aria-label="Cerrar aviso de instalación"
        >
          ✕
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {deferred ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void runInstall()}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? "Instalando…" : "Instalar / descargar app"}
          </button>
        ) : showIosHint || showAndroidHint ? (
          <button
            type="button"
            onClick={() => setStepsOpen((v) => !v)}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            {stepsOpen ? "Ocultar pasos" : "Ver cómo instalar"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
