"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAppState } from "@/context/AppStateContext";
import type { Person, PersonId } from "@/lib/types";
import { defaultPersonPayment } from "@/lib/billing";
import type { ServiceDef } from "@/lib/types";

function anyParticipation(p: Record<string, boolean>, services: ServiceDef[]): boolean {
  return services.some((s) => p[s.id]);
}

export default function PeoplePage() {
  const { ready, state, addPerson, updatePerson, deletePerson } = useAppState();
  const [name, setName] = useState("");
  const [participation, setParticipation] = useState<Record<string, boolean>>(
    () => {
      const pm = defaultPersonPayment();
      // Initialize to true for the first two services for convenience, if any.
      // But it's safer to just let the user toggle. We'll default all to true to be nice.
      return pm;
    }
  );
  const [editingId, setEditingId] = useState<PersonId | null>(null);

  // Set default participation once state has loaded, if not yet customized
  if (ready && Object.keys(participation).length === 0 && state.services.length > 0) {
    const defaultP: Record<string, boolean> = {};
    for (const s of state.services) defaultP[s.id] = true;
    setParticipation(defaultP);
  }

  if (!ready) return <LoadingScreen />;

  function toggleService(id: string) {
    setParticipation((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    if (!anyParticipation(participation, state.services)) return;
    addPerson({
      name: n,
      participatesIn: { ...participation },
    });
    setName("");
    const nextP: Record<string, boolean> = {};
    for (const s of state.services) nextP[s.id] = true;
    setParticipation(nextP);
  }

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Personas</h1>
        <p className="text-sm font-bold text-brand-blue/80">
          ¿Quiénes viven en el hogar?
        </p>
      </header>

      <form
        onSubmit={submitAdd}
        className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40"
      >
        <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Nombre</label>
        <input
          className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-900 font-bold outline-none ring-brand-blue/20 focus:ring-4 transition-all"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Ana"
        />
        <fieldset className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
          {state.services.map((svc) => (
            <label
              key={svc.id}
              className="flex items-center gap-2 text-sm font-medium text-slate-700"
            >
              <input
                type="checkbox"
                checked={participation[svc.id] ?? false}
                onChange={() => toggleService(svc.id)}
                className="h-5 w-5 rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
              />
              {svc.label}
            </label>
          ))}
        </fieldset>
        <button
          type="submit"
          disabled={!name.trim() || !anyParticipation(participation, state.services)}
          className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          Agregar integrante
        </button>
      </form>

      <ul className="space-y-3">
        {state.people.map((p) => (
          <li key={p.id}>
            {editingId === p.id ? (
              <PersonEditor
                person={p}
                services={state.services}
                onCancel={() => setEditingId(null)}
                onSave={(next) => {
                  updatePerson(p.id, next);
                  setEditingId(null);
                }}
              />
            ) : (
              <PersonRow
                person={p}
                services={state.services}
                onEdit={() => setEditingId(p.id)}
                onDelete={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.confirm(`¿Eliminar a ${p.name}?`)
                  ) {
                    deletePerson(p.id);
                  }
                }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PersonRow({
  person,
  services,
  onEdit,
  onDelete,
}: {
  person: Person;
  services: ServiceDef[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const svcLabels = services.filter((s) => person.participatesIn[s.id]).map(
    (s) => s.label,
  );

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <Avatar name={person.name} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">{person.name}</p>
        <p className="text-xs text-slate-500">
          {svcLabels.length > 0
            ? svcLabels.join(" · ")
            : "Sin servicios (editá para asignar)"}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

function PersonEditor({
  person,
  services,
  onSave,
  onCancel,
}: {
  person: Person;
  services: ServiceDef[];
  onSave: (p: Omit<Person, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(person.name);
  const [participation, setParticipation] = useState<Record<string, boolean>>(
    () => ({ ...person.participatesIn }),
  );

  function toggleService(id: string) {
    setParticipation((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-3 rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
      <input
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {services.map((svc) => (
          <label key={svc.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={participation[svc.id] ?? false}
              onChange={() => toggleService(svc.id)}
              className="h-4 w-4 rounded border-slate-300"
            />
            {svc.label}
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            const n = name.trim();
            if (!n || !anyParticipation(participation, services)) return;
            onSave({
              name: n,
              participatesIn: { ...participation },
            });
          }}
          className="flex-1 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-800"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
