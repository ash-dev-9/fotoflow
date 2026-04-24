import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FotoFlow.ai - Livraison photo IA",
  description: "Distribuez automatiquement les photos d'événements grâce à la reconnaissance faciale.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} font-sans bg-[#09090b] text-zinc-50 antialiased selection:bg-blue-500/30`}>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
