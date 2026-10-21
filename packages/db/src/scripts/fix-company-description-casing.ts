/**
 * Data migration: lowercase the industry word inside auto-generated company
 * descriptions of the form "Company in {INDUSTRY} industry" (e.g. "Company in
 * HEALTHCARE industry" -> "Company in healthcare industry"). These were
 * created before the description generator started lowercasing the industry.
 * Only touches descriptions matching this exact placeholder pattern — hand
 * -written descriptions are left untouched.
 *
 * Usage (run from packages/db):
 *   pnpm fix-company-description-casing            # dry run – prints what WOULD change
 *   pnpm fix-company-description-casing --apply    # actually writes the changes
 */
import { eq } from "drizzle-orm";

import { db } from "../client";
import { Company } from "../schema";

const APPLY = process.argv.includes("--apply");

const PLACEHOLDER_RE = /^Company in (.+) industry$/;

async function main() {
  console.log(
    `\nFixing company description casing — ${APPLY ? "APPLY mode (writing changes)" : "DRY RUN (no changes written)"}\n`,
  );

  const companies = await db.query.Company.findMany({
    columns: { id: true, name: true, description: true },
  });

  let changed = 0;

  for (const company of companies) {
    if (!company.description) continue;

    const match = PLACEHOLDER_RE.exec(company.description);
    if (!match) continue;

    const industry = match[1];
    if (!industry || industry === industry.toLowerCase()) continue;

    const newDescription = `Company in ${industry.toLowerCase()} industry`;

    changed++;
    console.log(
      `  "${company.description}" -> "${newDescription}"  [company ${company.id} - ${company.name}]`,
    );

    if (APPLY) {
      await db
        .update(Company)
        .set({ description: newDescription })
        .where(eq(Company.id, company.id));
    }
  }

  console.log(
    `\nScanned ${companies.length} companies — ${changed} ${APPLY ? "updated" : "to update"}.`,
  );
  if (!APPLY && changed > 0) {
    console.log(`Re-run with --apply to write these changes.\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("fix-company-description-casing failed:", err);
    process.exit(1);
  });
