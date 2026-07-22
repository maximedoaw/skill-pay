"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc-client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: merchant, isLoading } = trpc.merchants.me.useQuery();

  useEffect(() => {
    if (!isLoading && merchant === null) {
      router.replace("/onboarding");
    }
  }, [isLoading, merchant, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffaf3]">
        <div className="w-8 h-8 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!merchant) return null; // redirect in progress

  return <>{children}</>;
}