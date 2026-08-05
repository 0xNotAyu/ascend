import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Start turning your intentions into consistent action."
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
