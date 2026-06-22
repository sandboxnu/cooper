/**
 * Data migration: strip the keywords "coop", "co-op", "intern", and
 * "internship" (case-insensitive) out of every role title, then regenerate
 * the role's slug from the cleaned title.
 *
 * Usage (run from packages/db):
 *   pnpm strip-role-keywords            # dry run – prints what WOULD change
 *   pnpm strip-role-keywords --apply    # actually writes the changes
 */
import { eq } from "drizzle-orm";

import { db } from "../client";
import { Role } from "../schema";

const APPLY = process.argv.includes("--apply");

const KEYWORD_RE = /\b(?:internship|intern|co-?op)\b/gi;

const EDGE_JUNK_RE = /^[\s\-/,&|·•:]+|[\s\-/,&|·•:]+$/g;

function stripKeywords(title: string): string {
  return title
    .replace(KEYWORD_RE, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(EDGE_JUNK_RE, "")
    .trim();
}

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: Set<string>,
): string {
  let slug = baseSlug;
  let counter = 2;
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

async function main() {
  console.log(
    `\nStripping role keywords — ${APPLY ? "APPLY mode (writing changes)" : "DRY RUN (no changes written)"}\n`,
  );

  const roles = await db.query.Role.findMany({
    columns: { id: true, title: true, slug: true, companyId: true },
  });

  // Track slugs already in use per company so regenerated slugs stay unique
  // within the company, accounting for both untouched and newly-written rows.
  const slugsByCompany = new Map<string, Set<string>>();
  for (const r of roles) {
    if (!slugsByCompany.has(r.companyId))
      slugsByCompany.set(r.companyId, new Set());
    slugsByCompany.get(r.companyId)?.add(r.slug);
  }

  let changed = 0;
  let skippedEmpty = 0;

  for (const role of roles) {
    const newTitle = stripKeywords(role.title);

    if (newTitle === role.title) continue;

    if (newTitle.length === 0) {
      skippedEmpty++;
      console.warn(
        `  ⚠️  SKIPPED (would be empty): "${role.title}"  [role ${role.id}]`,
      );
      continue;
    }

    const companySlugs = slugsByCompany.get(role.companyId);
    if (!companySlugs) {
      throw new Error(`Missing slug set for company ${role.companyId}`);
    }
    companySlugs.delete(role.slug);
    const newSlug = generateUniqueSlug(createSlug(newTitle), companySlugs);
    companySlugs.add(newSlug);

    changed++;
    console.log(
      `  "${role.title}" -> "${newTitle}"  (slug: ${role.slug} -> ${newSlug})`,
    );

    if (APPLY) {
      await db
        .update(Role)
        .set({ title: newTitle, slug: newSlug })
        .where(eq(Role.id, role.id));
    }
  }

  console.log(
    `\nScanned ${roles.length} roles — ${changed} ${APPLY ? "updated" : "to update"}${
      skippedEmpty ? `, ${skippedEmpty} skipped (would be empty)` : ""
    }.`,
  );
  if (!APPLY && changed > 0) {
    console.log(`Re-run with --apply to write these changes.\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("strip-role-keywords failed:", err);
    process.exit(1);
  });
