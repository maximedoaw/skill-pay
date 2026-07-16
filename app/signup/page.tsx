"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#fff7e8_0%,#ffffff_100%)] px-4 py-10">
      <div className="w-full max-w-md border border-border bg-surface p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-mtn-yellow">Inscription marchand</p>
        <h1 className="mt-2 text-2xl font-semibold">Créer votre compte SkillPay</h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          Créez votre compte Clerk pour démarrer l’onboarding marchand et tester les paiements de bout en bout.
        </p>

        <div className="mt-6 flex justify-center">
          <SignUp
            signInUrl="/signin"
            forceRedirectUrl="/"
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0",
                formButtonPrimary: "bg-mtn-yellow text-text-primary",
              },
            }}
          />
        </div>

        <p className="mt-4 text-sm text-text-secondary">
          Déjà un compte ?
          <Link href="/signin" className="ml-2 font-semibold text-text-primary">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
