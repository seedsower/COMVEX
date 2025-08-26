import type { Metadata } from "next";
import "./globals.css";
import { AppWalletProvider } from "@/components/providers/WalletProvider";
import { DriftProvider } from "@/components/providers/DriftProvider";

export const metadata: Metadata = {
  title: "Apex Protocol - Local Development",
  description: "Local development interface for Apex Protocol fork",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-100 font-sans">
        <AppWalletProvider>
          <DriftProvider>
            {children}
          </DriftProvider>
        </AppWalletProvider>
      </body>
    </html>
  );
}
