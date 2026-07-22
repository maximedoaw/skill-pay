"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import {
  Plug,
  BarChart3,
  BellRing,
  RefreshCw,
  ArrowRight,
  BookOpen,
  Code
} from "lucide-react";
import MerchantPage from "./merchant/page";
import AiChatBubble from "./components/AiChatBubble";

const services = [
  {
    icon: Plug,
    title: "API unifiée",
    description: "Un seul point d'entrée pour initier un paiement, quel que soit l'opérateur.",
  },
  {
    icon: BarChart3,
    title: "Tableau de bord temps réel",
    description: "Volume, taux de succès et historique des transactions en direct.",
  },
  {
    icon: BellRing,
    title: "Notifications automatiques",
    description: "Webhooks, emails et SMS envoyés dès qu'un paiement change de statut.",
  },
  {
    icon: RefreshCw,
    title: "Réconciliation automatique",
    description: "Les transactions en attente sont revérifiées et mises à jour sans intervention.",
  },
];

export default function HomePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <MerchantPage />;
  }

  return <PublicHome />;
}

function PublicHome() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200">
      {/* Top Navbar (Notion style, very minimal) */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl">💳</span>
            SkillPay
          </Link>
          <div className="hidden md:flex items-center gap-1 text-sm text-gray-500 font-medium">
            <span className="text-gray-300 mx-1">/</span>
            <Link href="#operateurs" className="hover:bg-gray-100 px-2 py-1 rounded transition-colors">Opérateurs</Link>
            <Link href="#fonctionnalites" className="hover:bg-gray-100 px-2 py-1 rounded transition-colors">Fonctionnalités</Link>
            <Link href="/docs" className="hover:bg-gray-100 px-2 py-1 rounded transition-colors flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5"/> Docs</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/demo"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 hover:bg-gray-100 rounded transition-colors hidden sm:block"
          >
            Mode démo
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
          >
            Commencer
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        
        {/* Cover / Icon area */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-6xl md:text-8xl mb-8">🚀</div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight text-gray-900 leading-[1.15]">
            Une seule intégration pour accepter Orange Money et MTN MoMo.
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl leading-relaxed">
            SkillPay unifie les deux opérateurs principaux du Cameroun derrière une API et un tableau de bord uniques pour les marchands et les développeurs.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-black text-white px-6 py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-sm"
            >
              Créer un compte marchand
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
            >
              <Code className="w-4 h-4" />
              Essayer la démo
            </Link>
          </div>
        </div>

        <hr className="border-gray-100 my-16" />

        {/* Section Opérateurs */}
        <section id="operateurs" className="mb-16">
          <h2 className="text-2xl font-bold font-serif mb-6 flex items-center gap-2">
            <span className="text-gray-300 font-sans font-normal">#</span> Opérateurs supportés
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed max-w-3xl">
            Nous avons simplifié l'intégration avec les deux plus grands réseaux Mobile Money au Cameroun. Vous n'avez plus besoin de gérer de multiples documentations ou de maintenir des systèmes de réconciliation complexes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Orange Card */}
            <div className="group border border-gray-200 rounded-xl p-1 bg-white hover:border-orange-300 hover:shadow-md hover:shadow-orange-100/50 transition-all duration-300 overflow-hidden">
              <div className="aspect-[16/9] relative bg-gray-50 border-b border-gray-100 overflow-hidden rounded-t-lg">
                <Image 
                  src="/orange.png" 
                  alt="Orange Money" 
                  fill
                  className="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                  Orange Money
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Collecte et suivi des paiements via l'API Web Payment Orange, gérés automatiquement par nos serveurs pour une fiabilité maximale.
                </p>
              </div>
            </div>

            {/* MTN Card */}
            <div className="group border border-gray-200 rounded-xl p-1 bg-white hover:border-yellow-400 hover:shadow-md hover:shadow-yellow-100/50 transition-all duration-300 overflow-hidden">
              <div className="aspect-[16/9] relative bg-gray-50 border-b border-gray-100 overflow-hidden rounded-t-lg">
                <Image 
                  src="/mtn.jpg" 
                  alt="MTN MoMo" 
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                  MTN MoMo
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Collecte de fonds fluide via le produit Collection de l'API MTN Mobile Money, entièrement unifiée dans l'écosystème SkillPay.
                </p>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-gray-100 my-16" />

        {/* Section Fonctionnalités */}
        <section id="fonctionnalites">
          <h2 className="text-2xl font-bold font-serif mb-6 flex items-center gap-2">
            <span className="text-gray-300 font-sans font-normal">/</span> Ce que fait SkillPay
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map(({ icon: Icon, title, description }) => (
              <div key={title} className="p-6 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Footer */}
        <footer className="mt-32 pt-8 border-t border-gray-100 text-sm text-gray-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
             <span className="text-lg">💳</span> SkillPay — Cameroun
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Conditions d'utilisation</Link>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Confidentialité</Link>
          </div>
        </footer>
      </main>

      {/* Bulle de conversation IA Notion Vert */}
      <AiChatBubble />
    </div>
  );
}
