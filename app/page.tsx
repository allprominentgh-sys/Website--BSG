import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BEST SALES GHANA | Buy • Sell • Advertise • Connect",
  description:
    "Ghana's marketplace for products, vehicles, property, services, machinery, equipment and business opportunities.",
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
