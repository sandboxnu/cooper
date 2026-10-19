"use client";

import type { CompanyType } from "@cooper/db/schema";

interface CompanyAboutProps {
  className?: string;
  companyObj: CompanyType | undefined;
}

export function CompanyAbout({ companyObj }: CompanyAboutProps) {
  return (
    <div className="flex w-full flex-col gap-1 text-[16px] leading-6 tracking-[-0.16px]">
      <p className="font-bold text-cooper-gray-400">About {companyObj?.name}</p>
      <p className="text-cooper-gray-900">{companyObj?.description}</p>
    </div>
  );
}
