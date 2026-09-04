import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "All Prominent Ghana",
  description:
    "All Prominent Ghana marketplace for industrial machinery, printing equipment, vehicles, electronics, agriculture, tools and more.",
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
