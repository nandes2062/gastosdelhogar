"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAppState } from "@/context/AppStateContext";
import type { Person, PersonId } from "@/lib/types";
import { defaultPersonPayment } from "@/lib/billing";
import { SERVICES } from "@/lib/services";
import type { ServiceId } from "@/lib/services";

function anyParticipation(p: Record<ServiceId, boolean>): boolean {
  return SERVICES.some((s) => p[s.id]);
}

export default function PeoplePage() {
  const { ready, state, addPerson, updatePerson, deletePerson } = useAppState();
  const [name, setName] = useState("");
  const [participation, setParticipation] = useState<Record<ServiceId, boolean>>(
    () => ({
      ...defaultPersonPayment(),
      gas: true,
      water: true,
    }),
  );
  const [editingId, setEditingId] = useState<PersonId | null>(null);

  if (!ready) return <LoadingScreen />;

  function toggleService(id: ServiceId) {
    setParticipation((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    if (!anyParticipation(participation)) return;
    addPerson({
      name: n,
      participatesIn: { ...participation },
    });
    setName("");
    setParticipation({
      ...defaultPersonPayment(),
      gas: true,
      water: true,
    });
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-lg font-bold text-slate-900">Personas</h1>
        <p className="text-sm text-slate-500">
          Participación por servicio. Los avatares usan iniciales.
        </p>
      </header>

      <form
        onSubmit={submitAdd}
        className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <label className="block text-sm font-medium text-slate-800">Nombre</label>
        <input
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-blue-200 focus:ring-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Ana"
        />
        <fieldset className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
          {SERVICES.map((svc) => (
            <label
              key={svc.id}
              className="flex items-center gap-2 text-sm text-slate-800"
            >
              <input
                type="checkbox"
                checked={participation[svc.id]}
                onChange={() => toggleService(svc.id)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              {svc.label}
            </label>
          ))}
        </fieldset>
        <button
          type="submit"
          disabled={!name.trim() || !anyParticipation(participation)}
          className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Agregar persona
        </button>
      </form>

      <ul className="space-y-3">
        {state.people.map((p) => (
          <li key={p.id}>
            {editingId === p.id ? (
              <PersonEditor
                person={p}
                onCancel={() => setEditingId(null)}
                onSave={(next) => {
                  updatePerson(p.id, next);
                  setEditingId(null);
                }}
              />
            ) : (
              <PersonRow
                person={p}
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
  onEdit,
  onDelete,
}: {
  person: Person;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const svcLabels = SERVICES.filter((s) => person.participatesIn[s.id]).map(
    (s) => s.label,
  );

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <Avatar name={person.name} variant="neutral" />
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
  onSave,
  onCancel,
}: {
  person: Person;
  onSave: (p: Omit<Person, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(person.name);
  const [participation, setParticipation] = useState<Record<ServiceId, boolean>>(
    () => ({ ...person.participatesIn }),
  );

  function toggleService(id: ServiceId) {
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
        {SERVICES.map((svc) => (
          <label key={svc.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={participation[svc.id]}
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
            if (!n || !anyParticipation(participation)) return;
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
