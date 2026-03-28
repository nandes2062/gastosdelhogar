import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"] });

export function LoadingScreen() {
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white ${outfit.className}`}>
      <div className="flex flex-col items-center space-y-6 animate-pulse">
        {/* Logo Conceptual */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-blue shadow-2xl shadow-brand-blue/30">
          <span className="text-5xl">🐮</span>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Hagamos Vaquita
          </h1>
          <p className="text-sm font-bold text-brand-blue/70 max-w-[200px] leading-snug">
            Sincronizando tus servicios locales...
          </p>
        </div>
      </div>
      
      {/* Footer del eslogan */}
      <div className="absolute bottom-12 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
          Sin cuentas · Sin internet · Sin enredos
        </p>
      </div>
    </div>
  );
}
