// app/page.tsx
// Page d'accueil publique de SkillPay — présente l'agrégateur et ses services.
// Style Notion (bordures fines, aucun rayon d'arrondi) + accent Orange (Orange Money)
// et jaune (MTN MoMo). Entièrement responsive (mobile-first).

import Link from "next/link";
import {
  IconPlug,
  IconChartBar,
  IconBell,
  IconRefresh,
} from "@tabler/icons-react";

const services = [
  {
    icon: IconPlug,
    title: "API unifiée",
    description: "Un seul point d'entrée pour initier un paiement, quel que soit l'opérateur.",
  },
  {
    icon: IconChartBar,
    title: "Tableau de bord temps réel",
    description: "Volume, taux de succès et historique des transactions en direct.",
  },
  {
    icon: IconBell,
    title: "Notifications automatiques",
    description: "Webhooks, emails et SMS envoyés dès qu'un paiement change de statut.",
  },
  {
    icon: IconRefresh,
    title: "Réconciliation automatique",
    description: "Les transactions en attente sont revérifiées et mises à jour sans intervention.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      {/* Barre de navigation */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6 lg:px-10">
        <span className="text-base font-semibold">SkillPay</span>

        <nav className="hidden gap-6 text-sm text-text-secondary md:flex">
          <Link href="#fonctionnalites">Fonctionnalités</Link>
          <Link href="#tarifs">Tarifs</Link>
          <Link href="/docs">Documentation</Link>
        </nav>

        <Link
          href="/sign-up"
          className="bg-brand-green px-4 py-2 text-sm font-medium text-white"
        >
          Devenir marchand
        </Link>
      </header>

      {/* Hero */}
      <section className="border-b border-border px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
          Agrégateur de paiement mobile
        </p>
        <h1 className="mx-auto max-w-2xl text-2xl font-semibold leading-snug sm:text-3xl lg:text-4xl">
          Une seule intégration pour accepter Orange Money et MTN MoMo
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
          SkillPay unifie les deux opérateurs derrière une API et un tableau de
          bord uniques, pour les marchands et développeurs au Cameroun.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className="w-full bg-text-primary px-5 py-2.5 text-sm font-medium text-white sm:w-auto"
          >
            Devenir marchand
          </Link>
          <Link
            href="/docs"
            className="w-full border border-border px-5 py-2.5 text-sm font-medium sm:w-auto"
          >
            Voir la documentation
          </Link>
        </div>
      </section>

      {/* Mode démo */}
      <section className="border-b border-border px-4 py-10 sm:px-6 lg:px-10">
        <div className="border border-border bg-surface p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Mode démonstration
              </p>
              <h2 className="text-xl font-semibold">
                Testez le parcours de paiement sans compte ni argent réel
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Cette démo vous permet de parcourir l’expérience d’un paiement mobile,
                de voir les états successifs et d’inspecter le flux de confirmation sans
                dépendre d’un vrai opérateur.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/demo" className="bg-text-primary px-5 py-2.5 text-sm font-medium text-white">
                Lancer la démo
              </Link>
              <Link href="/docs" className="border border-border px-5 py-2.5 text-sm font-medium">
                Comprendre le flux
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="border border-border bg-canvas p-4">
              <p className="text-sm font-semibold">1. Initiation</p>
              <p className="mt-2 text-sm text-text-secondary">
                Un paiement est créé avec un montant et un numéro de téléphone de test.
              </p>
            </div>
            <div className="border border-border bg-canvas p-4">
              <p className="text-sm font-semibold">2. Confirmation</p>
              <p className="mt-2 text-sm text-text-secondary">
                Le simulateur affiche l’état du paiement et le résultat attendu.
              </p>
            </div>
            <div className="border border-border bg-canvas p-4">
              <p className="text-sm font-semibold">3. Suivi</p>
              <p className="mt-2 text-sm text-text-secondary">
                Le statut passe en succès ou échec sans toucher à un vrai compte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Opérateurs supportés */}
      <section className="border-b border-border px-4 py-10 sm:px-6 lg:px-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Opérateurs supportés
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="border border-l-4 border-border border-l-orange-money bg-surface p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 bg-orange-money" />
              <span className="text-base font-semibold">Orange Money</span>
            </div>
            <p className="text-sm leading-relaxed text-text-secondary">
              Collecte et suivi des paiements via l'API Orange, gérés automatiquement.
            </p>
          </div>

          <div className="border border-l-4 border-border border-l-mtn-yellow bg-surface p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 bg-mtn-yellow" />
              <span className="text-base font-semibold">MTN MoMo</span>
            </div>
            <p className="text-sm leading-relaxed text-text-secondary">
              Collecte de fonds via le produit Collection de l'API MTN MoMo.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="fonctionnalites" className="px-4 py-10 sm:px-6 lg:px-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Ce que fait SkillPay
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, description }) => (
            <div key={title} className="border border-border bg-surface p-5">
              <Icon className="mb-3 h-5 w-5 text-brand-green" strokeWidth={1.5} />
              <h3 className="mb-1.5 text-sm font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-text-secondary sm:px-6 lg:px-10">
        SkillPay — Cameroun
      </footer>
    </div>
  );
}