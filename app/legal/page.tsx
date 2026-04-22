import Link from "next/link";

export const metadata = {
  title: "Mentions Légales - FotoFlow.ai",
  description: "Mentions légales et conditions d'utilisation de FotoFlow.ai.",
};

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[#111827] px-4 py-16 text-slate-100">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5B7CFF]">
            Légal
          </p>
          <h1 className="mt-2 text-4xl font-bold">Mentions Légales</h1>
          <p className="mt-4 text-sm text-slate-400">
            Conditions d&apos;utilisation et informations légales
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-6 rounded-xl border border-white/10 bg-slate-900/60 p-8">
          <section>
            <h2 className="text-2xl font-semibold text-white">1. Identification</h2>
            <p className="text-slate-300">
              <strong>Société:</strong> FotoFlow.ai SAS
            </p>
            <p className="text-slate-300">
              <strong>Adresse:</strong> Paris, France
            </p>
            <p className="text-slate-300">
              <strong>Email:</strong> contact@fotoflow.ai
            </p>
            <p className="text-slate-300">
              <strong>Responsable du site:</strong> L&apos;équipe FotoFlow.ai
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">2. Accès au service</h2>
            <p className="text-slate-300">
              FotoFlow.ai met à disposition un service de distribution automatique de photos d&apos;événements
              basé sur la reconnaissance faciale. L&apos;accès nécessite un compte utilisateur et l&apos;acceptation
              de ces conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">3. Conditions d&apos;utilisation</h2>
            <p className="text-slate-300">
              En utilisant FotoFlow.ai, vous acceptez:
            </p>
            <ul className="list-inside list-disc space-y-2 text-slate-300">
              <li>De fournir des informations exactes lors de l&apos;inscription</li>
              <li>De respecter la vie privée et les droits des personnes dans les photos</li>
              <li>De ne pas utiliser le service à des fins illégales ou non autorisées</li>
              <li>De ne pas tenter de contourner les mesures de sécurité</li>
              <li>De respecter les droits de propriété intellectuelle</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">4. Propriété intellectuelle</h2>
            <p className="text-slate-300">
              Tous les contenus du site (code, textes, images, logos) sont protégés par les droits
              d&apos;auteur. Vous n&apos;êtes autorisé qu&apos;à utiliser FotoFlow.ai pour votre usage
              personnel ou professionnel conformément à ces conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">5. Responsabilité de l&apos;utilisateur</h2>
            <p className="text-slate-300">
              Vous êtes seul responsable des photos que vous téléchargez et du respect de la vie privée
              des personnes figurant dans celles-ci. Vous garantissez avoir le consentement nécessaire pour
              traiter les photos conformément à cette plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">6. Limitation de responsabilité</h2>
            <p className="text-slate-300">
              FotoFlow.ai fournit le service "tel quel". Nous ne garantissons pas que le service sera
              ininterrompu, exempt d&apos;erreurs ou que tous les défauts seront corrigés. L&apos;utilisation
              du service est à vos risques et périls.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">7. Tarification et paiement</h2>
            <p className="text-slate-300">
              Les tarifs et conditions de paiement sont disponibles dans les paramètres de votre compte.
              Les frais sont facturés selon le plan sélectionné. La facturation continue jusqu&apos;à
              l&apos;annulation de l&apos;abonnement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">8. Annulation et résiliation</h2>
            <p className="text-slate-300">
              Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Les données
              seront conservées pendant 30 jours avant suppression définitive, conformément à notre politique
              de confidentialité.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">9. Support technique</h2>
            <p className="text-slate-300">
              Le support technique est disponible par email et WhatsApp pour tous les utilisateurs actifs.
              Les temps de réponse sont indicatifs et peuvent varier en fonction de la charge.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">10. Modifications des conditions</h2>
            <p className="text-slate-300">
              FotoFlow.ai se réserve le droit de modifier ces conditions à tout moment. Les modifications
              significatives seront notifiées par email. L&apos;utilisation continue du service après
              modification constitue l&apos;acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">11. Droit applicable</h2>
            <p className="text-slate-300">
              Ces conditions sont régies par les lois françaises. Tout litige sera soumis à la juridiction
              des tribunaux de Paris.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">12. Conformité légale</h2>
            <p className="text-slate-300">
              FotoFlow.ai respecte:
            </p>
            <ul className="list-inside list-disc space-y-2 text-slate-300">
              <li>Le RGPD (Règlement Général sur la Protection des Données)</li>
              <li>Les lois françaises sur la protection des données</li>
              <li>Les directives européennes sur la vie privée</li>
              <li>Les réglementations sur les biométriques</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">13. Contact</h2>
            <p className="text-slate-300">
              Pour toute question concernant ces mentions légales:
            </p>
            <ul className="list-inside list-disc space-y-2 text-slate-300">
              <li>Email: legal@fotoflow.ai</li>
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
