import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "All Prominent Ghana",
  description:
    "Buy, sell, advertise and connect across Ghana with All Prominent Ghana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
