import Image from "next/image";

import type { CompanyType } from "@cooper/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";

import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { prettyDescription, prettyIndustry } from "~/utils/stringHelpers";

interface CompanyCardPreviewProps {
  className?: string;
  companyObj: CompanyType;
}

export function CompanyCardPreview({ companyObj }: CompanyCardPreviewProps) {
  const locations = api.companyToLocation.getLocationsByCompanyId.useQuery({
    companyId: companyObj.id,
  });

  return (
    <Card className="flex h-[26rem] w-[100%] flex-col justify-between overflow-hidden rounded-3xl border-[0.75px] border-cooper-gray-400">
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-start space-x-4">
            <Image
              src={`https://logo.clearbit.com/${companyObj.name.replace(/\s/g, "")}.com`}
              width={75}
              height={75}
              alt={`Logo of ${companyObj.name}`}
              className="rounded-2xl border"
            />
            <div>
              <CardTitle className="text-xl">{companyObj.name}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid">
          <div className="m-4 flex items-center space-x-8">
            <div className="flex flex-col text-sm">
              <h4 className="font-semibold">Industry</h4>
              <p>{prettyIndustry(companyObj.industry)}</p>
            </div>
            <div className="flex flex-col text-sm">
              <h4 className="font-semibold">Location</h4>
              <p>
                {locations.data?.length && locations.data[0]?.location
                  ? prettyLocationName(locations.data[0].location)
                  : "Unknown"}
              </p>
            </div>
          </div>
          <div className="m-4 flex items-center space-x-4">
            <p className="text-sm">
              {prettyDescription(companyObj.description)}
            </p>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
