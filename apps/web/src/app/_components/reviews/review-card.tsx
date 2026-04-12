"use client";

import Image from "next/image";

import type { ReviewType, WorkEnvironmentType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent } from "@cooper/ui/card";

import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { prettyWorkEnviornment } from "~/utils/stringHelpers";
import { ReportButton } from "../shared/report-button";

interface ReviewCardProps {
  className?: string;
  reviewObj: ReviewType;
  isComparing?: boolean;
}

export function ReviewCard({
  reviewObj,
  className,
  isComparing,
}: ReviewCardProps) {
  const { data: location } = api.location.getById.useQuery(
    { id: reviewObj.locationId ?? "" },
    { enabled: !!reviewObj.locationId },
  );

  return (
    <Card
      className={cn(
        "border-cooper-gray-150 mx-auto w-[100%] border-[0.75px] bg-[#FEFEFE]",
        className,
      )}
    >
      <div className="flex w-full flex-wrap">
        <div className={cn("w-full", !isComparing && "sm:w-[17%]")}>
          <CardContent className="flex h-full pr-0">
            <div
              className={cn(
                "flex w-full flex-row justify-between",
                !isComparing && "md:flex-col",
              )}
            >
              <div className="flex flex-row items-center gap-2">
                <div
                  className={cn(
                    "text-2xl text-cooper-gray-900",
                    !isComparing && "md:text-4xl",
                  )}
                >
                  {reviewObj.overallRating?.toFixed(1) ?? "N/A"}
                </div>
                <Image
                  src="/svg/star.svg"
                  alt="Star icon"
                  width={28}
                  height={28}
                  className={cn("h-5 w-5", !isComparing && "md:h-7 md:w-7")}
                />
              </div>
              <div className="align-center text-cooper-gray-350 flex flex-col pt-2 text-sm">
                <span
                  className={`${location && prettyLocationName(location) ? "visibility: visible" : "visibility: hidden"}`}
                >
                  {prettyLocationName(location)}
                </span>
                <span>
                  {reviewObj.workTerm
                    ? reviewObj.workTerm.charAt(0).toUpperCase() +
                      reviewObj.workTerm.slice(1).toLowerCase()
                    : "N/A"}{" "}
                  {reviewObj.workYear}
                </span>
              </div>
            </div>
          </CardContent>
        </div>
        <div className={cn("w-full", !isComparing && "sm:w-[83%]")}>
          <CardContent
            className={cn(
              "flex h-full flex-col justify-between gap-4 pt-5 sm:pl-0",
              !isComparing && "md:pl-4 md:pt-0",
            )}
          >
            <div
              className={cn(
                isComparing
                  ? "hidden flex-row justify-between"
                  : "hidden flex-row justify-between md:flex",
              )}
            >
              <div className="pt-1">{reviewObj.textReview}</div>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex flex-wrap gap-6 rounded-lg bg-cooper-gray-700 p-3 pr-4 md:gap-10 md:pl-4">
                <div
                  className={cn(
                    "flex flex-col gap-2",
                    !isComparing && "md:flex-row",
                  )}
                >
                  <span className="text-cooper-gray-350">Job type</span>{" "}
                  {reviewObj.jobType === "CO-OP" ? "Co-op" : reviewObj.jobType}
                </div>
                <div
                  className={cn(
                    "flex flex-col gap-2",
                    !isComparing && "md:flex-row",
                  )}
                >
                  <span className="text-cooper-gray-350">Work model</span>
                  {prettyWorkEnviornment(
                    reviewObj.workEnvironment as WorkEnvironmentType,
                  )}
                </div>
                <div
                  className={cn(
                    "flex flex-col gap-2",
                    !isComparing && "md:flex-row",
                  )}
                >
                  <span className="text-cooper-gray-350">Pay</span> $
                  {reviewObj.hourlyPay}/hr
                </div>
                {reviewObj.workHours != null && (
                  <div
                    className={cn(
                      "flex flex-col gap-2",
                      !isComparing && "md:flex-row",
                    )}
                  >
                    <span className="text-cooper-gray-350">Hours/wk</span>{" "}
                    {reviewObj.workHours}
                  </div>
                )}
                {reviewObj.jobLength != null && (
                  <div
                    className={cn(
                      "flex flex-col gap-2",
                      !isComparing && "md:flex-row",
                    )}
                  >
                    <span className="text-cooper-gray-350">Job length</span>{" "}
                    {reviewObj.jobLength}{" "}
                    {reviewObj.jobLength === 1 ? "month" : "months"}
                  </div>
                )}
              </div>
              <ReportButton
                entityId={reviewObj.id}
                entityType="review"
                iconOnly={true}
              />
            </div>
            {(() => {
              const tags: string[] = [];
              if (reviewObj.overtimeNormal) tags.push("Overtime common");
              if (reviewObj.federalHolidays) tags.push("Federal holidays off");
              if (reviewObj.pto) tags.push("PTO");
              if (reviewObj.drugTest) tags.push("Drug test required");
              if (reviewObj.accessibleByTransportation)
                tags.push("Accessible by transit");
              if (reviewObj.freeLunch) tags.push("Free lunch");
              if (reviewObj.travelBenefits) tags.push("Travel benefits");
              if (reviewObj.freeMerch) tags.push("Free merch");
              if (reviewObj.snackBar) tags.push("Snack bar");
              if (reviewObj.teamOutings) tags.push("Team outings");
              if (reviewObj.coffeeChats) tags.push("Coffee chats");
              if (reviewObj.constructiveFeedback)
                tags.push("Constructive feedback");
              if (reviewObj.onboarding) tags.push("Good onboarding");
              if (reviewObj.workStructure) tags.push("Well-structured work");
              if (reviewObj.careerGrowth) tags.push("Career growth");
              if (tags.length === 0) return null;
              return (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-cooper-gray-700 px-3 py-1 text-xs text-cooper-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              );
            })()}
            <div
              className={cn(
                isComparing
                  ? "visible flex flex-row justify-between"
                  : "visible flex flex-row justify-between md:hidden",
              )}
            >
              <div className="pt-1">{reviewObj.textReview}</div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
