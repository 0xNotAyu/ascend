import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/lib/prisma";

console.log("Creating Better Auth...");
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),

  emailAndPassword: {
    enabled: true,
  },
});
console.log("Better Auth created");