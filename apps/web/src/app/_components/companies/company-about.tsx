"use client";

import type { CompanyType } from "@cooper/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";

interface CompanyAboutProps {
  className?: string;
  companyObj: CompanyType | undefined;
}

export function CompanyAbout({ companyObj }: CompanyAboutProps) {
  return (
    <>
      {" "}
      <Card className="w-full max-w-lg rounded-xl outline outline-[1px] outline-[#474747]">
        <CardHeader className="border-b border-[#474747] bg-[#F7F7F7] pb-3">
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
    </>
  );
}
