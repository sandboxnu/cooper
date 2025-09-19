"use client";

import Image from "next/image";

import type { RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";

import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { FavoriteButton } from "../shared/favorite-button";

interface RoleCardPreviewProps {
  className?: string;
  roleObj: RoleType;
}

export function RoleCardPreview({ className, roleObj }: RoleCardPreviewProps) {
  // ===== COMPANY DATA ===== //
  const company = api.company.getById.useQuery({
    id: roleObj.companyId,
  });

  // ===== ROLE DATA ===== //
  const role = api.role.getById.useQuery({ id: roleObj.id });
  const reviews = api.review.getByRole.useQuery({ id: roleObj.id });
  const averages = api.role.getAverageById.useQuery({
    roleId: role.data?.id ?? "",
  });

  const firstLocationId = reviews.data?.[0]?.locationId;
  const location = api.location.getById.useQuery(
    { id: firstLocationId ?? "" },
    {
      enabled: !!firstLocationId,
    },
  );

  return (
    <Card
      className={cn(
        "flex h-fit w-[100%] flex-col justify-between overflow-hidden rounded-lg outline outline-[0.75px] outline-cooper-gray-400",
        className,
      )}
    >
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-start space-x-4">
            <div className="w-full">
              <CardTitle>
                <div className="text-md flex w-full items-center justify-between gap-3 md:text-xl">
                  <div className="flex items-center gap-3">
                    <div>{role.data?.title}</div>
                    <div className="text-sm font-normal text-cooper-gray-400">
                      Co-op
                    </div>
                  </div>
                  <FavoriteButton objId={roleObj.id} objType="role" />
                </div>
              </CardTitle>
              <div className="align-center flex flex-wrap gap-2 text-cooper-gray-400">
                <span>{company.data?.name}</span>
                {location.isSuccess && location.data && (
                  <>
                    <span>•</span>
                    <span>{prettyLocationName(location.data)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2">
          {reviews.isSuccess &&
            reviews.data.length > 0 &&
            (() => {
              return (
                <div className="align-center flex gap-2 text-cooper-gray-400">
                  <Image
                    src="/svg/star.svg"
                    alt="Star icon"
                    width={20}
                    height={20}
                  />
                  {Math.round(
                    Number(averages.data?.averageOverallRating) * 100,
                  ) / 100}{" "}
                  ({reviews.data.length} reviews)
                </div>
              );
            })()}
        </CardContent>
      </div>
    </Card>
  );
}
