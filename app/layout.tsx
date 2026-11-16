
import type { Metadata } from "next";
import { ThemeProvider } from "./components/ThemeProvider";
import { MarketPreferencesProvider } from "./components/MarketPreferencesProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "BestSalesGH | Buy, Sell & Advertise",
  description:
    "BestSalesGH is a marketplace to buy, sell, and advertise products and services in Ghana.",
  manifest: "/manifest.json",
  themeColor: "#123B8A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ServiceWorkerRegister />
        <ThemeProvider>
          <MarketPreferencesProvider>
            {children}
          </MarketPreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
