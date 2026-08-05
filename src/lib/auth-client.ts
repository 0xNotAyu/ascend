import { createAuthClient } from "better-auth/react";

// The browser client uses the current site origin by default. Do not import the
// server environment validator here: private environment variables are not
// available in browser bundles.
export const authClient = createAuthClient();
