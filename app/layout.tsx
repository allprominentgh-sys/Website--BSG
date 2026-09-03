import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://prominent.mkt"),

  title: {
    default: "All Prominent Ghana",
    template: "%s | All Prominent Ghana",
  },

  description:
    "All Prominent Ghana is a Ghanaian marketplace for buying, selling, advertising and connecting businesses and customers.",

  keywords: [
    "Ghana marketplace",
    "buy and sell Ghana",
    "Ghana business marketplace",
    "industrial machinery Ghana",
    "vehicles Ghana",
    "electronics Ghana",
    "agriculture equipment Ghana",
    "printing equipment Ghana",
    "tools Ghana",
    "All Prominent Ghana",
  ],

  authors: [
    {
      name: "All Prominent Ghana",
    },
  ],

  creator: "All Prominent Ghana",

  publisher: "All Prominent Ghana",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "https://prominent.mkt",
    siteName: "All Prominent Ghana",
    title: "All Prominent Ghana",
    description:
      "Buy, sell, advertise and connect across Ghana.",
  },

  twitter: {
    card: "summary_large_image",
    title: "All Prominent Ghana",
    description:
      "Buy, sell, advertise and connect across Ghana.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GH">
      <body>{children}</body>
    </html>
  );
}
