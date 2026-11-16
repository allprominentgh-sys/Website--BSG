
import type { Metadata } from "next";
import Script from "next/script";
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
  other: {
    "google-adsense-account": "ca-pub-7477258968243100",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7477258968243100"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
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
