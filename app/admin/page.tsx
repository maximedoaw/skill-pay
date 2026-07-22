"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { trpc } from "@/lib/trpc-client";
import { isAdminEmail } from "@/lib/auth";
import { 
  Loader2, 
  ExternalLink, 
  Check, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  LayoutDashboard, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  LayoutGrid, 
  Table2, 
  User,
  Building2,
  Key,
  Calendar,
  LogOut,
  Info
} from "lucide-react";

type DocumentItem = {
  id: string;
  type: string;
  name: string;
  url: string;
  status: string;
  rejectionReason: string | null;
};

type Merchant = {
  id: string;
  username?: string;
  businessName: string;
  phone: string;
  status: string;
  clerkUserId: string;
  createdAt: Date | string;
  apiKeyPublic: string;
  documents?: DocumentItem[];
};

/* ─────────── Status Badge ─────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200/80",
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    REJECTED: "bg-rose-50 text-rose-700 border-rose-200/80",
    SUSPENDED: "bg-slate-100 text-slate-600 border-slate-200",
  };
  const labels: Record<string, string> = {
    PENDING: "En attente",
    ACTIVE: "Actif",
    REJECTED: "Rejeté",
    SUSPENDED: "Suspendu",
  };
  const Icon = status === 'PENDING' ? Clock : status === 'ACTIVE' ? CheckCircle2 : XCircle;

  return (
    <span className={`inline-flex items-center gap-1.5 border text-xs font-semibold px-2.5 py-1 rounded-full ${map[status] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
      <Icon className="w-3.5 h-3.5" />
      {labels[status] || status}
    </span>
  );
}

/* ─────────── Merchant Card (Notion Style) ─────────── */
function MerchantCard({ merchant, onValidate, onReject, onDocValidate, onDocReject, loading }: {
  merchant: Merchant;
  onValidate: (id: string) => void;
  onReject: (id: string) => void;
  onDocValidate: (docId: string) => void;
  onDocReject: (docId: string, reason: string) => void;
  loading: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const createdDate = new Date(merchant.createdAt).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const allDocsApproved = merchant.documents && merchant.documents.length > 0 && merchant.documents.every(d => d.status === "APPROVED");

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-300/80 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Header Notion Card */}
      <div className="p-5 border-b border-slate-100 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
              {merchant.businessName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-base leading-snug">{merchant.businessName}</h3>
                {merchant.username && (
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                    <User className="w-3 h-3 text-amber-500" />
                    @{merchant.username}
                  </span>
                )}
              </div>
              <p className="text-slate-500 font-medium text-xs mt-0.5">+{merchant.phone}</p>
            </div>
          </div>
          <StatusBadge status={merchant.status} />
        </div>

        {/* Notion Key-Value Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100/80 text-xs">
          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-500" /> Inscription
            </p>
            <p className="font-medium text-slate-700 text-xs mt-0.5">{createdDate}</p>
          </div>
          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 flex items-center gap-1">
              <Key className="w-3 h-3 text-orange-500" /> Clé Publique
            </p>
            <p className="font-mono text-[11px] text-slate-600 truncate mt-0.5" title={merchant.apiKeyPublic}>
              {merchant.apiKeyPublic}
            </p>
          </div>
        </div>
      </div>

      {/* Accordéon Documents Notion */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-3 bg-slate-50/50 hover:bg-amber-50/60 transition-colors flex items-center justify-between border-b border-slate-100 text-xs font-semibold text-slate-700"
      >
        <span className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-500" />
          Pièces justificatives ({merchant.documents?.length || 0})
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="p-5 bg-white space-y-4 border-b border-slate-100 flex-1 animate-in fade-in duration-200">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Clerk User ID</p>
            <p className="text-xs font-mono text-slate-700 truncate" title={merchant.clerkUserId}>{merchant.clerkUserId}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              Documents soumis
            </h4>
            
            {merchant.documents && merchant.documents.length > 0 ? (
              <div className="space-y-2.5">
                {merchant.documents.map(doc => (
                  <div key={doc.id} className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/30 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-bold text-xs text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1.5 line-clamp-1">
                          {doc.name}
                          <ExternalLink className="w-3 h-3 text-amber-500" />
                        </a>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{doc.type}</p>
                      </div>
                      
                      {doc.status === "PENDING" && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">À vérifier</span>}
                      {doc.status === "APPROVED" && <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Validé</span>}
                      {doc.status === "REJECTED" && <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md">Rejeté</span>}
                    </div>

                    {doc.status === "REJECTED" && doc.rejectionReason && (
                      <div className="bg-rose-50 text-rose-700 text-xs p-2 rounded-lg font-medium border border-rose-100">
                        Motif : {doc.rejectionReason}
                      </div>
                    )}

                    {doc.status === "PENDING" && (
                      rejectingDocId === doc.id ? (
                        <div className="mt-2 space-y-2 animate-in fade-in">
                          <input 
                            type="text" 
                            placeholder="Raison du rejet..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full border border-rose-200 focus:border-rose-500 rounded-lg px-3 py-1.5 text-xs outline-none"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => setRejectingDocId(null)} className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold py-1 rounded-lg text-xs transition-colors">Annuler</button>
                            <button onClick={() => { onDocReject(doc.id, rejectReason); setRejectingDocId(null); setRejectReason(""); }} disabled={!rejectReason || loading === doc.id} className="flex-1 bg-rose-600 text-white hover:bg-rose-700 font-semibold py-1 rounded-lg text-xs transition-colors disabled:opacity-50">Confirmer Rejet</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => setRejectingDocId(doc.id)} disabled={loading === doc.id} className="flex-1 border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1">
                            <X className="w-3.5 h-3.5" /> Rejeter
                          </button>
                          <button onClick={() => onDocValidate(doc.id)} disabled={loading === doc.id} className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1">
                            {loading === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Approuver
                          </button>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium bg-slate-50 p-3 rounded-xl text-center border border-slate-100">Aucun document fourni</p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons Notion Style */}
      {merchant.status === "PENDING" && (
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-2.5 mt-auto">
          <button
            onClick={() => onReject(merchant.id)}
            disabled={loading === merchant.id}
            className="flex-1 border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 text-xs flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            Rejeter
          </button>
          <button
            onClick={() => onValidate(merchant.id)}
            disabled={loading === merchant.id || !allDocsApproved}
            title={!allDocsApproved ? "Approuvez d'abord tous les documents" : ""}
            className="flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-40 text-xs flex items-center justify-center gap-1.5"
          >
            {loading === merchant.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            Activer Marchand
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────── Merchant Table Row (Notion Style) ─────────── */
function MerchantTableRow({ merchant, onValidate, onReject, onDocValidate, onDocReject, loading }: {
  merchant: Merchant;
  onValidate: (id: string) => void;
  onReject: (id: string) => void;
  onDocValidate: (docId: string) => void;
  onDocReject: (docId: string, reason: string) => void;
  loading: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const allDocsApproved = merchant.documents && merchant.documents.length > 0 && merchant.documents.every(d => d.status === "APPROVED");

  return (
    <>
      <tr className="hover:bg-amber-50/30 transition-colors border-b border-slate-100 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {merchant.businessName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900 text-sm">{merchant.businessName}</p>
                {merchant.username && (
                  <span className="font-mono text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded">
                    @{merchant.username}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">+{merchant.phone}</p>
            </div>
          </div>
        </td>
        <td className="px-5 py-4 whitespace-nowrap">
          <StatusBadge status={merchant.status} />
        </td>
        <td className="px-5 py-4">
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md inline-flex items-center gap-1">
            <FileText className="w-3 h-3 text-amber-500" />
            {merchant.documents?.length || 0} doc(s) {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </span>
        </td>
        <td className="px-5 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-2">
            {merchant.status === "PENDING" && (
              <>
                <button
                  onClick={() => onReject(merchant.id)}
                  disabled={loading === merchant.id}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Rejeter"
                >
                  <XCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onValidate(merchant.id)}
                  disabled={loading === merchant.id || !allDocsApproved}
                  className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${allDocsApproved ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-300 cursor-not-allowed"}`}
                  title={!allDocsApproved ? "Approuver les docs d'abord" : "Activer"}
                >
                  {loading === merchant.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50/50">
          <td colSpan={4} className="px-6 py-4 border-b border-slate-100">
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Clerk ID</p>
                  <p className="font-mono text-slate-700 truncate">{merchant.clerkUserId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Clé Publique</p>
                  <p className="font-mono text-slate-700 truncate">{merchant.apiKeyPublic}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  Documents soumis
                </h4>
                {merchant.documents && merchant.documents.length > 0 ? (
                  <div className="space-y-2">
                    {merchant.documents.map(doc => (
                      <div key={doc.id} className="border border-slate-200/80 rounded-lg p-3 bg-slate-50/30 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-bold text-amber-700 hover:underline flex items-center gap-1">
                            {doc.name} <ExternalLink className="w-3 h-3 text-amber-500" />
                          </a>
                          <span className="text-[10px] text-slate-400 uppercase">({doc.type})</span>
                        </div>
                        <div>
                          {doc.status === "PENDING" && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">En attente</span>}
                          {doc.status === "APPROVED" && <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Validé</span>}
                          {doc.status === "REJECTED" && <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">Rejeté</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-medium">Aucun document fourni</p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ─────────── Admin Page (Notion Style) ─────────── */
export default function AdminPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [filter, setFilter] = useState<"PENDING" | "ACTIVE" | "REJECTED" | "ALL">("PENDING");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input by 350ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const utils = trpc.useUtils();

  const { data: merchants = [], isLoading } = trpc.merchants.list.useQuery(
    { status: filter, search: debouncedSearch || undefined },
    {
      enabled: isLoaded && isAdminEmail(user?.emailAddresses?.[0]?.emailAddress),
      refetchInterval: 4000,
    }
  );

  useEffect(() => {
    if (!isLoaded || !isAdminEmail(user?.emailAddresses?.[0]?.emailAddress)) return;
    const eventSource = new EventSource("/api/admin/stream");
    eventSource.onmessage = (event) => {
      if (event.data === "ping") return;
      utils.merchants.list.invalidate();
    };
    return () => eventSource.close();
  }, [isLoaded, user, utils]);

  const updateStatus = trpc.merchants.updateStatus.useMutation({
    onSuccess: (updated) => {
      setLoadingId(null);
      setNotification({
        msg: updated.status === "ACTIVE"
          ? `✅ ${updated.businessName} a été activé avec succès !`
          : `❌ ${updated.businessName} a été rejeté.`,
        type: updated.status === "ACTIVE" ? "success" : "error",
      });
      utils.merchants.list.invalidate();
      setTimeout(() => setNotification(null), 4000);
    },
    onError: (e) => {
      setLoadingId(null);
      setNotification({ msg: e.message, type: "error" });
      setTimeout(() => setNotification(null), 4000);
    },
  });

  const updateDocStatus = trpc.merchants.updateDocumentStatus.useMutation({
    onSuccess: () => {
      setLoadingId(null);
      utils.merchants.list.invalidate();
    },
    onError: (e) => {
      setLoadingId(null);
      setNotification({ msg: e.message, type: "error" });
      setTimeout(() => setNotification(null), 4000);
    },
  });

  const handleValidate = (merchantId: string) => {
    setLoadingId(merchantId);
    updateStatus.mutate({ merchantId, status: "ACTIVE" });
  };

  const handleReject = (merchantId: string) => {
    setLoadingId(merchantId);
    updateStatus.mutate({ merchantId, status: "REJECTED" });
  };

  const handleDocValidate = (documentId: string) => {
    setLoadingId(documentId);
    updateDocStatus.mutate({ documentId, status: "APPROVED" });
  };

  const handleDocReject = (documentId: string, reason: string) => {
    setLoadingId(documentId);
    updateDocStatus.mutate({ documentId, status: "REJECTED", rejectionReason: reason });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
      </div>
    );
  }

  // Guard: not admin
  if (!isAdminEmail(user?.emailAddresses?.[0]?.emailAddress)) {
    router.replace("/");
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-800 text-xl">Accès restreint</p>
          <p className="text-slate-500 text-xs font-medium">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  const pendingCount = merchants.filter(m => m.status === "PENDING").length;
  const activeCount = merchants.filter(m => m.status === "ACTIVE").length;
  const rejectedCount = merchants.filter(m => m.status === "REJECTED").length;

  const stats = {
    pending: pendingCount,
    active: activeCount,
    rejected: rejectedCount,
  };

  return (
    <div className="min-h-screen bg-[#fcfcfb] text-slate-800 font-sans">
      {/* Notification Toast Notion Style */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 max-w-sm rounded-xl px-4 py-3 shadow-lg text-xs font-semibold border transition-all animate-in fade-in slide-in-from-top-3 ${
            notification.type === "success"
              ? "bg-emerald-900 text-emerald-50 border-emerald-800"
              : "bg-rose-900 text-rose-50 border-rose-800"
          }`}
        >
          {notification.msg}
        </div>
      )}

      {/* Notion Top Bar Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              S
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base tracking-tight">SkillPay</span>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                Admin Console
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{user?.fullName || "Administrateur"}</p>
              <p className="text-[11px] text-slate-400">{user?.emailAddresses[0]?.emailAddress}</p>
            </div>
            <SignOutButton>
              <button className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 font-medium text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5">
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                Déconnexion
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title & Notion Callout Banner */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>Espace Gestion Marchands</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Validation & Onboarding</h1>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-slate-700 text-xs leading-relaxed">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Vérifiez la conformité des pièces justificatives fournies par les marchands pour autoriser leur accès à la plateforme et la génération des clés API.
            </p>
          </div>
        </div>

        {/* Stats Grid Notion */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => setFilter("PENDING")} 
            className={`bg-white border rounded-2xl p-4 shadow-sm transition-all cursor-pointer flex flex-col justify-between ${filter === "PENDING" ? "border-amber-400 ring-2 ring-amber-400/20" : "border-slate-200/80 hover:border-amber-300"}`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span className="flex items-center gap-1.5 text-amber-700">
                <Clock className="w-4 h-4 text-amber-500" /> En attente
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{isLoading ? "—" : stats.pending}</p>
          </div>

          <div 
            onClick={() => setFilter("ACTIVE")} 
            className={`bg-white border rounded-2xl p-4 shadow-sm transition-all cursor-pointer flex flex-col justify-between ${filter === "ACTIVE" ? "border-emerald-400 ring-2 ring-emerald-400/20" : "border-slate-200/80 hover:border-emerald-300"}`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Marchands actifs
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{isLoading ? "—" : stats.active}</p>
          </div>

          <div 
            onClick={() => setFilter("REJECTED")} 
            className={`bg-white border rounded-2xl p-4 shadow-sm transition-all cursor-pointer flex flex-col justify-between ${filter === "REJECTED" ? "border-rose-400 ring-2 ring-rose-400/20" : "border-slate-200/80 hover:border-rose-300"}`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span className="flex items-center gap-1.5 text-rose-700">
                <XCircle className="w-4 h-4 text-rose-500" /> Dossiers rejetés
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-400" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{isLoading ? "—" : stats.rejected}</p>
          </div>

          {/* Search Card Notion */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm flex flex-col justify-center">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, phone..."
                className="w-full border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none transition-all placeholder:text-slate-400 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* Filter Toolbar Notion Style */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {(["PENDING", "ACTIVE", "REJECTED", "ALL"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                  filter === f
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200/80 hover:bg-amber-50/50 hover:border-amber-200"
                }`}
              >
                {f === "PENDING" && <Clock className="w-3.5 h-3.5 text-amber-500" />}
                {f === "ACTIVE" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                {f === "REJECTED" && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                {f === "ALL" && <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />}
                {f === "PENDING" ? "En attente" : f === "ACTIVE" ? "Actifs" : f === "REJECTED" ? "Rejetés" : "Tous"}
              </button>
            ))}
          </div>

          <div className="flex bg-white rounded-xl border border-slate-200/80 p-1 shadow-sm shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
              title="Vue grille"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "table" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
              title="Vue tableau"
            >
              <Table2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Merchant Content Grid / Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="text-slate-500 font-medium text-xs">Chargement des dossiers...</p>
          </div>
        ) : merchants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-slate-200/80 border-dashed text-center">
            <Info className="w-10 h-10 text-slate-300" />
            <p className="text-base font-bold text-slate-800">Aucun marchand trouvé</p>
            <p className="text-slate-500 text-xs max-w-sm">
              {debouncedSearch 
                ? `Aucun résultat pour "${debouncedSearch}".` 
                : "La liste est actuellement vide pour ce filtre."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {merchants.map((merchant) => (
              <MerchantCard
                key={merchant.id}
                merchant={merchant as Merchant}
                onValidate={handleValidate}
                onReject={handleReject}
                onDocValidate={handleDocValidate}
                onDocReject={handleDocReject}
                loading={loadingId}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Marchand</th>
                    <th className="px-5 py-3.5">Statut</th>
                    <th className="px-5 py-3.5">Documents</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {merchants.map((merchant) => (
                    <MerchantTableRow
                      key={merchant.id}
                      merchant={merchant as Merchant}
                      onValidate={handleValidate}
                      onReject={handleReject}
                      onDocValidate={handleDocValidate}
                      onDocReject={handleDocReject}
                      loading={loadingId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
