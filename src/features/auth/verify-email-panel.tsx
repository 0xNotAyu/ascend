"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function VerifyEmailPanel() {
  const email = useSearchParams().get("email") ?? "your email address";
  const [status, setStatus] = useState("");
  const [isPending, setIsPending] = useState(false);
  async function resend() {
    setIsPending(true);
    const result = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/today",
    });
    setIsPending(false);
    setStatus(
      result.error
        ? (result.error.message ?? "Unable to send verification email.")
        : "A new verification link has been sent.",
    );
  }
  return (
    <div className="grid gap-5 text-center">
      <p className="text-sm text-muted-foreground">
        We sent a verification link to{" "}
        <span className="font-medium text-foreground">{email}</span>. Open it to
        activate your account.
      </p>
      <Button variant="outline" onClick={resend} disabled={isPending}>
        {isPending ? "Sending…" : "Resend verification email"}
      </Button>
      {status && (
        <p role="status" className="text-sm text-muted-foreground">
          {status}
        </p>
      )}
      <Link href="/login" className="text-sm text-primary hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}
