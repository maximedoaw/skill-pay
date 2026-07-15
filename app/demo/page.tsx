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
    <div className="min-h-screen bg-canvas text-text-primary">
      <header className="border-b border-border px-4 py-6 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Démo sûre
            </p>
            <h1 className="text-2xl font-semibold">Tester SkillPay sans risque</h1>
          </div>
          <Link href="/" className="border border-border px-4 py-2 text-sm font-medium">
            Retour à l’accueil
          </Link>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 lg:px-10">
        <section className="border border-border bg-surface p-6 sm:p-8">
          <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
            Cette démo montre le comportement attendu du flux sans déclencher de vrai paiement
            ni de transaction bancaire. Elle est idéale pour valider l’UX, le suivi de statut
            et la logique de confirmation.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {sampleSteps.map((step) => (
              <div key={step.title} className="border border-border bg-canvas p-4">
                <h2 className="text-sm font-semibold">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 border border-border bg-surface p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Numéros de test suggérés</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {sampleNumbers.map((item) => (
              <div key={item.label} className="border border-border bg-canvas p-4">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-2 font-mono text-sm text-text-secondary">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded border border-dashed border-border p-4 text-sm text-text-secondary">
            Astuce : utilisez un montant faible comme 1000 XAF et un identifiant externe simple,
            puis suivez l’évolution du statut jusqu’à la confirmation.
          </div>
        </section>
      </main>
    </div>
  );
}
