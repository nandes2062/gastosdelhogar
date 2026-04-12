import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const outfit = Outfit({ subsets: ["latin"] });

const APP_NAME = "Hagamos Vaquita";
const APP_TITLE = "Hagamos Vaquita";
const APP_DESCRIPTION = "Tu vaquita mensual, sin cuentas, sin internet, y sin enredos.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_TITLE,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_TITLE,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#007AFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`h-full ${outfit.className}`} suppressHydrationWarning>
      <body className="min-h-dvh antialiased bg-white text-slate-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
