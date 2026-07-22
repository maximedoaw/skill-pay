"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { trpc } from "@/lib/trpc-client";
import { useUploadThing } from "@/lib/uploadthing";
import { Building2, FileText, CheckCircle, Check, X, ArrowLeft, ArrowRight, UploadCloud, FileCheck, ShieldCheck, Loader2 } from "lucide-react";

/* ─────────────────────── Types ─────────────────────── */
type UploadedDoc = { name: string; url: string; type: "cni" | "rccm" | "other" };

const STEPS = [
  { id: 1, label: "Entreprise", icon: Building2 },
  { id: 2, label: "Documents", icon: FileText },
  { id: 3, label: "Confirmation", icon: ShieldCheck },
];

/* ─────────────────────── Stepper Indicator ─────────────────────── */
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isCompleted = step.id < current;
        const isActive = step.id === current;
        
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-md ${
                  isCompleted
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-200"
                    : isActive
                    ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-orange-300 scale-110 ring-4 ring-orange-100"
                    : "bg-white text-gray-300 border-2 border-gray-100"
                }`}
              >
                {isCompleted ? <Check className="w-6 h-6" strokeWidth={3} /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={`text-xs font-bold tracking-wide uppercase transition-all ${
                  isActive ? "text-orange-600" : isCompleted ? "text-orange-400" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-1 w-16 mx-4 mb-6 rounded-full transition-all duration-500 ${
                  isCompleted ? "bg-gradient-to-r from-orange-500 to-orange-400" : "bg-gray-100"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────── Main Page ─────────────────────── */
export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("237");
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onboardMutation = trpc.merchants.onboard.useMutation({
    onSuccess: () => {
      setDone(true);
      setTimeout(() => router.push("/"), 2000);
    },
    onError: (e) => {
      setError(e.message);
      setSubmitting(false);
    },
  });

  const { startUpload } = useUploadThing("documentUploader", {
    onUploadError: (e) => {
      setError("Erreur d'upload : " + e.message);
      setUploadingType(null);
    },
  });

  const handleFileUpload = useCallback(
    async (files: FileList | null, type: "cni" | "rccm" | "other") => {
      if (!files || files.length === 0) return;
      setUploadingType(type);
      setError("");
      const uploaded = await startUpload(Array.from(files));
      if (uploaded && uploaded.length > 0) {
        setDocuments((prev) => [
          ...prev.filter((d) => d.type !== type),
          { name: files[0].name, url: uploaded[0].url, type },
        ]);
      }
      setUploadingType(null);
    },
    [startUpload]
  );

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    onboardMutation.mutate({
      businessName,
      phone,
      documents: documents.map(doc => ({ type: doc.type, name: doc.name, url: doc.url })),
    });
  };

  if (!isLoaded) {
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

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-orange-200 animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-gray-900">Demande soumise !</h2>
        <p className="text-gray-500 text-center max-w-md text-sm leading-relaxed">
          Votre dossier est en cours d'examen. Vous recevrez une notification dès que l'administrateur aura validé vos documents.
        </p>
        <button 
          onClick={() => router.push("/")} 
          className="bg-gray-900 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md"
        >
          Retourner à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              S
            </div>
            <span className="font-black text-gray-900 text-xl tracking-tight">SkillPay</span>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
              Onboarding
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
            <div className="h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />

            <div className="px-8 sm:px-12 py-10">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  {step === 1 && "Votre entreprise"}
                  {step === 2 && "Vos documents"}
                  {step === 3 && "Vérification finale"}
                </h1>
                <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
                  {step === 1 && "Renseignez les informations légales de votre activité pour configurer votre compte marchand."}
                  {step === 2 && "Fournissez les pièces justificatives requises pour la validation de votre identité professionnelle."}
                  {step === 3 && "Vérifiez attentivement les informations ci-dessous avant de soumettre définitivement votre dossier."}
                </p>
              </div>

              <StepIndicator current={step} />

              {/* ── STEP 1: Business Info ── */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-700">
                      Nom de l'entreprise <span className="text-orange-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Ex: TechVision SARL"
                        className="w-full border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-50 rounded-xl px-4 py-3.5 pl-12 text-gray-900 outline-none transition-all placeholder:text-gray-400 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-700">
                      Téléphone marchand <span className="text-orange-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold text-base bg-gray-100 px-2 py-1 rounded-md border border-gray-200">+237</span>
                      <input
                        type="text"
                        value={phone.replace(/^237/, "")}
                        onChange={(e) => setPhone("237" + e.target.value.replace(/\D/g, "").slice(0, 9))}
                        placeholder="690 000 000"
                        className="w-full border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-50 rounded-xl px-4 py-3.5 pl-[5.5rem] text-gray-900 outline-none transition-all placeholder:text-gray-400 font-medium tracking-wide"
                      />
                    </div>
                    <p className="text-xs text-gray-500 font-medium">9 chiffres requis après l'indicatif régional</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-3 text-red-600 text-sm">
                      <X className="w-5 h-5 shrink-0 mt-0.5" />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (!businessName.trim() || businessName.length < 2) {
                        setError("Le nom de l'entreprise doit comporter au moins 2 caractères.");
                        return;
                      }
                      if (!/^237[0-9]{9}$/.test(phone)) {
                        setError("Numéro de téléphone invalide. 9 chiffres sont attendus.");
                        return;
                      }
                      setError("");
                      setStep(2);
                    }}
                    className="w-full bg-gray-900 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-orange-200 flex items-center justify-center gap-2 group"
                  >
                    Étape suivante 
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {/* ── STEP 2: Documents ── */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {(
                    [
                      { key: "cni", label: "Pièce d'Identité (CNI / Passeport)", desc: "Document officiel en cours de validité" },
                      { key: "rccm", label: "Registre de Commerce (RCCM)", desc: "Copie de l'extrait d'immatriculation" },
                      { key: "other", label: "Document Additionnel", desc: "Plan de localisation ou Attestation fiscale" },
                    ] as { key: "cni" | "rccm" | "other"; label: string; desc: string }[]
                  ).map(({ key, label, desc }) => {
                    const uploaded = documents.find((d) => d.type === key);
                    const isUploading = uploadingType === key;
                    return (
                      <div
                        key={key}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(key); }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOver(null);
                          handleFileUpload(e.dataTransfer.files, key);
                        }}
                        className={`relative border-2 border-dashed rounded-2xl p-5 transition-all duration-200 cursor-pointer ${
                          dragOver === key
                            ? "border-orange-500 bg-orange-50 scale-[1.02]"
                            : uploaded
                            ? "border-green-500 bg-green-50/50 shadow-sm"
                            : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <label className="cursor-pointer block">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e.target.files, key)}
                            disabled={isUploading}
                          />
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                              uploaded ? "bg-green-100 text-green-600" : isUploading ? "bg-orange-100 text-orange-500" : "bg-gray-100 text-gray-500"
                            }`}>
                              {isUploading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                              ) : uploaded ? (
                                <FileCheck className="w-6 h-6" />
                              ) : (
                                <UploadCloud className="w-6 h-6" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-sm">{label}</p>
                              <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                              
                              {uploaded && (
                                <div className="flex items-center gap-1.5 mt-2 text-green-700 text-xs font-semibold bg-green-100 w-fit px-2 py-1 rounded-md">
                                  <Check className="w-3 h-3" />
                                  <span className="truncate max-w-[150px]">{uploaded.name}</span>
                                </div>
                              )}
                              {isUploading && (
                                <p className="text-orange-600 text-xs mt-2 font-medium flex items-center gap-1">
                                  Téléversement en cours...
                                </p>
                              )}
                              {!uploaded && !isUploading && (
                                <p className="text-gray-400 text-xs mt-2 font-medium">Glissez un fichier ou cliquez ici</p>
                              )}
                            </div>
                            
                            {uploaded && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setDocuments((prev) => prev.filter((d) => d.type !== key));
                                }}
                                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </label>
                      </div>
                    );
                  })}

                  <p className="text-xs text-center text-gray-400 font-medium py-2">
                    Au moins un document (CNI ou RCCM) est requis. Formats acceptés: PDF, JPG, PNG (Max 4 Mo)
                  </p>

                  {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-3 text-red-600 text-sm">
                      <X className="w-5 h-5 shrink-0 mt-0.5" />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={() => { setError(""); setStep(1); }}
                      className="px-6 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Retour
                    </button>
                    <button
                      onClick={() => {
                        if (!documents.some(d => d.type === 'cni' || d.type === 'rccm')) {
                          setError("Veuillez fournir au moins votre CNI ou votre RCCM.");
                          return;
                        }
                        setError("");
                        setStep(3);
                      }}
                      className="flex-1 bg-gray-900 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-orange-200 flex items-center justify-center gap-2 group"
                    >
                      Continuer
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Review & Submit ── */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-5">
                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      Récapitulatif du dossier
                    </h3>

                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-200 gap-1">
                        <span className="text-sm font-medium text-gray-500">Nom de l'entreprise</span>
                        <span className="font-bold text-gray-900 text-base">{businessName}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-200 gap-1">
                        <span className="text-sm font-medium text-gray-500">Numéro de téléphone</span>
                        <span className="font-bold text-gray-900 text-base">+{phone}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-200 gap-1">
                        <span className="text-sm font-medium text-gray-500">Email de contact</span>
                        <span className="font-bold text-gray-900 text-base truncate">
                          {user.emailAddresses[0]?.emailAddress}
                        </span>
                      </div>
                      
                      <div className="pt-2">
                        <span className="text-sm font-medium text-gray-500 block mb-3">Documents joints ({documents.length})</span>
                        <div className="space-y-2">
                          {documents.map((doc) => (
                            <div key={doc.type} className="flex items-center gap-3 text-sm bg-white border border-gray-200 p-2.5 rounded-lg shadow-sm">
                              <FileCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="font-semibold text-gray-800 truncate flex-1">{doc.name}</span>
                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                {doc.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-orange-900 text-sm mb-1">Processus de validation</p>
                      <p className="text-orange-700 text-xs leading-relaxed font-medium">
                        En soumettant ce dossier, vous certifiez l'exactitude des informations fournies. Notre équipe de conformité procédera à une vérification sous 24 à 48 heures ouvrées.
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-3 text-red-600 text-sm">
                      <X className="w-5 h-5 shrink-0 mt-0.5" />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={() => { setError(""); setStep(2); }}
                      className="px-6 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center gap-2"
                      disabled={submitting}
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Retour
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-70 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-200 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Traitement sécurisé...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5" />
                          Confirmer et Soumettre
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 font-medium mt-6">
            Sécurisé par l'infrastructure SkillPay • Protocole SSL 256 bits
          </p>
        </div>
      </main>
    </div>
  );
}
