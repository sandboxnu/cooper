export const RESTRICTED_ROLE_WORD_PATTERN =
  "\\b(?:internships?|interns?|co-?ops?)\\b";

export function findRestrictedRoleWord(title: string): string | null {
  return new RegExp(RESTRICTED_ROLE_WORD_PATTERN, "i").exec(title)?.[0] ?? null;
}

// Real Google accounts are on husky.neu.edu; treat northeastern.edu as the same domain.
export function normalizeHuskyEmail(email: string): string {
  const trimmed = email.trim();
  return /@northeastern\.edu$/i.test(trimmed)
    ? trimmed.replace(/@northeastern\.edu$/i, "@husky.neu.edu")
    : trimmed;
}
