// Used by packages/db/src/scripts/strip-role-keywords.ts to clean up
// existing role titles; no longer enforced on new role titles.
export const RESTRICTED_ROLE_WORD_PATTERN =
  "\\b(?:internships?|interns?|co-?ops?)\\b";

// Real Google accounts are on husky.neu.edu; treat northeastern.edu as the same domain.
export function normalizeHuskyEmail(email: string): string {
  const trimmed = email.trim();
  return /@northeastern\.edu$/i.test(trimmed)
    ? trimmed.replace(/@northeastern\.edu$/i, "@husky.neu.edu")
    : trimmed;
}
