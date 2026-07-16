"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#fff7e8_0%,#ffffff_100%)] px-4 py-10">
      <div className="w-full max-w-md border border-border bg-surface p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-money">Connexion marchand</p>
        <h1 className="mt-2 text-2xl font-semibold">Accéder à votre espace SkillPay</h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          Utilisez votre compte Clerk pour accéder à l’espace marchand et tester les paiements en base.
        </p>

        <div className="mt-6 flex justify-center">
          <SignIn
            signUpUrl="/signup"
            forceRedirectUrl="/"
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0",
                formButtonPrimary: "bg-orange-money text-white",
              },
            }}
          />
        </div>

        <p className="mt-4 text-sm text-text-secondary">
          Pas encore de compte ?
          <Link href="/signup" className="ml-2 font-semibold text-text-primary">
            Créer un compte marchand
          </Link>
        </p>
      </div>
    </div>
  );
}
