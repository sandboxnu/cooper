"use client";

import Image from "next/image";

import type { RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardHeader } from "@cooper/ui/card";

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
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#C5C5C5]"
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
          <CardHeader className="space-y-0.5 ">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold leading-tight">
                {role.data?.title}
              </h3>
              <span className="text-base font-normal text-[#999999]">
                Co-op
              </span>
            </div>
            <div className="flex items-center gap-2 text-base text-[#666666]">
              {company.data?.name}
              {location.isSuccess && location.data && (
                <span className="before:content-['•'] before:mr-2">
                  {prettyLocationName(location.data)}
                </span>
              )}
            </div>
            {reviews.isSuccess && reviews.data.length > 0 && (
              <div className="flex items-center gap-1.5 text-base text-[#666666]">
                <Image
                  src="/svg/star.svg"
                  alt="Star icon"
                  width={18}
                  height={18}
                />
                <span className="font-medium">
                  {Math.round(
                    Number(averages.data?.averageOverallRating) * 100,
                  ) / 100}
                </span>
                <span>
                  ({reviews.data.length}+ review
                  {reviews.data.length === 1 ? "" : "s"})
                </span>
              </div>
            )}
          </CardHeader>
        </div>
        {showFavorite && <FavoriteButton objId={roleObj.id} objType="role" />}
      </div>
    </Card>
  );
}
