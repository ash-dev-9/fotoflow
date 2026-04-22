import Link from "next/link";

export const metadata = {
  title: "Politique de Confidentialité - FotoFlow.ai",
  description: "Politique de confidentialité et protection des données de FotoFlow.ai.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#111827] px-4 py-16 text-slate-100">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5B7CFF]">
            Légal
          </p>
          <h1 className="mt-2 text-4xl font-bold">Politique de Confidentialité</h1>
          <p className="mt-4 text-sm text-slate-400">
            Dernière mise à jour: {new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-6 rounded-xl border border-white/10 bg-slate-900/60 p-8">
          <section>
            <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
            <p className="text-slate-300">
              FotoFlow.ai ("nous", "notre" ou "la Société") respecte votre vie privée. Cette politique explique
              comment nous collectons, utilisons, divulguons et sauvegardons vos données.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">2. Données que nous collectons</h2>
            <p className="text-slate-300">
              Nous collectons des données que vous nous fournissez directement et des données collectées
              automatiquement:
            </p>
            <ul className="list-inside list-disc space-y-2 text-slate-300">
              <li>Informations de compte (nom, email, numéro de téléphone)</li>
              <li>Données d&apos;événement (photos, métadonnées, dates)</li>
              <li>Données de paiement (traitées de manière sécurisée)</li>
              <li>Logs d&apos;accès et utilisation</li>
              <li>Données de reconnaissance faciale (avec consentement)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">3. Comment nous utilisons vos données</h2>
            <p className="text-slate-300">
              Nous utilisons vos données pour:
            </p>
            <ul className="list-inside list-disc space-y-2 text-slate-300">
              <li>Fournir et améliorer nos services</li>
              <li>Traiter les transactions et envoyer les factures</li>
              <li>Communiquer avec vous concernant les mises à jour et le support</li>
              <li>Analyser l&apos;utilisation du service et détecter les fraudes</li>
              <li>Respecter les obligations légales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">4. Protection RGPD</h2>
            <p className="text-slate-300">
              En tant que service opérant en Europe, FotoFlow.ai respecte strictement le Règlement Général sur la
              Protection des Données (RGPD). Vos droits incluent:
            </p>
            <ul className="list-inside list-disc space-y-2 text-slate-300">
              <li>Droit d&apos;accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l&apos;effacement ("oubli")</li>
              <li>Droit à la portabilité des données</li>
              <li>Droit d&apos;opposition au traitement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">5. Sécurité des données</h2>
            <p className="text-slate-300">
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre
              l&apos;accès non autorisé, la modification ou la divulgation. Cela inclut le chiffrement en transit
              et au repos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">6. Partage des données</h2>
            <p className="text-slate-300">
              Nous ne vendons pas vos données. Nous pouvons les partager avec:
            </p>
            <ul className="list-inside list-disc space-y-2 text-slate-300">
              <li>Prestataires de services (paiement, hébergement, IA)</li>
              <li>Partenaires commerciaux (avec votre consentement)</li>
              <li>Autorités légales (si requis par la loi)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">7. Durée de rétention</h2>
            <p className="text-slate-300">
              Vos données sont conservées aussi longtemps que nécessaire pour fournir nos services ou respecter
              les obligations légales. Vous pouvez demander la suppression à tout moment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">8. Modifications de cette politique</h2>
            <p className="text-slate-300">
              Nous pouvons mettre à jour cette politique de temps en temps. Les modifications substantielles vous
              seront notifiées par email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">9. Nous contacter</h2>
            <p className="text-slate-300">
              Pour des questions concernant cette politique ou vos données:
            </p>
            <ul className="list-inside list-disc space-y-2 text-slate-300">
              <li>Email: privacy@fotoflow.ai</li>
              <li>
                <Link href="/contact" className="text-[#5B7CFF] hover:underline">
                  Formulaire de contact
                </Link>
              </li>
            </ul>
          </section>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:border-white/40"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
