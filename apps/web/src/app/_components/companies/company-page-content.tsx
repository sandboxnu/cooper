"use client";

import { Fragment } from "react";
import Image from "next/image";

import type { CompanyType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";

import { api } from "~/trpc/react";
import { averageOfRoleAverages } from "~/utils/ratingHelpers";
import LoadingResults from "../loading-results";
import ModalContainer from "../reviews/modal";
import { BenefitRow, OnTheJobModal } from "../roles/modals/on-the-job-modal";
import { ReviewModal } from "../roles/modals/review-modal";
import { RoleCardPreview } from "../roles/role-card-preview";

// On the Job section is hidden for now; flip to show it again
const SHOW_ON_THE_JOB = false as boolean;

// Reviews store job type as "Co-op"/"CO-OP" and "Internship"/"INTERNSHIP"
const JOB_TYPES = [
  { label: "Co-op", matches: ["CO-OP", "COOP"] },
  { label: "Internship", matches: ["INTERNSHIP"] },
];
const WORK_MODELS = [
  { label: "In-person", value: "INPERSON" },
  { label: "Hybrid", value: "HYBRID" },
  { label: "Remote", value: "REMOTE" },
];
const DIFFICULTY_LABELS = {
  easy: "Less difficult",
  average: "Average",
  hard: "More difficult",
} as const;

// Every reported entry's label, most common first (ties keep list order)
function reportedLabels(entries: { label: string; count: number }[]): string[] {
  return entries
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((entry) => entry.label);
}

// Labels of the entries tied for the highest count, if any were reported
function topLabels(entries: { label: string; count: number }[]): string[] {
  const max = Math.max(0, ...entries.map((entry) => entry.count));
  return max > 0
    ? entries.filter((entry) => entry.count === max).map((e) => e.label)
    : [];
}

// Overview stats beside the company's roles; the top of the company page and
// the whole company popup
export function CompanyOverviewRow({
  company,
  onRoleSelect,
  boxed = true,
  className,
}: {
  company: CompanyType;
  // Called after a role card is opened (the popup closes itself)
  onRoleSelect?: () => void;
  // false (popup): no box border/fill/padding, and Overview's content lines
  // up with the header's company name (59px logo + 24px gap)
  boxed?: boolean;
  // e.g. the popup swaps the page's fixed xl height for its own
  className?: string;
}) {
  const reviews = api.review.getByCompany.useQuery({ id: company.id });
  const averages = api.company.getAverageDetailsById.useQuery({
    companyId: company.id,
  });
  const interviews = api.company.getInterviewDataById.useQuery({
    companyId: company.id,
  });
  const roles = api.role.getByCompany.useQuery({
    companyId: company.id,
    onlyWithReviews: true,
  });

  const reviewList = reviews.data ?? [];
  const totalReviews = reviewList.length;
  const hasReviews = totalReviews > 0;
  const countWhere = (
    match: (review: (typeof reviewList)[number]) => boolean,
  ) => reviewList.filter(match).length;

  const rating = averageOfRoleAverages(reviewList);
  const avgPay = averages.data?.averageHourlyPay ?? 0;
  const jobTypes = reportedLabels(
    JOB_TYPES.map(({ label, matches }) => ({
      label,
      count: countWhere((review) =>
        matches.includes((review.jobType ?? "").toUpperCase()),
      ),
    })),
  );
  const workModels = reportedLabels(
    WORK_MODELS.map(({ label, value }) => ({
      label,
      count: countWhere((review) => review.workEnvironment === value),
    })),
  );
  const difficultyCounts = interviews.data?.difficultyCounts;
  const topDifficulty = difficultyCounts
    ? (topLabels(
        (["easy", "average", "hard"] as const).map((key) => ({
          label: key,
          count: difficultyCounts[key],
        })),
      ) as (keyof typeof DIFFICULTY_LABELS)[])
    : [];
  // A tie reads as average difficulty
  const dominantDifficulty =
    topDifficulty.length > 1 ? "average" : (topDifficulty[0] ?? null);

  const unboxedClass = !boxed && "border-none bg-transparent p-0";

  // Overview and roles side by side from xl, sharing one fixed height;
  // stacked below xl
  return (
    <div
      className={cn(
        boxed
          ? "flex flex-col gap-2 xl:h-[420px] xl:flex-row"
          : // Popup: two columns from md (its own width is fixed), stacked
            // below; more space between them without boxes
            "flex flex-col gap-6 md:flex-row",
        className,
      )}
    >
      <ModalContainer
        // The popup shows the stats right under its header, untitled
        title={boxed ? "Overview" : undefined}
        className={cn(
          "flex min-w-0 flex-col flex-nowrap gap-0",
          boxed ? "xl:h-full xl:flex-1" : "md:flex-1",
          unboxedClass,
          // Under the company name (59px logo + 24px gap) when there's room
          !boxed && "md:pl-[83px]",
        )}
      >
        {/* Rating headline, then label/value rows like On the Job's table */}
        <div className="flex flex-col gap-4">
          {/* Same rating block as the review modal's star graph */}
          <div className="flex flex-col">
            <div className="flex flex-row gap-2 pt-1">
              <p className="text-[48px] leading-normal text-cooper-gray-900">
                {hasReviews ? rating.toFixed(1) : "---"}
              </p>
              {hasReviews && (
                <Image
                  src="/svg/star.svg"
                  alt="Star icon"
                  width={36}
                  height={36}
                />
              )}
            </div>
            <p className="text-[14px] leading-normal text-cooper-gray-400">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              {
                label: "Average pay",
                value: avgPay > 0 ? `$${Math.round(avgPay)}/hr` : null,
              },
              { label: "Job type(s)", value: jobTypes.join(", ") || null },
              {
                label: "Work model(s)",
                value: workModels.join(", ") || null,
              },
              {
                label: "Interview difficulty",
                value: dominantDifficulty
                  ? DIFFICULTY_LABELS[dominantDifficulty]
                  : null,
              },
            ].map(({ label, value }, i) => (
              <Fragment key={label}>
                {i > 0 && <hr className="border-t border-[#ebebeb]" />}
                <BenefitRow label={label} labelClassName="w-[148px]">
                  <p
                    className={cn(
                      "text-[16px] leading-6 tracking-[-0.16px] text-cooper-gray-900",
                      !value && "text-cooper-gray-400",
                    )}
                  >
                    {value ?? "No data"}
                  </p>
                </BenefitRow>
              </Fragment>
            ))}
          </div>
        </div>
      </ModalContainer>

      {/* Same box as Overview; role cards stack and scroll inside it */}
      <ModalContainer
        title={`Roles at ${company.name} (${roles.data?.length ?? 0})`}
        // Only as wide as the cards from xl; Overview takes the rest.
        // flex-nowrap: the box's default flex-wrap would size the column to
        // the cards' full row, so the row couldn't scroll inside the box
        className={cn(
          "flex min-w-0 flex-col flex-nowrap gap-0",
          boxed
            ? "xl:h-full xl:w-fit xl:shrink-0"
            : // Popup: a divided column as wide as the cards
              "md:w-fit md:shrink-0 md:border-l md:border-cooper-gray-150 md:pl-6",
          unboxedClass,
        )}
      >
        {roles.isPending ? (
          <LoadingResults />
        ) : (
          // Mobile: stacked, scrolling down after ~2.5 cards (300px, so the
          // cut-off card hints at more). md to xl (boxes stacked): one row
          // scrolling sideways. xl: stacked, filling the box's height
          <div
            className={cn(
              "no-scrollbar flex max-h-[300px] min-h-0 flex-1 flex-col gap-2 overflow-y-auto",
              // Page: one sideways row while the boxes are stacked (md to xl),
              // then a column filling the box. Popup: always a ~2.5-card
              // column that scrolls down
              boxed &&
                "md:max-h-none md:flex-row md:overflow-x-auto md:overflow-y-hidden xl:flex-col xl:overflow-y-auto xl:overflow-x-hidden",
            )}
          >
            {roles.data?.map((role) => (
              <div
                key={role.id}
                // Search-result width, not stretched to the box
                className="w-[312px] max-w-full shrink-0"
                // History API instead of router.push: no server round trip,
                // and the roles page follows useSearchParams
                onClick={() => {
                  window.history.pushState(
                    null,
                    "",
                    `/roles/?company=${company.slug}&type=roles&role=${role.slug}`,
                  );
                  onRoleSelect?.();
                }}
              >
                <RoleCardPreview roleObj={role} />
              </div>
            ))}
          </div>
        )}
      </ModalContainer>
    </div>
  );
}

// Company page: the overview + roles row, the job page's On the Job section
// across all its roles, then every review
export function CompanyPageContent({ company }: { company: CompanyType }) {
  const averages = api.company.getAverageDetailsById.useQuery({
    companyId: company.id,
  });

  // Semibold company name, like the reviews section's title
  const onTheJobTitle = (
    <>
      On the job at <span className="font-semibold">{company.name}</span>
    </>
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <CompanyOverviewRow company={company} />

      {/* The job page's On the Job section, across every role here; stacked
          below xl like on the job page. Hidden for now (SHOW_ON_THE_JOB) */}
      {SHOW_ON_THE_JOB && averages.data && (
        <>
          <div className="xl:hidden">
            <OnTheJobModal
              averages={averages.data}
              isComparing
              title={onTheJobTitle}
            />
          </div>
          <div className="hidden xl:block">
            <OnTheJobModal
              averages={averages.data}
              isComparing={false}
              title={onTheJobTitle}
            />
          </div>
        </>
      )}

      {/* Every review, filterable by role, each linking to its job */}
      <ReviewModal company={company} isComparing={false} />
    </div>
  );
}
