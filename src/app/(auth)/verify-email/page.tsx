import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailPanel } from "@/components/auth/verify-email-panel";
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
