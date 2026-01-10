import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LazorkitContextProvider } from "@/contexts/LazorkitContext";
import { WalletContextProvider } from "@/contexts/WalletContext";
import { ToastProvider } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lazorkit Starter Kit",
  description: "Passkey-based Solana wallet with gasless transactions",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        <LazorkitContextProvider>
          <WalletContextProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </WalletContextProvider>
        </LazorkitContextProvider>
      </body>
    </html>
  );
}
