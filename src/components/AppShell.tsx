"use client";

import { BottomNav } from "@/components/BottomNav";
import { InstallAppPrompt } from "@/components/InstallAppPrompt";
import { PwaOpenHint } from "@/components/PwaOpenHint";
import { AppStateProvider } from "@/context/AppStateContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppStateProvider>
      <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-slate-50 text-slate-900">
        <main className="flex-1 px-4 pb-24 pt-4">
          <InstallAppPrompt />
          <PwaOpenHint />
          {children}
        </main>
        <BottomNav />
      </div>
    </AppStateProvider>
  );
}
