"use client";

import { useRouter } from "next/navigation";

import type { CompanyType } from "@cooper/db/schema";

import { CompanyCardPreview } from "../companies/company-card-preview";
import { SAVED_CARD_WIDTH_CLASS, isInsideButton } from "./saved-card";

export default function FavoriteCompanySearch({
  favoriteCompanies,
}: {
  favoriteCompanies: (CompanyType | undefined)[];
}) {
  const router = useRouter();

  return (
    <div>
      {/* Search-result-width cards with the results' 8px gap, wrapping */}
      <div className="mx-1 flex flex-wrap gap-2 pb-4">
        {favoriteCompanies.length > 0 ? (
          favoriteCompanies
            .filter(
              (company): company is NonNullable<typeof company> =>
                company !== undefined,
            )
            .map((company) => (
              // Opens the company in the roles page results
              <div
                key={company.id}
                className={SAVED_CARD_WIDTH_CLASS}
                onClick={(event) => {
                  // The save button toggles the favorite without leaving
                  if (isInsideButton(event)) return;
                  router.push(`/roles/?company=${company.slug}&type=companies`);
                }}
              >
                <CompanyCardPreview companyObj={company} />
              </div>
            ))
        ) : (
          <p className="italic text-cooper-gray-400">
            No saved companies found.
          </p>
        )}
      </div>
    </div>
  );
}
