// app/page.tsx
// Page d'accueil publique de SkillPay — présente l'agrégateur et ses services.
// Style Notion (bordures fines, aucun rayon d'arrondi) + accent Orange (Orange Money)
// et jaune (MTN MoMo). Entièrement responsive (mobile-first).

"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  IconPlug,
  IconChartBar,
  IconBell,
  IconRefresh,
} from "@tabler/icons-react";
import MerchantPage from "./merchant/page";

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

const demoHighlights = [
  { label: "Montant de test", value: "1 000 XAF" },
  { label: "Numéro de test", value: "237690000001" },
  { label: "Statut final", value: "SUCCESSFUL" },
];

export default function HomePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="flex min-h-screen items-center justify-center bg-background">Chargement...</div>;
  }

  if (user) {
    return <MerchantPage />;
  }

  return <PublicHome />;
}

function PublicHome() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-10">
        <Link href="/" className="text-base font-semibold tracking-tight text-text-primary">
          SkillPay
        </Link>

        <nav className="hidden gap-6 text-sm text-text-secondary md:flex">
          <Link href="#fonctionnalites" className="transition hover:text-text-primary">
            Fonctionnalités
          </Link>
          <Link href="/demo" className="transition hover:text-text-primary">
            Mode démo
          </Link>
          <Link href="/docs" className="transition hover:text-text-primary">
            Documentation
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/demo"
            className="border border-mtn-yellow bg-[#fff6d8] px-4 py-2 text-sm font-semibold text-text-primary"
          >
            Mode démo
          </Link>
          <Link href="/signup" className="bg-orange-money px-4 py-2 text-sm font-semibold text-white">
            Devenir marchand
          </Link>
        </div>
      </header>

      <main>
        <section className="border-b border-border bg-[linear-gradient(135deg,#fff7e8_0%,#ffffff_100%)] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl text-center lg:text-left">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-orange-money">
                Agrégateur de paiement mobile
              </p>
              <h1 className="text-2xl font-semibold leading-snug sm:text-3xl lg:text-4xl">
                Une seule intégration pour accepter Orange Money et MTN MoMo
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base lg:mx-0">
                SkillPay unifie les deux opérateurs derrière une API et un tableau de bord uniques,
                pour les marchands et développeurs au Cameroun.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href="/demo"
                  className="w-full bg-orange-money px-5 py-3 text-sm font-semibold text-white sm:w-auto"
                >
                  Essayer la démo
                </Link>
                <Link
                  href="/signup"
                  className="w-full border border-border bg-surface px-5 py-3 text-sm font-semibold text-text-primary sm:w-auto"
                >
                  Devenir marchand
                </Link>
              </div>
            </div>

            <div className="w-full max-w-md border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Mode démo sécurisé</p>
                <span className="border border-mtn-yellow bg-[#fff8d9] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-primary">
                  Safe
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {demoHighlights.map((item) => (
                  <div key={item.label} className="border border-border bg-canvas p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-dashed border-border pt-4 text-sm text-text-secondary">
                Aucun vrai argent n’est utilisé, tout est simulé pour valider le parcours.
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border px-4 py-10 sm:px-6 lg:px-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary">
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

        <section id="fonctionnalites" className="px-4 py-10 sm:px-6 lg:px-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary">
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
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-text-secondary sm:px-6 lg:px-10">
        SkillPay — Cameroun
      </footer>
    </div>
  );
}
