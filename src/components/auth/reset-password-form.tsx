"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return setError("This reset link is invalid or has expired.");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (password !== String(form.get("confirmPassword")))
      return setError("Passwords do not match.");
    setError("");
    setIsPending(true);
    const result = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setIsPending(false);
    if (result.error)
      return setError(result.error.message ?? "Unable to reset your password.");
    router.push("/login?reset=success");
  }
  return (
    <form onSubmit={submit} className="grid gap-5">
      <PasswordField label="New password" name="password" />
      <PasswordField label="Confirm password" name="confirmPassword" />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button className="w-full" type="submit" disabled={isPending || !token}>
        {isPending ? "Saving…" : "Set new password"}
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
function PasswordField({ label, name }: { label: string; name: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type="password"
        minLength={8}
        autoComplete="new-password"
        required
      />
    </div>
  );
}
