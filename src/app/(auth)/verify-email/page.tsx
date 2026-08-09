import { AuthShell } from "@/features/auth/auth-shell";
import { VerifyEmailPanel } from "@/features/auth/verify-email-panel";
export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="Verify your email"
      description="One small step before you begin."
    >
      <VerifyEmailPanel />
    </AuthShell>
  );
}
