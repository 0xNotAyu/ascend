// One-time setup: creates a MongoDB TTL index on `session.expiresAt` so
// expired sessions are deleted automatically by Mongo's background TTL
// monitor (runs roughly once a minute). Prisma's schema can't declare a
// TTL index directly (no `expireAfterSeconds` option in schema syntax),
// so this uses `$runCommandRaw` once, outside the normal Prisma flow.
//
// Run with:
//   npx tsx scripts/create-session-ttl-index.ts
//
// Safe to re-run — createIndexes is idempotent if the index already
// exists with the same options.

import { prisma } from "../src/lib/prisma";

async function main() {
  const result = await prisma.$runCommandRaw({
    createIndexes: "session",
    indexes: [
      {
        key: { expiresAt: 1 },
        name: "session_expiresAt_ttl",
        // expireAfterSeconds: 0 means "delete once the clock passes the
        // value already stored in this field" — expiresAt is already an
        // absolute timestamp, not a duration, so this is exactly right.
        expireAfterSeconds: 0,
      },
    ],
  });

  console.log("TTL index result:", result);
  console.log("Sessions will now self-delete once expiresAt has passed.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to create TTL index:", err);
    process.exit(1);
  });
