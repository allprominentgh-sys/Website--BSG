import "./globals.css";

export const metadata = {
  title: "ALL PROMINENT GHANA",
  description: "Buy • Sell • Advertise • Connect",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
