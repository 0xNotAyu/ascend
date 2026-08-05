"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const isSignUp = mode === "signup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    const result = isSignUp
      ? await authClient.signUp.email({
          name: String(data.get("name")),
          email,
          password,
        })
      : await authClient.signIn.email({ email, password });

    setIsPending(false);
    if (result.error) {
      setError(
        result.error.message ?? "Something went wrong. Please try again.",
      );
      return;
    }
    router.push(
      isSignUp
        ? `/verify-email?email=${encodeURIComponent(email)}`
        : "/dashboard",
    );
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      {isSignUp && <Field label="Name" name="name" autoComplete="name" />}
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          {!isSignUp && (
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? "Already have an account?" : "New to Ascend?"}{" "}
        <Link
          href={isSignUp ? "/login" : "/signup"}
          className="text-primary hover:underline"
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
      />
    </div>
  );
}
