"use client";

import Image from "next/image";

import type { RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";

import { api } from "~/trpc/react";

interface RoleCardPreviewProps {
  className?: string;
  reviewObj: RoleType;
}

export function RoleCardPreview({
  className,
  reviewObj,
}: RoleCardPreviewProps) {
  // ===== COMPANY DATA ===== //
  const company = api.company.getById.useQuery({
    id: reviewObj.companyId,
  });

  // ===== ROLE DATA ===== //
  const role = api.role.getById.useQuery({ id: reviewObj.id });
  const reviews = api.review.getByRole.useQuery({ id: reviewObj.id });
  const averages = api.role.getAverageById.useQuery({
    roleId: role.data?.id ?? "",
  });

  return (
    <Card
      className={cn(
        "flex h-fit w-[100%] flex-col justify-between overflow-hidden rounded-xl outline outline-[1px] outline-[#474747]",
        className,
      )}
    >
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-start space-x-4">
            <div>
              <CardTitle>
                <div className="text-md flex items-center gap-3 md:text-xl">
                  <div>{role.data?.title}</div>
                  <div className="text-sm font-normal text-cooper-gray-400">
                    Co-op
                  </div>
                </div>
              </CardTitle>
              <div className="align-center flex gap-2 text-cooper-gray-400">
                <span>{company.data?.name}</span>
                {reviews.isSuccess && reviews.data.length > 0 && (
                  <span
                    className={`${reviews.data[0]?.location ? "visibility: visible" : "visibility: hidden"}`}
                  >
                    •
                  </span>
                )}
                {reviews.isSuccess && reviews.data.length > 0 && (
                  <span>{reviews.data[0]?.location}</span>
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
