"use client";
import { trpc } from "@/lib/trpc-client";
import { OnboardingForm } from "@/components/onboarding-form";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: merchant, isLoading } = trpc.merchants.me.useQuery();

  if (isLoading) return <p>Chargement…</p>;
  if (!merchant) return <OnboardingForm />; // déclenche merchants.onboard au submit

  return <>{children}</>;
}