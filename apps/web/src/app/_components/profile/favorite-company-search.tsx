"use client";
import { CompanyType } from "@cooper/db/schema";
import { Input } from "../themed/onboarding/input";
import { useState } from "react";
import { CompanyCardPreview } from "../companies/company-card-preview";

export default function FavoriteCompanySearch({
  favoriteCompanies,
}: {
  favoriteCompanies: (CompanyType | undefined)[];
}) {
  const [companyLabel, setCompanyLabel] = useState<string>("");

  const prefixedCompanies = companyLabel
    ? favoriteCompanies.filter(
        (company) =>
          company?.name.substring(0, companyLabel.length).toLowerCase() ===
          companyLabel.toLowerCase(),
      )
    : favoriteCompanies;
  return (
    <div>
      <article className="w-[40%] pl-1 pb-8">
        <Input
          variant="dialogue"
          onChange={(e) => {
            setCompanyLabel(e.target.value);
          }}
          className="w-full"
          placeholder="Search for a saved company..."
        />
      </article>
      <div className="mx-1 flex-col gap-4 grid grid-cols-3 pb-4">
        {prefixedCompanies.length > 0 ? (
          prefixedCompanies
            .filter(
              (company): company is NonNullable<typeof company> =>
                company !== undefined,
            )
            .map((company) => <CompanyCardPreview companyObj={company} />)
        ) : (
          <p className="italic text-cooper-gray-400">
            No saved companies found.
          </p>
        )}
      </div>
    </div>
  );
}
