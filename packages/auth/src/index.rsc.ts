import { cache } from "react";

export {
  auth,
  isSecureContext,
  validateToken,
  invalidateSessionToken,
  signIn,
  signOut,
} from "./index";
export type { Session } from "./index";

import { getSession as _getSession } from "./index";

// Deduplicates getSession calls per request via React cache
export const getSession = cache(_getSession);
