import Image from "next/image";

import type { CompanyType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@cooper/ui/card";

interface CompanyCardPreviewProps {
  className?: string;
  companyObj: CompanyType;
}

export function CompanyCardPreview({
  className,
  companyObj,
}: CompanyCardPreviewProps) {
  return (
    <Card
      className={cn(
        "flex h-[26rem] w-[100%] flex-col justify-between overflow-hidden rounded-3xl border-black",
        className,
      )}
    >
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
              <p>{companyObj.industry}</p>
            </div>
            <div className="flex flex-col text-sm">
              <h4 className="font-semibold">DNE</h4>
              <p>{companyObj.location}</p>
            </div>
          </div>
          <div className="m-4 flex items-center space-x-4">
            <p className="text-sm">{companyObj.description}</p>
          </div>
        </CardContent>
      </div>
      <CardFooter className="items-end justify-end text-xs">
        {(companyObj.totalReviews ?? 0) + " Reviews"}
      </CardFooter>
    </Card>
  );
}
