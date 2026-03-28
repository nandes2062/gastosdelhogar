"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SERVICES } from "@/lib/services";
import type { ServiceId } from "@/lib/services";

type NavIcon = React.ComponentType<{ className?: string; active?: boolean }>;

type NavItem = {
  href: string;
  label: string;
  Icon: NavIcon;
};

function serviceIcon(id: ServiceId): NavIcon {
  const map: Record<string, NavIcon> = {
    gas: IconFlame,
    water: IconDroplet,
  };
  return map[id] ?? IconHome;
}

const staticTail: NavItem[] = [
  { href: "/history", label: "Historial", Icon: IconClock },
  { href: "/people", label: "Personas", Icon: IconUsers },
  { href: "/backup", label: "Backup", Icon: IconDatabase },
];

const items: NavItem[] = [
  { href: "/", label: "Inicio", Icon: IconHome },
  ...SERVICES.map((s) => ({
    href: s.route,
    label: s.navLabel,
    Icon: serviceIcon(s.id),
  })),
  ...staticTail,
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      aria-label="Principal"
    >
      <div className="mx-auto flex max-w-lg overflow-x-auto px-1 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-full justify-around gap-0.5">
          {items.map(({ href, label, Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-w-[3.25rem] shrink-0 flex-col items-center gap-0.5 rounded-lg py-2 text-[9px] font-medium sm:text-[10px] ${
                  active
                    ? "text-blue-700"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${active ? "text-blue-600" : "text-slate-400"}`}
                  active={active}
                />
                <span className="max-w-[4.5rem] truncate text-center leading-tight">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function IconHome({
  className,
  active,
}: {
  className?: string;
  active?: boolean;
}) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
    </svg>
  );
}

function IconFlame({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3c2 3 6 4.5 6 9a6 6 0 11-12 0c0-2 .5-4 2-5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDroplet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5c2.5 4 7 7.2 7 11.5a7 7 0 11-14 0c0-4.3 4.5-7.5 7-11.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBolt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M12 7v6l4 2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDatabase({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M3 5v4c0 1.657 4.03 3 9 3s9-1.343 9-3V5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M3 9v4c0 1.657 4.03 3 9 3s9-1.343 9-3V9"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M3 13v4c0 1.657 4.03 3 9 3s9-1.343 9-3v-4"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}
