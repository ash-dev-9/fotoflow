import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FotoFlow.ai | Livraison de Photos par IA & Reconnaissance Faciale",
  description: "La plateforme premium pour photographes événementiels. Distribuez automatiquement vos photos aux invités grâce à une reconnaissance faciale sécurisée et ultra-rapide.",
  keywords: ["photographie", "événement", "IA", "reconnaissance faciale", "galerie photo", "partage photo"],
  openGraph: {
    title: "FotoFlow.ai - La Magie du Partage Photo",
    description: "Distribuez vos photos d'événements instantanément.",
    images: ["/images/og-image.jpg"],
  },
  authors: [{ name: "FotoFlow.ai" }],
  viewport: "width=device-width, initial-scale=1",
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
