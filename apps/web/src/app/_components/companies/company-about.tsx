"use client";

import type { CompanyType } from "@cooper/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";

interface CompanyAboutProps {
  className?: string;
  companyObj: CompanyType | undefined;
}

export function CompanyAbout({ companyObj }: CompanyAboutProps) {
  return (
    <Card className="mx-1 w-full max-w-lg rounded-xl border-gray-300 outline outline-1 outline-[#474747]">
      <CardHeader className="flex h-6 justify-center border-b border-[#474747] bg-[#F7F7F7]">
        <CardTitle className="text-base font-medium text-gray-800">
          About {companyObj?.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6 flex items-start">
          <p>{companyObj?.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
