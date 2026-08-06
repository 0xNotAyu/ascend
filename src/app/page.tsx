import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-6 text-center">
      <div className="max-w-2xl">
        <BrandLogo className="text-2xl" link={false} />
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
          Make progress, consistently.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          A personal system for the goals, habits, and focused work that move
          your life forward.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="inline-flex h-9 items-center rounded-md border bg-background px-3 text-sm font-medium hover:bg-muted"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
