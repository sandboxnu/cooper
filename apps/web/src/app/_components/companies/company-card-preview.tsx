"use client";
import type { CompanyType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";
import Logo from "@cooper/ui/logo";
import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { FavoriteButton } from "../shared/favorite-button";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CompanyCardPreviewProps {
  className?: string;
  companyObj: CompanyType;
}

export function CompanyCardPreview({
  companyObj,
  className,
}: CompanyCardPreviewProps) {
  const locations = api.companyToLocation.getLocationsByCompanyId.useQuery({
    companyId: companyObj.id,
  });

  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/companies/company?id=${companyObj.id}`);
  };

  const avg = api.company.getAverageById.useQuery({
    companyId: companyObj.id,
  });
  const reviews = api.review.getByCompany.useQuery({
    id: companyObj.id,
  });

  const averageRating =
    Math.round(Number(avg.data?.averageOverallRating) * 100) / 100;

  return (
    <Card
      className={cn(
        "flex flex-col justify-between rounded-lg outline outline-[0.75px] outline-cooper-gray-150 w-80",
        className,
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex space-x-4">
          <Logo className="min-h-full w-auto" company={companyObj} />
          <div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-start">
                <div className="w-full">
                  <CardTitle>
                    <div className="text-md flex w-full items-center justify-between gap-3 md:text-xl">
                      <div className="text-lg">{companyObj.name}</div>
                    </div>
                  </CardTitle>
                  <div className="align-center flex flex-wrap gap-2 text-cooper-gray-400">
                    {locations.data?.length && locations.data[0]?.location ? (
                      <>
                        <span>
                          {prettyLocationName(locations.data[0].location)}
                        </span>
                      </>
                    ) : (
                      <span>Location not specified</span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {averageRating !== 0 ? (
                <div className="align-center flex gap-2 text-cooper-gray-400">
                  <div className=" flex gap-1">
                    <Image
                      src="/svg/star.svg"
                      alt="Star icon"
                      width={20}
                      height={20}
                    />
                    <div>{averageRating}</div>
                  </div>
                  ({reviews.data?.length} reviews)
                </div>
              ) : (
                <div className="text-cooper-gray-400">No ratings yet</div>
              )}
            </CardContent>
          </div>
        </div>
        <span
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <FavoriteButton objId={companyObj.id} objType="company" />
        </span>
      </div>
    </Card>
  );
}
