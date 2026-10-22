export const RESTRICTED_ROLE_WORD_PATTERN =
  "\\b(?:internships?|interns?|co-?ops?)\\b";

export function findRestrictedRoleWord(title: string): string | null {
  return new RegExp(RESTRICTED_ROLE_WORD_PATTERN, "i").exec(title)?.[0] ?? null;
}
