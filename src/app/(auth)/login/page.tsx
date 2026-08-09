import { AuthForm } from "@/features/auth/auth-form";
import { AuthShell } from "@/features/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue building your momentum."
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
