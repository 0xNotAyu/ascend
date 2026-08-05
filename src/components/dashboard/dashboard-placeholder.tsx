"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardPlaceholder() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  async function signOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }
  const name = session?.user.name?.split(" ")[0] ?? "there";
  return (
    <main className="min-h-screen bg-muted/30">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <BrandLogo className="text-xl" />
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </header>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm font-medium text-primary">YOUR DASHBOARD</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Welcome, {name}.
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Your personal execution system is ready. Goals, habits, planning, and
          progress insights are coming next.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <PlaceholderCard
            title="Today’s focus"
            text="Choose the few actions that matter most."
          />
          <PlaceholderCard
            title="Current goals"
            text="Turn meaningful goals into clear next steps."
          />
          <PlaceholderCard
            title="Consistency"
            text="Build your systems one completed day at a time."
          />
        </div>
      </section>
    </main>
  );
}

function PlaceholderCard({ title, text }: { title: string; text: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{text}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-2 rounded-full bg-muted" />
      </CardContent>
    </Card>
  );
}
