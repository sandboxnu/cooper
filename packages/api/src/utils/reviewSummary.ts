import type { ReviewType } from "@cooper/db/schema";

// Job page "On the Job" / averages summary for a set of published reviews.
// Shared by role.getAverageById (one job) and company.getAverageDetailsById
// (every job at a company).
export function summarizeReviews(
  reviews: (ReviewType & {
    reviewsToTools: { tool: { name: string } }[];
  })[],
) {
  const totalReviews = reviews.length;

  const calcAvg = (field: keyof ReviewType) => {
    return totalReviews > 0
      ? reviews.reduce((sum, review) => sum + Number(review[field]), 0) /
          totalReviews
      : 0;
  };

  const calcPercentage = (field: keyof ReviewType): number => {
    return totalReviews > 0
      ? reviews.filter((review) => review[field] === true).length /
          totalReviews
      : 0;
  };

  const averageOverallRating = calcAvg("overallRating");
  const averageHourlyPay = calcAvg("hourlyPay");
  const averageCultureRating = calcAvg("cultureRating");
  const averageSupervisorRating = calcAvg("supervisorRating");

  const federalHolidays = calcPercentage("federalHolidays");
  const drugTest = calcPercentage("drugTest");
  const freeLunch = calcPercentage("freeLunch");
  const freeMerch = calcPercentage("freeMerch");
  const travelBenefits = calcPercentage("travelBenefits");
  const snackBar = calcPercentage("snackBar");
  const overtimeNormal = calcPercentage("overtimeNormal");
  const pto = calcPercentage("pto");

  const minPay =
    totalReviews !== 0
      ? Math.min(...reviews.map((review) => Number(review.hourlyPay)))
      : 0;
  const maxPay =
    totalReviews !== 0
      ? Math.max(...reviews.map((review) => Number(review.hourlyPay)))
      : 0;

  // Work environment mode + tie handling + tooltip alerts
  const workEnvCounts = reviews.reduce<Record<string, number>>((acc, r) => {
    if (r.workEnvironment)
      acc[r.workEnvironment] = (acc[r.workEnvironment] ?? 0) + 1;
    return acc;
  }, {});
  const sortedEnvs = Object.entries(workEnvCounts).sort(
    ([, a], [, b]) => b - a,
  );
  const ENV_LABEL: Record<string, string> = {
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    INPERSON: "In-Person",
  };
  const NUM_WORDS: Record<number, string> = {
    1: "One",
    2: "Two",
    3: "Three",
    4: "Four",
    5: "Five",
  };

  let workEnvironmentMode: string | null = null;
  if (sortedEnvs.length > 0) {
    const topCount = sortedEnvs[0]?.[1] ?? 0;
    const tied = sortedEnvs.filter(([, c]) => c === topCount);
    if (tied.length === 1) {
      const env0 = tied[0]?.[0] ?? "";
      workEnvironmentMode = ENV_LABEL[env0] ?? env0;
    } else if (tied.length === 2) {
      const env0 = tied[0]?.[0] ?? "";
      const env1 = tied[1]?.[0] ?? "";
      workEnvironmentMode = `${ENV_LABEL[env0] ?? env0} and ${ENV_LABEL[env1] ?? env1}`;
    } else {
      workEnvironmentMode = tied
        .map(([env]) => ENV_LABEL[env] ?? env)
        .join(", ")
        .replace(/, ([^,]*)$/, ", and $1");
    }
  }

  const topEnvCount = sortedEnvs[0]?.[1] ?? 0;
  const tiedEnvKeys = new Set(
    sortedEnvs.filter(([, c]) => c === topEnvCount).map(([e]) => e),
  );
  const workEnvironmentAlerts = sortedEnvs
    .filter(([env]) => !tiedEnvKeys.has(env))
    .map(
      ([env, count]) =>
        `${NUM_WORDS[count] ?? count} reported ${ENV_LABEL[env] ?? env}`,
    );

  // Job length range
  const jobLengths = reviews
    .map((r) => r.jobLength)
    .filter((v): v is number => v != null);
  const jobLengthMin =
    jobLengths.length > 0 ? Math.min(...jobLengths) : null;
  const jobLengthMax =
    jobLengths.length > 0 ? Math.max(...jobLengths) : null;

  // Work hours range
  const workHoursValues = reviews
    .map((r) => r.workHours)
    .filter((v): v is number => v != null);
  const workHoursMin =
    workHoursValues.length > 0 ? Math.min(...workHoursValues) : null;
  const workHoursMax =
    workHoursValues.length > 0 ? Math.max(...workHoursValues) : null;

  const overtimeCount = reviews.filter(
    (r) => r.overtimeNormal === true,
  ).length;
  const accessibleByTransportation = calcPercentage(
    "accessibleByTransportation",
  );
  const teamOutingsCount = reviews.filter(
    (r) => r.teamOutings === true,
  ).length;
  const coffeeChatCount = reviews.filter(
    (r) => r.coffeeChats === true,
  ).length;
  const constructiveFeedbackCount = reviews.filter(
    (r) => r.constructiveFeedback === true,
  ).length;
  const onboarding = calcPercentage("onboarding");
  const workStructure = calcPercentage("workStructure");
  const careerGrowth = calcPercentage("careerGrowth");

  const tools = [
    ...new Set(
      reviews.flatMap((r) => r.reviewsToTools.map((rt) => rt.tool.name)),
    ),
  ];

  return {
    averageOverallRating,
    averageHourlyPay,
    averageCultureRating,
    averageSupervisorRating,
    federalHolidays,
    drugTest,
    freeLunch,
    freeMerch,
    travelBenefits,
    snackBar,
    overtimeNormal,
    pto,
    minPay,
    maxPay,
    totalReviews,
    workEnvironmentMode,
    workEnvironmentAlerts,
    jobLengthMin,
    jobLengthMax,
    workHoursMin,
    workHoursMax,
    overtimeCount,
    accessibleByTransportation,
    teamOutingsCount,
    coffeeChatCount,
    constructiveFeedbackCount,
    onboarding,
    workStructure,
    careerGrowth,
    tools,
  };
}
