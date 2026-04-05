"use client";

import Image from "next/image";

import type { RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardHeader } from "@cooper/ui/card";

import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { FavoriteButton } from "../shared/favorite-button";
import { CompareControls } from "../compare/compare-ui";
import { useState } from "react";
import { useCompare } from "../compare/compare-context";

interface RoleCardPreviewProps {
  className?: string;
  roleObj: RoleType;
  showDragHandle?: boolean;
  showFavorite?: boolean;
  isAlreadyCompared?: boolean;
}

export function RoleCardPreview({
  className,
  roleObj,
  showDragHandle = false,
  showFavorite = true,
  isAlreadyCompared = false,
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

  const [hovered, setHovered] = useState(false);

  const compare = useCompare();

  return (
    <Card
      className={cn(
        "outline-cooper-gray-150 relative flex flex-col justify-between overflow-hidden rounded-lg outline outline-[0.75px] hover:cursor-pointer ",
        className,
        showDragHandle && "pl-4",
        compare.isCompareMode && "pr-2",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between space-x-3">
        {showDragHandle && (
          <div className="self-center px-2">
            <Image
              src="/svg/dragHandle.svg"
              alt="Drag handle icon"
              width={11.5}
              height={26.5}
            />
          </div>
        )}
        <div className={cn("flex-1")}>
          <CardHeader className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold leading-tight">
                {role.data?.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-base text-[#666666]">
              {company.data?.name}
              {location.isSuccess && location.data && (
                <span className="before:mr-2 before:content-['•']">
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
                  ({reviews.data.length} review
                  {reviews.data.length === 1 ? "" : "s"})
                </span>
              </div>
            )}
          </CardHeader>
        </div>

        {!compare.isCompareMode && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center justify-between h-[77px] w-4"
          >
            {showFavorite && (
              <FavoriteButton objId={roleObj.id} objType="role" />
            )}
            {hovered && (
              <CompareControls anchorRoleId={role.data?.id} iconOnly />
            )}
          </div>
        )}
        {compare.isCompareMode && hovered && !isAlreadyCompared && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              compare.addRoleId(roleObj.id);
            }}
            className="flex self-center"
          >
            <Image
              src="/svg/compareAdd.svg"
              width={24}
              height={24}
              alt="Add to compare"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
