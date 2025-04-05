"use client";

import type { CompanyType } from "@cooper/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";

interface CompanyAboutProps {
  className?: string;
  companyObj: CompanyType | undefined;
}

export function CompanyAbout({ companyObj }: CompanyAboutProps) {
  return (
    <Card className="mx-1 w-full max-w-lg rounded-lg border-[0.75px] border-cooper-gray-400">
      <CardHeader className="flex h-6 justify-center rounded-t-lg border-b-[0.75px] border-cooper-gray-400 bg-cooper-gray-100">
        <CardTitle className="text-base font-medium text-gray-800">
          About {companyObj?.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="rounded-b-lg pt-6">
        <div className="mb-6 flex items-start">
          <p>{companyObj?.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
