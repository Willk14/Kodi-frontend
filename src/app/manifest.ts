import type { MetadataRoute } from "next";

// Installable PWA shell only. No service worker / offline caching of financial
// data is registered in this initial scope.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KodiLedger",
    short_name: "KodiLedger",
    description: "Rental property management and M-Pesa reconciliation.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0E13",
    theme_color: "#0B0E13",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
