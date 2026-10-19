import Image from "next/image";

import { cn } from "@cooper/ui";
import { CardContent, CardHeader, CardTitle } from "@cooper/ui/card";
import Logo from "@cooper/ui/logo";

import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { CompanyPopup } from "../companies/company-popup";
import { InterviewModal } from "./modals/interview-modal";
import { OnTheJobModal } from "./modals/on-the-job-modal";
import { PayModal } from "./modals/pay-modal";
import { ReviewModal } from "./modals/review-modal";
import type { RoleType } from "@cooper/db/schema";
import { ReportButton } from "../shared/report-button";
import { CompanyCardPreview } from "../companies/company-card-preview";
import { FavoriteButton } from "../shared/favorite-button";
import { useCompare } from "../compare/compare-context";
import type {
  CompareSize,
  CompareStickyHeader,
} from "../compare/compare-context";
import { compareRowStyle } from "../compare/compare-section";

interface RoleCardProps {
  className?: string;
  roleObj: RoleType;
  onBack?: () => void;
  // Set when rendered as a compare column; sizes the layout to the card width
  compareSize?: CompareSize;
  // Compare sticky header: compact while scrolling down, full while scrolling up
  stickyHeader?: CompareStickyHeader | null;
}

export function RoleInfo({
  className,
  roleObj,
  onBack,
  compareSize,
  stickyHeader,
}: RoleCardProps) {
  const reviews = api.review.getByRole.useQuery({ id: roleObj.id });
  const compare = useCompare();

  const firstLocationId = reviews.data?.[0]?.locationId;

  const location = api.location.getById.useQuery(
    { id: firstLocationId ?? "" },
    {
      enabled: !!firstLocationId,
    },
  );

  const companyQuery = api.company.getById.useQuery(
    { id: roleObj.companyId },
    { enabled: !!reviews.data?.[0]?.companyId },
  );

  // ===== ROLE DATA ===== //
  const companyData = companyQuery.data;
  const averages = api.role.getAverageById.useQuery({ roleId: roleObj.id });
  const interviewData = api.role.getInterviewDataById.useQuery({
    roleId: roleObj.id,
  });
  const industryInterviewData = api.review.getInterviewDataByIndustry.useQuery(
    { industry: companyData?.industry ?? "" },
    { enabled: !!companyData?.industry },
  );
  const globalInterviewData = api.review.getInterviewDataGlobal.useQuery();
  const globalPayData = api.review.getPayDataGlobal.useQuery();
  const industryPayData = api.review.getPayDataByIndustry.useQuery(
    { industry: companyData?.industry ?? "" },
    { enabled: !!companyData?.industry },
  );
  const companyReviews = api.review.getByCompany.useQuery(
    {
      id: companyData?.id ?? "",
    },
    {
      enabled: !!companyData?.id,
    },
  );

  const uniqueLocationIds = Array.from(
    new Set(
      (companyReviews.data ?? [])
        .map((review) => review.locationId)
        .filter((id): id is string => !!id),
    ),
  );

  const locationQueries = api.useQueries((t) =>
    uniqueLocationIds.map((id) =>
      t.location.getById({ id }, { enabled: !!id }),
    ),
  );

  const finalLocations = locationQueries
    .map((query) => (query.data ? prettyLocationName(query.data) : null))
    .filter((loc): loc is string => !!loc);

  const jobTypesFromReviews = [
    ...new Set(
      (reviews.data ?? [])
        .map((r) => r.jobType)
        .filter(Boolean)
        .map((job) => (job === "CO-OP" ? "Co-op" : job)),
    ),
  ] as string[];
  const jobTypeLabel =
    jobTypesFromReviews.length === 0
      ? null
      : jobTypesFromReviews.length === 1
        ? jobTypesFromReviews[0]
        : jobTypesFromReviews.sort().join(" / ");

  const isComparing =
    compare.isCompareMode &&
    (compare.comparedRoleIds.length >= 1 || compare.isDragging);

  const averageStarRating = (
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
              <div>
                {Math.round(
                  Number(averages.data?.averageOverallRating ?? 0) * 100,
                ) / 100}
              </div>
              ({reviews.data.length} review
              {reviews.data.length !== 1 && "s"})
            </div>
          );
        })()}
    </CardContent>
  );

  if (compareSize) {
    const isSmall = compareSize === "sm";
    // Save + remove buttons, shared by the full and compact sticky headers
    const headerActions = (
      <div className="flex shrink-0 items-center gap-4 pt-1">
        <FavoriteButton objId={roleObj.id} objType="role" />
        <button
          type="button"
          aria-label="Remove from comparison"
          onClick={() => compare.removeRoleId(roleObj.id)}
          className="rounded-full transition hover:bg-cooper-gray-150 hover:shadow-[0px_0px_0px_12px_rgb(231,231,231)]"
        >
          <Image
            src="/svg/exitComparisonButton.svg"
            width={14}
            height={14}
            alt="Remove from comparison"
            style={{ minHeight: "14px", minWidth: "14px" }}
          />
        </button>
      </div>
    );

    const fullHeader = (
      <div className="flex items-start gap-[14px]">
        {companyData ? (
          <CompanyPopup
            trigger={
              <button
                type="button"
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-lg border border-black/[0.07] bg-white",
                  isSmall ? "size-[46px]" : "p-4",
                )}
              >
                <Logo
                  company={companyData}
                  className={cn(
                    isSmall && "h-8 min-h-8 w-8 min-w-8 rounded-md text-lg",
                  )}
                />
              </button>
            }
            company={companyData}
            locations={finalLocations}
          />
        ) : (
          <div
            className={cn(
              "shrink-0 rounded-lg border border-black/[0.07] bg-white",
              isSmall ? "size-[46px]" : "size-[82px]",
            )}
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1 pr-1 pt-1">
          <p
            className={cn(
              "font-semibold text-cooper-gray-900",
              isSmall
                ? "text-[18px] leading-6 tracking-[-0.18px]"
                : "text-[24px] leading-7 tracking-[-0.24px]",
            )}
          >
            {roleObj.title}
          </p>
          <div
            className={cn(
              "flex flex-col text-cooper-gray-400",
              isSmall
                ? "gap-1 text-[14px] leading-normal"
                : "gap-[3px] text-[16px] leading-6 tracking-[-0.16px]",
            )}
          >
            {location.isSuccess && location.data && (
              <p className="whitespace-pre">
                {jobTypeLabel}
                {"  •  "}
                {prettyLocationName(location.data)}
              </p>
            )}
            {reviews.isSuccess && reviews.data.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Image
                  src="/svg/star.svg"
                  alt="Star icon"
                  width={21}
                  height={21}
                />
                <p className="whitespace-pre">
                  {Number(averages.data?.averageOverallRating ?? 0).toFixed(1)}
                  {"  "}({reviews.data.length} review
                  {reviews.data.length !== 1 && "s"})
                </p>
              </div>
            )}
          </div>
        </div>
        {headerActions}
      </div>
    );

    return (
      // Card spans every compare row (plus the filler row); its sections line
      // up with the other cards through nested subgrids (see COMPARE_ROWS)
      <div
        className={cn(
          // minmax(0,1fr) lets the card shrink below its content's min width
          "grid grid-cols-[minmax(0,1fr)] grid-rows-subgrid gap-y-0 rounded-lg bg-[#F1F0EC] px-4 pb-5 duration-500 motion-safe:animate-in motion-safe:fade-in",
          className,
        )}
        style={{ gridRow: "1 / -1" }}
      >
        {/* In-flow header (row 1); the sticky overlay below handles scrolling */}
        <div
          data-compare-header
          className={cn("pb-5", isSmall ? "pt-3" : "pt-4")}
          style={compareRowStyle("header")}
        >
          {fullHeader}
        </div>

        {/* Sticky overlay header: zero height and spans every row, so it sticks
            for the whole card and swapping its content never shifts layout */}
        {stickyHeader && (
          <div
            className="sticky top-0 z-20 h-0 self-start"
            // Same explicit column as the header/sections so it overlays them
            style={{ gridRow: "1 / -1", gridColumn: "1" }}
          >
            {/* Page-colored backing so the rounded top corners show against the
                page instead of the card content scrolling underneath */}
            <div className="-mx-4 bg-cooper-cream-100">
              <div
                key={stickyHeader}
                className="rounded-t-lg border-b border-cooper-gray-150 bg-[#F1F0EC] px-4 duration-300 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1"
              >
                {stickyHeader === "full" ? (
                  <div className={cn("pb-4", isSmall ? "pt-3" : "pt-4")}>
                    {fullHeader}
                  </div>
                ) : (
                  <div className="flex items-start gap-4 py-3">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="truncate text-[16px] font-semibold leading-6 tracking-[-0.16px] text-cooper-gray-900">
                        {roleObj.title}
                      </p>
                      <p className="truncate text-[14px] leading-normal text-cooper-gray-400">
                        {[companyData?.name, location.data?.city]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    </div>
                    {headerActions}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {averages.data && (
          <OnTheJobModal
            averages={averages.data}
            isComparing
            compareSize={compareSize}
          />
        )}
        <InterviewModal
          roleData={interviewData.data}
          industryData={industryInterviewData.data}
          globalData={globalInterviewData.data}
          compareSize={compareSize}
        />
        {averages.data && (
          <PayModal
            averages={averages.data}
            globalData={globalPayData.data}
            industryData={industryPayData.data}
            industryName={companyData?.industry ?? null}
            compareSize={compareSize}
          />
        )}
        <ReviewModal
          roleId={roleObj.id}
          isComparing={isComparing}
          compareSize={compareSize}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-fit w-[100%] flex-col justify-between scroll-smooth rounded-lg border-none pb-5",
        className,
      )}
    >
      {onBack && (
        <svg
          width="14"
          height="12"
          viewBox="0 0 14 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="m-4 block min-w-3 hover:cursor-pointer md:hidden"
          onClick={onBack}
        >
          <path
            d="M13.41 10.59L12 12L6 6L12 0L13.41 1.41L8.83 6L13.41 10.59ZM7.41 10.59L6 12L0 6L6 0L7.41 1.41L2.83 6L7.41 10.59Z"
            fill="#5A5A5A"
          />
        </svg>
      )}
      <div
        className={cn(
          "flex w-full items-start py-5 lg:pl-6 lg:pr-6",
          compare.isCompareMode && "lg:pl-4 lg:pr-4",
        )}
      >
        <CardHeader className="mx-0 w-full">
          <div className="flex items-start space-x-2">
            {compare.isCompareMode ? (
              companyData ? (
                <CompanyPopup
                  trigger={
                    <div className="cursor-pointer">
                      <Logo
                        company={companyData}
                        className="min-h-[82px] min-w-[82px]"
                      />
                    </div>
                  }
                  company={companyData}
                  locations={finalLocations}
                />
              ) : (
                <div className="w-20 rounded-lg border bg-cooper-blue-200"></div>
              )
            ) : null}
            <div className="flex flex-col w-full px-2">
              <div className="flex justify-between items-start">
                <div className="flex flex-row gap-2 items-start">
                  <CardTitle>
                    <div
                      className={cn(
                        "flex items-center gap-3 text-lg md:text-2xl",
                        compare.isCompareMode &&
                          compare.comparedRoleIds.length === 2 &&
                          "md:text-xl",
                      )}
                    >
                      <div>{roleObj.title}</div>
                    </div>
                  </CardTitle>
                  {!compare.isCompareMode && (
                    <ReportButton
                      entityId={roleObj.id}
                      entityType="company"
                      iconOnly={true}
                      className="pt-2"
                    />
                  )}
                </div>
                <div
                  className={cn(
                    "flex ml-5",
                    compare.isCompareMode && "flex-row gap-3 items-center",
                  )}
                >
                  <FavoriteButton objId={roleObj.id} objType="role" />
                  {compare.isCompareMode && (
                    <button
                      type="button"
                      aria-label="Remove from comparison"
                      onClick={() => compare.removeRoleId(roleObj.id)}
                      className="hover:shadow-[0px_0px_0px_12px_rgb(231,231,231)] hover:bg-cooper-gray-150 rounded-full transition"
                    >
                      <Image
                        src="/svg/exitComparisonButton.svg"
                        width={14}
                        height={14}
                        alt="Remove from comparison"
                        style={{ minHeight: "14px", minWidth: "14px" }}
                      />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between text-cooper-gray-400">
                {location.isSuccess && location.data && (
                  <div>
                    {jobTypeLabel} • {prettyLocationName(location.data)}
                  </div>
                )}
                {!compare.isCompareMode && (
                  <div className="flex flex-col items-end gap-2">
                    {averageStarRating}
                  </div>
                )}
              </div>
              {compare.isCompareMode && averageStarRating}
            </div>
          </div>
        </CardHeader>
      </div>
      <div className="flex w-[100%] justify-between">
        <div
          className={cn(
            "grid w-full grid-cols-2 gap-2 px-3 lg:pl-6 lg:pr-6",
            compare.isCompareMode && "lg:pl-4 lg:pr-4",
          )}
        >
          {companyData && !compare.isCompareMode && (
            <CompanyPopup
              company={companyData}
              locations={finalLocations}
              trigger={
                <div className="col-span-2 cursor-pointer">
                  <CompanyCardPreview companyObj={companyData} />
                </div>
              }
            />
          )}
          <div className="col-span-2" id="on-the-job">
            {averages.data && (
              <>
                <div className="xl:hidden">
                  <OnTheJobModal averages={averages.data} isComparing />
                </div>
                <div className="hidden xl:block">
                  <OnTheJobModal
                    averages={averages.data}
                    isComparing={compare.isCompareMode}
                  />
                </div>
              </>
            )}
          </div>

          <div className="col-span-2" id="interview">
            <div className="xl:hidden">
              <InterviewModal
                roleData={interviewData.data}
                industryData={industryInterviewData.data}
                globalData={globalInterviewData.data}
                compact
              />
            </div>
            <div className="hidden xl:block">
              <InterviewModal
                roleData={interviewData.data}
                industryData={industryInterviewData.data}
                globalData={globalInterviewData.data}
                compact={compare.isCompareMode}
              />
            </div>
          </div>

          {averages.data && (
            <div className="col-span-2" id="pay">
              <div className="xl:hidden">
                <PayModal
                  averages={averages.data}
                  globalData={globalPayData.data}
                  industryData={industryPayData.data}
                  industryName={companyData?.industry ?? null}
                  compact
                />
              </div>
              <div className="hidden xl:block">
                <PayModal
                  averages={averages.data}
                  globalData={globalPayData.data}
                  industryData={industryPayData.data}
                  industryName={companyData?.industry ?? null}
                  compact={compare.isCompareMode}
                />
              </div>
            </div>
          )}
          <div className="col-span-2" id="reviews">
            <ReviewModal roleId={roleObj.id} isComparing={isComparing} />
          </div>
        </div>
      </div>
    </div>
  );
}
