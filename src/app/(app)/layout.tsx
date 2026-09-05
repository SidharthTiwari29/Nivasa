import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getCurrentPlan } from "@/server/services/currentPlanService";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const plan = await getCurrentPlan(session.user.id);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="flex items-center justify-between border-b border-paper-raised px-6 py-4 md:px-10">
        <Link href="/properties" className="font-display text-lg font-semibold">
          Niwasthan
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/properties"
            className="font-body text-sm text-ink-soft transition-colors hover:text-ink"
          >
            Your homes
          </Link>
          <Link
            href="/catalogue"
            className="font-body text-sm text-ink-soft transition-colors hover:text-ink"
          >
            Catalogue
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-paper-raised px-3 py-1 font-mono text-xs text-ink-soft transition-colors hover:border-laterite hover:text-ink"
          >
            {plan.packageName}
            {plan.packageCode !== "FREE"
              ? ` · ${plan.creditsRemaining}/${plan.creditsTotal} credits`
              : ""}
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="font-body text-sm text-ink-soft transition-colors hover:text-ink"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10 md:px-10">{children}</main>
    </div>
  );
}
