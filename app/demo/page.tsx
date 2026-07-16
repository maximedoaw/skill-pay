import Link from "next/link";

const sampleSteps = [
  {
    title: "1. Démarrer une transaction",
    description:
      "Choisissez un montant de test, un numéro de téléphone de démonstration et un identifiant externe. Aucun paiement réel n’est déclenché.",
  },
  {
    title: "2. Observer l’état",
    description:
      "Le flux passe par INITIATED, PENDING puis SUCCESSFUL ou FAILED selon la confirmation simulée.",
  },
  {
    title: "3. Vérifier la confirmation",
    description:
      "Le retour de statut est affiché comme dans un vrai scénario, sans impact sur un compte opérateur réel.",
  },
];

const sampleNumbers = [
  { label: "Orange Money", value: "237690000001" },
  { label: "MTN MoMo", value: "237650000001" },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <header className="border-b border-border bg-surface px-4 py-6 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-money">
              Démo sûre
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Tester SkillPay sans risque</h1>
          </div>
          <Link href="/" className="border border-border bg-canvas px-4 py-2 text-sm font-semibold text-text-primary">
            Retour à l’accueil
          </Link>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 lg:px-10">
        <section className="mx-auto max-w-6xl border border-border bg-surface p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-money">
                Parcours orienté produit
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Un flux de paiement visible, simple et sans risque</h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">
                Cette démo montre le comportement attendu du flux sans déclencher de vrai paiement
                ni de transaction bancaire. Elle est idéale pour valider l’UX, le suivi de statut
                et la logique de confirmation.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {sampleSteps.map((step) => (
                  <div key={step.title} className="border border-border bg-canvas p-3">
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-mtn-yellow/50 bg-[#fff8d9] p-5">
              <p className="text-sm font-semibold">Parcours recommandé</p>
              <div className="mt-4 space-y-3 text-sm text-text-secondary">
                <div className="border border-border bg-surface p-3">
                  <p className="font-semibold text-text-primary">1. Initialise un paiement</p>
                  <p className="mt-1">Choisissez 1000 XAF et un numéro de test.</p>
                </div>
                <div className="border border-border bg-surface p-3">
                  <p className="font-semibold text-text-primary">2. Vérifie l’état</p>
                  <p className="mt-1">Le statut passe par INITIATED puis PENDING.</p>
                </div>
                <div className="border border-border bg-surface p-3">
                  <p className="font-semibold text-text-primary">3. Valide la confirmation</p>
                  <p className="mt-1">La confirmation simule SUCCESSFUL ou FAILED sans risque.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 grid max-w-6xl gap-6 lg:grid-cols-2">
          <article className="border border-orange-money/40 bg-[linear-gradient(135deg,#fff7e8_0%,#ffffff_100%)] p-6">
            <h3 className="text-lg font-semibold">Orange Money</h3>
            <div className="mt-4 space-y-3">
              {sampleNumbers.filter((item) => item.label === "Orange Money").map((item) => (
                <div key={item.label} className="border border-border bg-surface p-4">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-2 font-mono text-sm text-text-secondary">{item.value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="border border-mtn-yellow/50 bg-[linear-gradient(135deg,#fffbe8_0%,#ffffff_100%)] p-6">
            <h3 className="text-lg font-semibold">MTN MoMo</h3>
            <div className="mt-4 space-y-3">
              {sampleNumbers.filter((item) => item.label === "MTN MoMo").map((item) => (
                <div key={item.label} className="border border-border bg-surface p-4">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-2 font-mono text-sm text-text-secondary">{item.value}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
