import { useRef } from "react";
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
import { CompanyCardPreview } from "../companies/company-card-preview";
import { BackButton } from "../shared/back-button";
import { CircleButton } from "../shared/circle-button";
import { FavoriteButton } from "../shared/favorite-button";
import { OptionsMenu } from "../shared/options-menu";
import { useCompare } from "../compare/compare-context";
import type {
  CompareSize,
  CompareStickyHeader,
} from "../compare/compare-context";
import { compareRowStyle } from "../compare/compare-section";
import { useStickyHeader } from "../shared/use-sticky-header";
import { logoBoxClass, RoleHeader } from "./role-header";

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
  const { data: profile } = api.profile.getCurrentUser.useQuery();
  const ownReviewId = profile
    ? reviews.data?.find((review) => review.profileId === profile.id)?.id
    : undefined;

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
            // Kept on one line; it wraps as a whole under the location instead
            <div className="flex items-center gap-2 whitespace-nowrap text-cooper-gray-400">
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

  const inCompareColumn = !!compareSize;
  const isSmall = compareSize === "sm";

  // Regular view sticky header; compare columns get theirs from CompareColumns
  const rootRef = useRef<HTMLDivElement>(null);
  const inFlowHeaderRef = useRef<HTMLDivElement>(null);
  const regularStickyHeader = useStickyHeader(rootRef, inFlowHeaderRef);

  // Save + options (or remove, in compare) buttons, shared by the full and
  // compact headers
  const headerActions = (
    <div className="flex shrink-0 items-center gap-4 pt-1">
      <FavoriteButton objId={roleObj.id} objType="role" />
      {!inCompareColumn && (
        <OptionsMenu
          entityType="role"
          entityId={roleObj.id}
          entityName={roleObj.title}
          ownReviewId={ownReviewId}
        />
      )}
      {inCompareColumn && (
        <CircleButton
          aria-label="Remove from comparison"
          onClick={() => compare.removeRoleId(roleObj.id)}
        >
          <Image
            src="/svg/exitComparisonButton.svg"
            width={14}
            height={14}
            alt="Remove from comparison"
            style={{ minHeight: "14px", minWidth: "14px" }}
          />
        </CircleButton>
      )}
    </div>
  );

  // Logo that opens the company popup. Outside compare it only shows on md+.
  const companyLogo = (small: boolean) =>
    companyData ? (
      <CompanyPopup
        trigger={
          <button
            type="button"
            className={cn(
              logoBoxClass(small),
              !inCompareColumn && "hidden md:flex",
            )}
          >
            <Logo
              company={companyData}
              className={cn(
                small && "h-8 min-h-8 w-8 min-w-8 rounded-md text-lg",
              )}
            />
          </button>
        }
        company={companyData}
      />
    ) : (
      <div
        className={cn(
          "shrink-0 rounded-lg border border-black/[0.07] bg-white",
          small ? "size-[46px]" : "size-[82px]",
          !inCompareColumn && "hidden md:block",
        )}
      />
    );

  const fullHeader = (
    <RoleHeader
      logo={companyLogo(isSmall)}
      title={roleObj.title}
      jobTypeLabel={jobTypeLabel}
      locationLabel={
        location.isSuccess && location.data
          ? prettyLocationName(location.data)
          : null
      }
      rating={
        reviews.isSuccess
          ? {
              average: Number(averages.data?.averageOverallRating ?? 0),
              count: reviews.data.length,
            }
          : null
      }
      small={isSmall}
      actions={headerActions}
    />
  );

  // Logo shows on md/lg compare cards and md+ screens in the regular view
  const compactHeader = (
    <div className="flex items-center gap-4 py-3">
      {compareSize !== "sm" && companyLogo(true)}
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
  );

  if (compareSize) {
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
                  compactHeader
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
      ref={rootRef}
      className={cn(
        "flex h-fit w-[100%] flex-col justify-between scroll-smooth rounded-lg border-none pb-5",
        className,
      )}
    >
      {/* Sticky overlay header: zero height so showing or swapping it never
          shifts the content below */}
      {regularStickyHeader && (
        // -top-1 offsets the scroll container's p-1 so nothing shows above it
        <div className="sticky -top-1 z-20 h-0">
          {/* No key: it only animates in when it first appears, not when the
              scroll direction changes */}
          <div className="border-b border-cooper-gray-150 bg-cooper-cream-100 px-4 duration-300 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 md:px-6">
            {/* Same compact header whether scrolling up or down */}
            {compactHeader}
          </div>
        </div>
      )}
      {onBack && (
        <BackButton onClick={onBack} className="mx-4 mt-4" />
      )}
      <div
        ref={inFlowHeaderRef}
        className={cn(
          "flex w-full items-start px-4 py-5 md:px-6",
          // Sit close under the mobile back chevron
          onBack && "max-md:pt-2",
          compare.isCompareMode && "px-4 md:px-4",
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
                        "flex items-center gap-3 text-2xl",
                        compare.isCompareMode &&
                          compare.comparedRoleIds.length === 2 &&
                          "md:text-xl",
                      )}
                    >
                      <div>{roleObj.title}</div>
                    </div>
                  </CardTitle>
                </div>
                <div
                  className={cn(
                    "flex ml-5 flex-row items-center",
                    compare.isCompareMode ? "gap-3" : "gap-4",
                  )}
                >
                  <FavoriteButton objId={roleObj.id} objType="role" />
                  {!compare.isCompareMode && (
                    <OptionsMenu
                      entityType="role"
                      entityId={roleObj.id}
                      entityName={roleObj.title}
                      ownReviewId={ownReviewId}
                    />
                  )}
                  {compare.isCompareMode && (
                    <CircleButton
                      aria-label="Remove from comparison"
                      onClick={() => compare.removeRoleId(roleObj.id)}
                    >
                      <Image
                        src="/svg/exitComparisonButton.svg"
                        width={14}
                        height={14}
                        alt="Remove from comparison"
                        style={{ minHeight: "14px", minWidth: "14px" }}
                      />
                    </CircleButton>
                  )}
                </div>
              </div>

              {/* Location and rating wrap onto separate lines rather than
                  squeezing each other; a lone wrapped rating sits at the left */}
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-cooper-gray-400">
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
            "grid w-full grid-cols-2 gap-2 px-4 md:px-6",
            compare.isCompareMode && "px-4 md:px-4",
          )}
        >
          {companyData && !compare.isCompareMode && (
            <CompanyPopup
              company={companyData}
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

          {/* Interview and pay wrap on their own below xl */}
          <div className="col-span-2" id="interview">
            <InterviewModal
              roleData={interviewData.data}
              industryData={industryInterviewData.data}
              globalData={globalInterviewData.data}
              compact={compare.isCompareMode}
            />
          </div>

          {averages.data && (
            <div className="col-span-2" id="pay">
              <PayModal
                averages={averages.data}
                globalData={globalPayData.data}
                industryData={industryPayData.data}
                industryName={companyData?.industry ?? null}
                compact={compare.isCompareMode}
              />
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
