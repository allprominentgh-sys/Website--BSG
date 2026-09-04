import type { Metadata } from "next";
import "./globals.css";
import Header from "../Header";

export const metadata: Metadata = {
  title: "All Prominent Ghana",
  description:
    "All Prominent Ghana marketplace for buying and selling products and services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
