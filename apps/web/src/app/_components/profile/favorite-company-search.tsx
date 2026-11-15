"use client";

import Link from "next/link";
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
      <div className="flex flex-wrap gap-2 pb-4">
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
          <div className="flex w-full flex-col items-center gap-3 pt-6">
            <p className="text-center text-cooper-gray-400">No saved companies</p>
            <Link href="/roles?type=companies" className="h-9 rounded-lg bg-cooper-gray-550 px-3 py-2 text-sm font-semibold text-white hover:bg-cooper-gray-600">
              Start searching
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
