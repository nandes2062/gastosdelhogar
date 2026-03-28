"use client";

import { BottomNav } from "@/components/BottomNav";
import { InstallAppPrompt } from "@/components/InstallAppPrompt";
import { PwaOpenHint } from "@/components/PwaOpenHint";
import { AppStateProvider } from "@/context/AppStateContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppStateProvider>
      <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-white text-slate-900 shadow-xl shadow-slate-200/50">
        <main className="flex-1 px-5 pb-24 pt-6">
          <InstallAppPrompt />
          <PwaOpenHint />
          {children}
        </main>
        <BottomNav />
      </div>
    </AppStateProvider>
  );
}
