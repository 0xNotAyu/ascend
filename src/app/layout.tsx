import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ascend",
  description: "Build a consistent life, one day at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased font-sans">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
