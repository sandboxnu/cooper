"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { ReviewType, WorkEnvironmentType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";

import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { prettyWorkEnviornment } from "~/utils/stringHelpers";
import { MENU_CONTENT_CLASS, MENU_ITEM_CLASS } from "../shared/menu-styles";
import { ReportDialog } from "../shared/report-button";

interface ReviewCardProps {
  className?: string;
  reviewObj: ReviewType;
  isComparing?: boolean;
  // Job the review is for, linked; shown when reviews span several jobs
  // (company page)
  roleLink?: { title: string; href: string };
}

export function ReviewCard({
  reviewObj,
  className,
  isComparing,
  roleLink,
}: ReviewCardProps) {
  const { data: location } = api.location.getById.useQuery(
    { id: reviewObj.locationId ?? "" },
    { enabled: !!reviewObj.locationId },
  );
  const { data: profile } = api.profile.getCurrentUser.useQuery();
  const isOwnReview = !!profile && reviewObj.profileId === profile.id;
  const [reportOpen, setReportOpen] = useState(false);

  const workTerm = reviewObj.workTerm
    ? reviewObj.workTerm.charAt(0).toUpperCase() +
      reviewObj.workTerm.slice(1).toLowerCase()
    : "N/A";

  const details = [
    {
      label: "Job type",
      value: reviewObj.jobType === "CO-OP" ? "Co-op" : reviewObj.jobType,
    },
    {
      label: "Work model",
      value: prettyWorkEnviornment(
        reviewObj.workEnvironment as WorkEnvironmentType,
      ),
    },
    { label: "Pay", value: `$${reviewObj.hourlyPay}/hr` },
  ];

  // Shown in two places (top row when narrow, beside the text when wide)
  const menu = (
    // Non-modal so the report dialog can take focus once it closes
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label="Review options"
        // The after: overlay widens the click area to 30x30 without moving
        // anything
        className="relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-1 after:content-['']"
      >
        <Image src="/svg/reviewMenu.svg" alt="" width={6} height={22} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={MENU_CONTENT_CLASS}>
        {isOwnReview && (
          <DropdownMenuItem asChild className={MENU_ITEM_CLASS}>
            <Link href={`/profile?tab=my-reviews&review=${reviewObj.id}`}>
              View or edit on profile
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className={MENU_ITEM_CLASS}
          onSelect={() => setReportOpen(true)}
        >
          Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Shown in two places, like the menu
  const locationAndTerm = (
    <div className="text-cooper-gray-350 flex flex-col text-sm leading-normal">
      {location && prettyLocationName(location) && (
        <span>{prettyLocationName(location)}</span>
      )}
      <span>
        {workTerm} {reviewObj.workYear}
      </span>
    </div>
  );

  // Lays out by the card's own width: side by side from 563px (a 613px
  // Reviews section). Narrower, it stacks with the rating, location and term
  // and menu in a top row.
  return (
    <div className={cn("w-full [container-type:inline-size]", className)}>
      <div
        className={cn(
          "flex w-full flex-col items-start gap-4 rounded-lg px-1",
          !isComparing &&
            "[@container(min-width:563px)]:flex-row [@container(min-width:563px)]:gap-8",
        )}
      >
        {/* Rating, location and term */}
        <div
          className={cn(
            "flex w-full shrink-0 items-start justify-between gap-4",
            !isComparing &&
              "[@container(min-width:563px)]:w-[140px] [@container(min-width:563px)]:flex-col [@container(min-width:563px)]:gap-2 [@container(min-width:563px)]:self-stretch",
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-cooper-gray-900 text-[36px] leading-none">
              {reviewObj.overallRating?.toFixed(1) ?? "N/A"}
            </span>
            <div className="relative size-7 shrink-0">
              <Image
                src="/svg/reviewStar.svg"
                alt="Star icon"
                width={23.68}
                height={22.62}
                className="absolute left-[7.72%] top-[5.73%]"
              />
            </div>
          </div>
          {/* Narrow: location and term, then the menu, on the right */}
          <div
            className={cn(
              "flex items-start gap-4 text-right",
              !isComparing && "[@container(min-width:563px)]:hidden",
            )}
          >
            {locationAndTerm}
            {menu}
          </div>
          {/* Wide: location and term at the bottom of the left column */}
          <div
            className={cn(
              "hidden",
              !isComparing && "[@container(min-width:563px)]:block",
            )}
          >
            {locationAndTerm}
          </div>
        </div>

        {/* Review text and job details */}
        <div className="flex min-w-0 flex-1 flex-col items-start justify-between gap-4 self-stretch pt-1">
          <div className="flex w-full items-start gap-6">
            <p className="text-cooper-gray-900 min-w-0 flex-1 text-base leading-6 tracking-[-0.16px]">
              {reviewObj.textReview}
            </p>
            {/* Wide: menu beside the text */}
            <div
              className={cn(
                "hidden shrink-0",
                !isComparing && "[@container(min-width:563px)]:block",
              )}
            >
              {menu}
            </div>
          </div>
          <ReportDialog
            entityType="review"
            entityId={reviewObj.id}
            open={reportOpen}
            onOpenChange={setReportOpen}
          />
          <div className="flex w-full flex-col items-start gap-2">
            <div className="flex w-full flex-wrap items-center gap-x-8 gap-y-2 rounded-lg bg-[#F7F7F7] px-4 py-3 text-sm leading-normal">
              {details.map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-cooper-gray-350 whitespace-nowrap">
                    {label}
                  </span>
                  <span className="text-cooper-gray-900 [@container(min-width:563px)]:w-20">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            {roleLink && (
              <p className="text-cooper-gray-350 text-sm leading-normal mt-1">
                Review for{" "}
                <Link
                  href={roleLink.href}
                  className="font-semibold transition-colors hover:text-cooper-gray-550"
                >
                  {roleLink.title}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
