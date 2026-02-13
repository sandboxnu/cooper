"use client";

import type { CompanyType } from "@cooper/db/schema";

interface CompanyAboutProps {
  className?: string;
  companyObj: CompanyType | undefined;
}

export function CompanyAbout({ companyObj }: CompanyAboutProps) {
  return (
    <div className="mx-1 w-full pb-4 text-sm sm:pb-0">
      <div className="font-bold text-cooper-gray-400">
        About {companyObj?.name}
      </div>
      <div className="overflow-y-auto rounded-b-lg pt-2">
        <p>{companyObj?.description}</p>
      </div>
    </div>
  );
}
