"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { trpc } from "@/lib/trpc-client";
import { isAdminEmail } from "@/lib/auth";
import { 
  Loader2, 
  ArrowRight, 
  Activity, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Smartphone, 
  Send, 
  AlertTriangle,
  History,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard
} from "lucide-react";

type TransactionItem = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  operator: string;
  payerMsisdn: string;
  createdAt: Date | string;
};

type DocumentItem = {
  id: string;
  type: string;
  name: string;
  status: string;
  rejectionReason: string | null;
};

function MerchantDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  // Tab & Pagination gérés par paramètres d'URL
  const activeTab = searchParams.get("tab") || "initiate";
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const [amount, setAmount] = useState("1000");
  const [payer, setPayer] = useState("237690000001");
  const [statusMessage, setStatusMessage] = useState("Prêt à initier un paiement de test.");

  const isAdmin = isAdminEmail(user?.emailAddresses?.[0]?.emailAddress);
  
  // Refetch l'état du marchand toutes les 3s pour détecter instantanément la validation admin
  const { data: merchant, isLoading: isMerchantLoading } = trpc.merchants.me.useQuery(
    undefined, 
    { enabled: !!user, refetchInterval: 3000 }
  );

  // Vérifier si le compte est actif (soit statut ACTIVE soit tous les documents APPROVED par l'admin)
  const isAccountActive = useMemo(() => {
    if (!merchant) return false;
    if (merchant.status === "ACTIVE") return true;
    if (merchant.documents && merchant.documents.length > 0 && merchant.documents.every((d: DocumentItem) => d.status === "APPROVED")) {
      return true;
    }
    return false;
  }, [merchant]);

  // Requête trPC paginée (10 éléments par page)
  const { data: transactionsData, refetch } = trpc.payments.list.useQuery(
    { page: currentPage, limit: 10 },
    { enabled: !!merchant && isAccountActive, refetchInterval: 4000 }
  );

  const transactions = transactionsData?.items || [];
  const totalPages = transactionsData?.totalPages || 1;
  const totalCount = transactionsData?.totalCount || 0;

  const initiateMutation = trpc.payments.initiate.useMutation({
    onSuccess: async () => {
      await refetch();
      setStatusMessage("Paiement initié avec succès. Vérifiez le statut dans l'historique.");
    },
    onError: (error) => {
      setStatusMessage(error.message || "Erreur lors de l’initialisation du paiement.");
    },
  });

  const summary = useMemo(() => {
    const successful = transactions.filter((tx: TransactionItem) => tx.status === "SUCCESSFUL").length;
    const pending = transactions.filter((tx: TransactionItem) => tx.status === "PENDING").length;
    return { successful, pending };
  }, [transactions]);

  useEffect(() => {
    if (!isMerchantLoading && merchant === null) {
      router.replace("/onboarding");
    }
  }, [isMerchantLoading, merchant, router]);

  const setUrlParams = (newTab: string, newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  if (!isLoaded || isMerchantLoading || merchant === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.replace("/signin");
    return null;
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAccountActive) {
      setStatusMessage("Votre compte doit être validé par l'administrateur pour initier des paiements.");
      return;
    }
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setStatusMessage("Le montant doit être supérieur à 0.");
      return;
    }

    const cleanedPayer = payer.replace(/\D/g, "");
    if (cleanedPayer.length < 9) {
      setStatusMessage("Veuillez saisir un numéro de téléphone à 9 chiffres valide.");
      return;
    }

    const fullPayerMsisdn = cleanedPayer.startsWith("237") ? cleanedPayer : `237${cleanedPayer}`;
    const autoExternalId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    initiateMutation.mutate({
      amount: numericAmount,
      payerMsisdn: fullPayerMsisdn,
      externalId: autoExternalId,
      currency: "XAF",
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfcfb] flex flex-col font-sans text-slate-800">
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 shadow-sm sticky top-0 z-10 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600">{isAdmin ? "Admin" : "Marchand"}</p>
                {merchant.username && (
                  <span className="font-mono text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <User className="w-3 h-3 text-amber-500" />
                    @{merchant.username}
                  </span>
                )}
              </div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">{merchant.businessName}</h1>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link href="/admin" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-4 py-2 text-xs font-bold rounded-xl transition-colors">
                Console Admin
              </Link>
            )}
            <Link href="/" className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 px-4 py-2 text-xs font-bold rounded-xl transition-colors">
              Accueil
            </Link>
            <SignOutButton>
              <button className="bg-slate-900 hover:bg-orange-600 text-white px-4 py-2 text-xs font-bold rounded-xl transition-colors">
                Déconnexion
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Banner statut (Si non actif) */}
        {!isAccountActive && merchant.documents && (
          <section className="bg-white rounded-2xl shadow-sm border border-amber-200/90 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="p-6">
              <div className="flex items-start gap-3.5 mb-5">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-200">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Validation du compte en cours</h2>
                  <p className="text-slate-500 text-xs mt-0.5 max-w-2xl leading-relaxed">
                    Votre dossier est en cours de vérification par l'administrateur. Dès que vos pièces justificatives seront approuvées dans la console admin, le formulaire de paiement ci-dessous s'activera automatiquement.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                {merchant.documents.map((doc: DocumentItem) => (
                  <div key={doc.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{doc.type}</span>
                      {doc.status === "PENDING" && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">En cours</span>}
                      {doc.status === "APPROVED" && <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Validé</span>}
                      {doc.status === "REJECTED" && <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">Rejeté</span>}
                    </div>
                    <p className="font-semibold text-slate-800 truncate">{doc.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tab Header Navigation Notion Style */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUrlParams("initiate", 1)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                activeTab === "initiate"
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200/80 hover:bg-amber-50/50 hover:border-amber-200"
              }`}
            >
              <CreditCard className="w-4 h-4 text-amber-500" />
              Initier un paiement
            </button>
            <button
              onClick={() => setUrlParams("history", 1)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                activeTab === "history"
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200/80 hover:bg-amber-50/50 hover:border-amber-200"
              }`}
            >
              <History className="w-4 h-4 text-amber-500" />
              Historique des transactions ({totalCount})
            </button>
          </div>
        </div>

        {/* ── TAB 1: INITIER UN PAIEMENT ── */}
        {activeTab === "initiate" && (
          <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-1.5">
                <Smartphone className="w-4 h-4 text-amber-500" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Intégrateur de paiement</p>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Formulaire de test API</h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed mb-6">
                Simulez une requête de paiement directement vers l'API unifiée Orange Money / MTN MoMo.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                {!isAccountActive && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl text-xs leading-relaxed flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Formulaire verrouillé (Compte en attente)</p>
                      <p className="mt-0.5 text-amber-800">
                        Les champs ci-dessous se débloquent automatiquement dès que l'administrateur aura validé votre dossier.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Montant (XAF)</label>
                  <input 
                    type="number"
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    disabled={!isAccountActive || initiateMutation.isPending}
                    placeholder="Ex: 1000"
                    className="w-full border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs outline-none transition-all font-medium disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Numéro du payeur (Orange / MTN)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-bold text-xs text-slate-700 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">
                      +237
                    </span>
                    <input 
                      type="text"
                      value={payer.replace(/^237/, "")} 
                      onChange={(e) => setPayer(e.target.value.replace(/\D/g, "").slice(0, 9))} 
                      disabled={!isAccountActive || initiateMutation.isPending}
                      placeholder="690000001"
                      className="w-full border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl pl-16 pr-3 py-2.5 text-slate-900 text-xs outline-none transition-all font-medium disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed" 
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Saisissez votre numéro à 9 chiffres sans l'indicatif +237</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">ID de transaction</span>
                  <span className="font-mono text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                    Auto-généré à la soumission
                  </span>
                </div>

                <button 
                  type="submit" 
                  disabled={!isAccountActive || initiateMutation.isPending}
                  className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-xs"
                >
                  {initiateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Initier le paiement
                </button>
              </form>

              <div className={`mt-5 rounded-xl p-3 text-xs font-medium flex items-start gap-2.5 ${!isAccountActive ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                {!isAccountActive ? <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" /> : <Activity className="w-4 h-4 flex-shrink-0 text-amber-500" />}
                {statusMessage}
              </div>
            </div>

            <div className="space-y-5">
              {/* Vue d'ensemble */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Aperçu rapide</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">Réussis</p>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">{summary.successful}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">En attente</p>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900">{summary.pending}</p>
                  </div>
                </div>
              </div>

              {/* Transactions récentes aperçu */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dernières opérations</h3>
                  <button 
                    onClick={() => setUrlParams("history", 1)} 
                    className="text-amber-700 hover:underline text-xs font-semibold"
                  >
                    Voir tout ({totalCount})
                  </button>
                </div>
                
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-400">Aucune transaction récente.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {transactions.slice(0, 4).map((tx: TransactionItem) => (
                      <div key={tx.id} className="border border-slate-100 rounded-xl p-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{tx.amount.toLocaleString('fr-FR')} {tx.currency}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{tx.operator === "ORANGE_MONEY" ? "Orange Money" : "MTN MoMo"} • {tx.payerMsisdn}</p>
                        </div>
                        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          tx.status === 'SUCCESSFUL' ? 'bg-emerald-100 text-emerald-800' :
                          tx.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── TAB 2: HISTORIQUE DES TRANSACTIONS (AVEC PAGINATION 10/PAGE VIA URL) ── */}
        {activeTab === "history" && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Historique des Transactions</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Page {currentPage} sur {totalPages} • Total: {totalCount} transactions enregistrées
                </p>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="py-16 text-center">
                <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">Aucune transaction trouvée</p>
                <p className="text-slate-400 text-xs mt-1">Initiez un paiement de test pour alimenter l'historique.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3.5">Montant</th>
                      <th className="px-5 py-3.5">Opérateur</th>
                      <th className="px-5 py-3.5">Payeur</th>
                      <th className="px-5 py-3.5">Statut</th>
                      <th className="px-5 py-3.5 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx: TransactionItem) => (
                      <tr key={tx.id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900">
                          {tx.amount.toLocaleString('fr-FR')} {tx.currency}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                            <span className={`w-2 h-2 rounded-full ${tx.operator === 'ORANGE_MONEY' ? 'bg-orange-500' : 'bg-yellow-400'}`} />
                            {tx.operator === "ORANGE_MONEY" ? "Orange Money" : "MTN MoMo"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-600">
                          +{tx.payerMsisdn}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            tx.status === 'SUCCESSFUL' ? 'bg-emerald-100 text-emerald-800' :
                            tx.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-slate-400 font-medium">
                          {new Date(tx.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls Notion Style */}
            {totalPages > 1 && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs">
                <p className="text-slate-500 font-medium">
                  Affichage {((currentPage - 1) * 10) + 1} à {Math.min(currentPage * 10, totalCount)} sur {totalCount}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUrlParams("history", currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Précédent
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setUrlParams("history", p)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                          p === currentPage
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setUrlParams("history", currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-1"
                  >
                    Suivant <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default function MerchantPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    }>
      <MerchantDashboardContent />
    </Suspense>
  );
}
