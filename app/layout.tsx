import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CookiePreferences } from "./cookie-preferences";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Nikky’S — Ръчно изработени аксесоари",
  description: "Несесери, чанти и аксесоари от капитонирана кожа, създадени на ръка с внимание към всеки детайл.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body className="antialiased">{children}<CookiePreferences /></body>
    </html>
  );
}
