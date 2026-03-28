"use client";

import { useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAppState } from "@/context/AppStateContext";
import { SERVICE_EMOJIS, THEMES, type ServiceTheme } from "@/lib/services";
import type { ServiceDef } from "@/lib/types";
import { getThemeDotBg } from "@/lib/service-ui";

export default function ServicesPage() {
  const { ready, state, saveServices } = useAppState();

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState<string>(SERVICE_EMOJIS[0]);
  const [theme, setTheme] = useState<ServiceTheme>("slate");

  const [editingId, setEditingId] = useState<string | null>(null);

  if (!ready) return <LoadingScreen />;

  function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    
    // Generamos un ID amigable
    const newId = n.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Evitar duplicados
    if (state.services.some(s => s.id === newId)) {
      alert("Ya existe un servicio con ese nombre similar.");
      return;
    }

    const newService: ServiceDef = {
      id: newId,
      label: n,
      emoji,
      theme,
    };

    saveServices([...state.services, newService]);
    setName("");
    setEmoji(SERVICE_EMOJIS[0]);
    setTheme("slate");
  }

  function deleteService(id: string) {
    if (confirm("¿Seguro que deseas eliminar este servicio globalmente? Esto NO borrará los cobros pasados, pero ya no aparecerá para futuros meses.")) {
      saveServices(state.services.filter(s => s.id !== id));
    }
  }

  function updateService(updated: ServiceDef) {
    saveServices(state.services.map(s => s.id === updated.id ? updated : s));
    setEditingId(null);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Catálogo</h1>
        <p className="text-sm font-bold text-brand-blue/80">
          Tus servicios básicos
        </p>
      </header>

      <form
        onSubmit={submitAdd}
        className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40"
      >
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Nombre del Servicio</label>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-900 font-bold outline-none ring-brand-blue/20 focus:ring-4 transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Internet"
          />
        </div>
        
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Icono</label>
          <div className="mt-3 flex flex-wrap gap-2">
            {SERVICE_EMOJIS.map(em => (
              <button
                key={em}
                type="button"
                onClick={() => setEmoji(em)}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition-all ${emoji === em ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 scale-110' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Color</label>
          <div className="mt-3 flex flex-wrap gap-3">
            {THEMES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${getThemeDotBg(t)} ${theme === t ? 'ring-4 ring-brand-blue/30 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                title={t}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          Crear Servicio
        </button>
      </form>

      <ul className="space-y-3">
        {state.services.map((svc) => (
          <li key={svc.id}>
            {editingId === svc.id ? (
              <ServiceEditor
                service={svc}
                onSave={updateService}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-sm ${getThemeDotBg(svc.theme)} text-white`}>
                  {svc.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="truncate text-base font-semibold text-slate-900">{svc.label}</h3>
                  <p className="text-xs text-slate-500">ID interno: {svc.id}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => setEditingId(svc.id)}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteService(svc.id)}
                    className="text-xs font-semibold text-red-700 hover:text-red-800"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {state.services.length === 0 && (
        <p className="text-center text-sm text-slate-500">No hay servicios creados. ¡Empieza creando uno arriba!</p>
      )}
    </div>
  );
}

function ServiceEditor({
  service,
  onSave,
  onCancel
}: {
  service: ServiceDef;
  onSave: (s: ServiceDef) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(service.label);
  const [emoji, setEmoji] = useState<string>(service.emoji);
  const [theme, setTheme] = useState<ServiceTheme>(service.theme);

  return (
    <div className="space-y-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
      <input
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div>
        <div className="mt-2 flex flex-wrap gap-2">
          {SERVICE_EMOJIS.map(em => (
            <button
              key={em}
              type="button"
              onClick={() => setEmoji(em)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${emoji === em ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-white hover:bg-slate-50'}`}
            >
              {em}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mt-2 flex flex-wrap gap-2">
          {THEMES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`flex h-6 w-6 items-center justify-center rounded-full ${getThemeDotBg(t)} ${theme === t ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (!name.trim()) return;
            onSave({ ...service, label: name.trim(), emoji, theme });
          }}
          className="flex-1 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white"
        >
          Guardar
        </button>
        <button
           onClick={onCancel}
           className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-800"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
