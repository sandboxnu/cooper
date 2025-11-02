"use client";

import type { CompanyType } from "@cooper/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";

interface CompanyAboutProps {
  className?: string;
  companyObj: CompanyType | undefined;
}

export function CompanyAbout({ companyObj }: CompanyAboutProps) {
  return (
    <div className="mx-1 w-full">
      <div className="text-base font-semibold text-gray-800 ">
          About {companyObj?.name}
        </div>
      <div className="h-40 overflow-y-scroll rounded-b-lg pt-4">
        <p>{companyObj?.description}</p>
      </div>
    </div>
  );
}
