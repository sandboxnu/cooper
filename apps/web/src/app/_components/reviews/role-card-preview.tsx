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
  showDragHandle?: boolean;
  showFavorite?: boolean;
}

export function RoleCardPreview({
  className,
  roleObj,
  showDragHandle = false,
  showFavorite = true,
}: RoleCardPreviewProps) {
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
        "outline-cooper-gray-150 relative flex flex-col justify-between overflow-hidden rounded-lg outline outline-[0.75px]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        {showDragHandle && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              className="text-cooper-gray-400"
            >
              <circle cx="9" cy="5" r="1.5" fill="currentColor" />
              <circle cx="15" cy="5" r="1.5" fill="currentColor" />
              <circle cx="9" cy="10" r="1.5" fill="currentColor" />
              <circle cx="15" cy="10" r="1.5" fill="currentColor" />
              <circle cx="9" cy="15" r="1.5" fill="currentColor" />
              <circle cx="15" cy="15" r="1.5" fill="currentColor" />
              <circle cx="9" cy="20" r="1.5" fill="currentColor" />
              <circle cx="15" cy="20" r="1.5" fill="currentColor" />
            </svg>
          </div>
        )}
        <div className={cn("flex-1", showDragHandle && "pl-8")}>
          <CardHeader className="pb-1 pt-3">
            <div className="flex items-center justify-start space-x-4">
              <div className="w-full">
                <CardTitle>
                  <div className="text-md flex w-full items-center justify-between gap-3 md:text-xl">
                    <div className="flex items-center gap-3">
                      <div className="text-lg">{role.data?.title}</div>
                      <div className="text-sm font-normal text-cooper-gray-400">
                        Co-op
                      </div>
                    </div>
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
          <CardContent className="grid gap-2 pb-3">
            {reviews.isSuccess &&
              reviews.data.length > 0 &&
              (() => {
                return (
                  <div className="align-center flex gap-2 text-cooper-gray-400">
                    <div className="flex gap-1">
                      <Image
                        src="/svg/star.svg"
                        alt="Star icon"
                        width={20}
                        height={20}
                      />
                      <div>
                        {Math.round(
                          Number(averages.data?.averageOverallRating) * 100,
                        ) / 100}
                      </div>
                    </div>
                    ({reviews.data.length}{" "}
                    {reviews.data.length === 1 ? "review" : "reviews"})
                  </div>
                );
              })()}
          </CardContent>
        </div>
        {showFavorite && <FavoriteButton objId={roleObj.id} objType="role" />}
      </div>
    </Card>
  );
}
