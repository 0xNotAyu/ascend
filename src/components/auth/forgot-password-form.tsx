"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);
    const email = String(new FormData(event.currentTarget).get("email"));
    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsPending(false);
    if (result.error)
      return setError(
        result.error.message ?? "Unable to request a reset link.",
      );
    setMessage(
      "If an account exists for that address, a reset link has been sent.",
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Sending…" : "Send reset link"}
      </Button>
      <Link
        href="/login"
        className="text-center text-sm text-primary hover:underline"
      >
        Back to sign in
      </Link>
    </form>
  );
}
