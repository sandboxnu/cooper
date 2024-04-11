import { Review } from "@prisma/client";

export function mostCommonWorkEnviornment(
  reviews: Review[],
): "In Person" | "Hybrid" | "Remote" {
  const counts = {
    INPERSON: 0,
    HYBRID: 0,
    REMOTE: 0,
  };

  reviews.forEach((review) => {
    counts[review.workEnvironment]++;
  });

  if (counts.INPERSON >= Math.max(counts.HYBRID, counts.REMOTE))
    return "In Person";
  if (counts.HYBRID >= Math.max(counts.INPERSON, counts.REMOTE))
    return "Hybrid";
  return "Remote";
}

export function averageStarRating(reviews: Review[]): number {
  const totalStars = reviews.reduce((accum, curr) => {
    return accum + curr.overallRating;
  }, 0);
  return totalStars / reviews.length;
}

export function listBenefits(reviewObj: Review): string[] {
  const benefits: string[] = [];
  if (reviewObj.pto) benefits.push("Paid Time Off");
  if (reviewObj.federalHolidays) benefits.push("Federal Holidays Off");
  if (reviewObj.freeLunch) benefits.push("Free Lunch");
  if (reviewObj.freeTransport) benefits.push("Free Transporation");
  if (reviewObj.freeMerch) benefits.push("Free Merch");
  return benefits;
}
