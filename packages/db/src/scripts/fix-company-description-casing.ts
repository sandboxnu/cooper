/**
 * Data migration: fix auto-generated company descriptions of the form
 * "Company in {INDUSTRY} industry" (e.g. "Company in HEALTHCARE industry" ->
 * "Company in healthcare industry", "Company in FOODANDBEVERAGE industry" ->
 * "Company in food and beverage industry"). These were created before the
 * description generator started lowercasing the industry and spacing out
 * multi-word industry enum values. Only touches descriptions matching this
 * exact placeholder pattern — hand-written descriptions are left untouched.
 * The target industry word is derived from the company's `industry` column
 * (not parsed from the old description text), since that's the source of
 * truth.
 *
 * Usage (run from packages/db):
 *   pnpm fix-company-description-casing            # dry run – prints what WOULD change
 *   pnpm fix-company-description-casing --apply    # actually writes the changes
 */
import { eq } from "drizzle-orm";

import { db } from "../client";
import { Company } from "../schema";

const APPLY = process.argv.includes("--apply");

const PLACEHOLDER_RE = /^Company in .+ industry$/i;

// Mirrors the handful of multi-word Industry enum values (apps/web's
// `industryOptions`) whose raw value is concatenated and needs spacing out.
// Every other Industry value is already a single word, so `.toLowerCase()`
// on the raw value is sufficient.
const INDUSTRY_LABEL_OVERRIDES: Record<string, string> = {
  REALESTATE: "Real Estate",
  FASHIONANDBEAUTY: "Fashion and Beauty",
  FOODANDBEVERAGE: "Food and Beverage",
};

function describeIndustry(industry: string): string {
  const label = INDUSTRY_LABEL_OVERRIDES[industry] ?? industry;
  return `Company in ${label.toLowerCase()} industry`;
}

async function main() {
  console.log(
    `\nFixing company description casing — ${APPLY ? "APPLY mode (writing changes)" : "DRY RUN (no changes written)"}\n`,
  );

  const companies = await db.query.Company.findMany({
    columns: { id: true, name: true, description: true, industry: true },
  });

  let changed = 0;

  for (const company of companies) {
    if (!company.description) continue;
    if (!PLACEHOLDER_RE.test(company.description)) continue;

    const newDescription = describeIndustry(company.industry);
    if (newDescription === company.description) continue;

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
