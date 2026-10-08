import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/session";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "KodiLedger", template: "%s · KodiLedger" },
  description: "Rental property management and M-Pesa reconciliation.",
  applicationName: "KodiLedger",
  icons: { icon: "/icon.svg" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0B0E13", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
