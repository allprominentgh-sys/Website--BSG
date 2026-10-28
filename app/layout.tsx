
import type { Metadata } from "next";
import { ThemeProvider } from "./components/ThemeProvider";
import { MarketPreferencesProvider } from "./components/MarketPreferencesProvider";
import MarketPreferenceControls from "./components/MarketPreferenceControls";
import "./globals.css";

export const metadata: Metadata = {
  title: "BestSalesGH | Buy, Sell & Advertise",
  description:
    "BestSalesGH is a marketplace to buy, sell, and advertise products and services in Ghana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <MarketPreferencesProvider>
            <div className="border-b border-slate-200 bg-white px-4 py-3">
              <MarketPreferenceControls />
            </div>

            {children}
          </MarketPreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
