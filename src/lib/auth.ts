import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";


export const auth = betterAuth({
  // Wired explicitly to env.ts (instead of letting better-auth read
  // process.env implicitly) so a missing/mismatched BETTER_AUTH_URL or
  // BETTER_AUTH_SECRET fails fast at boot instead of silently signing
  // sessions with a value that changes across restarts — that mismatch is
  // what makes sessions look like they "don't persist."
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.BETTER_AUTH_URL],

  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      // Replace this with an email provider (for example Resend) before production.
      console.info(`Password reset link for ${user.email}: ${url}`);
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // This makes the flow usable during local development without exposing a token to the browser.
      // Connect an email provider here before deploying.
      console.info(`Email verification link for ${user.email}: ${url}`);
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // refresh window daily on activity
  }
});
