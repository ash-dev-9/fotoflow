import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FotoFlow.ai | Livraison de Photos par IA & Reconnaissance Faciale",
  description: "La plateforme premium pour photographes événementiels. Distribuez automatiquement vos photos aux invités grâce à une reconnaissance faciale sécurisée et ultra-rapide.",
  keywords: ["photographie", "événement", "IA", "reconnaissance faciale", "galerie photo", "partage photo"],
  authors: [{ name: "FotoFlow.ai" }],
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FotoFlow",
  },
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
