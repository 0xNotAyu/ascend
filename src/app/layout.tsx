import type { Metadata } from "next";
import { NavShortcuts } from "@/features/navigation/nav-shortcuts";
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
      <body className="min-h-full flex flex-col">
        <NavShortcuts />
        {children}
      </body>
    </html>
  );
}
