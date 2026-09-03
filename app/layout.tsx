import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://prominent.mkt"),

  title: {
    default: "All Prominent Ghana | Buy, Sell & Advertise",
    template: "%s | All Prominent Ghana",
  },

  description:
    "All Prominent Ghana is a Ghanaian marketplace to buy, sell, advertise and connect. Discover vehicles, machinery, electronics, agriculture equipment, tools, property and more.",

  keywords: [
    "All Prominent Ghana",
    "Ghana marketplace",
    "buy and sell Ghana",
    "Ghana classifieds",
    "vehicles Ghana",
    "industrial machinery Ghana",
    "electronics Ghana",
    "agriculture equipment Ghana",
    "advertise Ghana",
    "online marketplace Ghana",
  ],

  authors: [{ name: "All Prominent Ghana" }],
  creator: "All Prominent Ghana",
  publisher: "All Prominent Ghana",

  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "https://prominent.mkt",
    siteName: "All Prominent Ghana",
    title: "All Prominent Ghana | Buy, Sell & Advertise",
    description:
      "Buy, sell, advertise and connect across Ghana with All Prominent Ghana.",
  },

  twitter: {
    card: "summary_large_image",
    title: "All Prominent Ghana | Buy, Sell & Advertise",
    description:
      "Buy, sell, advertise and connect across Ghana.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GH">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta name="theme-color" content="#155EEF" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <meta
          name="apple-mobile-web-app-title"
          content="All Prominent Ghana"
        />
      </head>

      <body>{children}</body>
    </html>
  );
}
