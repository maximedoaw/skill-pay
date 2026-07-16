"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { trpc } from "@/lib/trpc-client";
import { isAdminEmail } from "@/lib/auth";

type TransactionItem = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  operator: string;
  payerMsisdn: string;
};

export default function MerchantPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [amount, setAmount] = useState("1000");
  const [payer, setPayer] = useState("237690000001");
  const [externalId, setExternalId] = useState(`demo-${Date.now()}`);
  const [businessName, setBusinessName] = useState(user?.fullName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Marchand");
  const [phone, setPhone] = useState("237690000001");
  const [statusMessage, setStatusMessage] = useState("Prêt à initier un paiement de test.");

  const isAdmin = isAdminEmail(user?.emailAddresses?.[0]?.emailAddress);
  const { data: merchant, refetch: refetchMerchant } = trpc.merchants.me.useQuery(undefined, { enabled: !!user });
  const { data: transactions = [], refetch } = trpc.payments.list.useQuery(undefined, { enabled: !!merchant });
  const initiateMutation = trpc.payments.initiate.useMutation({
    onSuccess: async () => {
      await refetch();
      setStatusMessage("Paiement initié avec succès. Vérifiez le statut dans la liste ci-dessous.");
    },
    onError: (error) => {
      setStatusMessage(error.message || "Erreur lors de l’initialisation du paiement.");
    },
  });

  const onboardMutation = trpc.merchants.onboard.useMutation({
    onSuccess: async () => {
      await refetchMerchant();
      setStatusMessage("Compte marchand créé avec succès. Vous pouvez commencer à initier des paiements.");
    },
    onError: (error) => {
      setStatusMessage(error.message || "Impossible de créer le compte marchand.");
    },
  });

  const summary = useMemo(() => {
    const successful = transactions.filter((tx: TransactionItem) => tx.status === "SUCCESSFUL").length;
    const pending = transactions.filter((tx: TransactionItem) => tx.status === "PENDING").length;
    return { successful, pending };
  }, [transactions]);

  if (!isLoaded) return <div className="flex min-h-screen items-center justify-center">Chargement...</div>;
  if (!user) {
    router.replace("/signin");
    return null;
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setStatusMessage("Le montant doit être supérieur à 0.");
      return;
    }

    if (!merchant) {
      setStatusMessage("Veuillez d’abord finaliser l’onboarding marchand.");
      return;
    }

    initiateMutation.mutate({
      amount: numericAmount,
      payerMsisdn: payer,
      externalId,
      currency: "XAF",
    });
  };

  const handleOnboard = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onboardMutation.mutate({ businessName, phone });
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <header className="border-b border-border bg-surface px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-money">{isAdmin ? "Espace administrateur" : "Espace marchand"}</p>
            <h1 className="text-xl font-semibold">Bienvenue {merchant?.businessName || user.emailAddresses[0]?.emailAddress}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="border border-border bg-canvas px-3 py-2 text-sm font-semibold">Accueil</Link>
            <SignOutButton>
              <button className="bg-orange-money px-3 py-2 text-sm font-semibold text-white">
                Déconnexion
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 lg:px-10">
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="border border-border bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mtn-yellow">Intégrateur de paiement</p>
            <h2 className="mt-2 text-2xl font-semibold">Initier un paiement de test</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Ce formulaire simule le comportement d’un intégrateur : vous pouvez tester des montants, des numéros de client et suivre l’état du paiement.
            </p>

            {!merchant ? (
              <form onSubmit={handleOnboard} className="mt-6 space-y-4 border border-dashed border-border bg-canvas p-4">
                <p className="text-sm font-semibold">Créer votre compte marchand</p>
                <div>
                  <label className="mb-1 block text-sm font-medium">Nom de l’entreprise</label>
                  <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full border border-border bg-white px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Téléphone marchand</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-border bg-white px-3 py-2 text-sm outline-none" />
                </div>
                <button type="submit" className="w-full border border-border bg-surface px-4 py-2.5 text-sm font-semibold">
                  Finaliser l’onboarding
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Montant (XAF)</label>
                  <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border border-border bg-canvas px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Numéro du payeur</label>
                  <input value={payer} onChange={(e) => setPayer(e.target.value)} className="w-full border border-border bg-canvas px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Identifiant externe</label>
                  <input value={externalId} onChange={(e) => setExternalId(e.target.value)} className="w-full border border-border bg-canvas px-3 py-2 text-sm outline-none" />
                </div>
                <button type="submit" className="w-full bg-orange-money px-4 py-2.5 text-sm font-semibold text-white">
                  Initier le paiement
                </button>
              </form>
            )}

            <div className="mt-4 border border-dashed border-border bg-canvas p-4 text-sm text-text-secondary">
              {statusMessage}
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-border bg-surface p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary">Vue d’ensemble</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="border border-border bg-canvas p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-text-secondary">Réussis</p>
                  <p className="mt-1 text-2xl font-semibold">{summary.successful}</p>
                </div>
                <div className="border border-border bg-canvas p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-text-secondary">En attente</p>
                  <p className="mt-1 text-2xl font-semibold">{summary.pending}</p>
                </div>
              </div>
            </div>

            <div className="border border-border bg-surface p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary">Transactions récentes</p>
              <div className="mt-4 space-y-3">
                {transactions.map((tx: TransactionItem) => (
                  <div key={tx.id} className="border border-border bg-canvas p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{tx.amount} {tx.currency}</p>
                      <span className="border border-border px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-text-secondary">{tx.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">{tx.operator === "ORANGE_MONEY" ? "Orange Money" : "MTN MoMo"}</p>
                    <p className="mt-1 text-xs text-text-secondary">{tx.payerMsisdn}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
