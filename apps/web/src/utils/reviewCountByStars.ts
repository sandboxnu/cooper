import type { ReviewType } from "@cooper/db/schema";

export function calculateRatings(reviews: ReviewType[] = []) {
  const totalReviews = reviews.length;

  return [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter(
      (r) => r.overallRating.toFixed(0) === star.toString(),
    ).length;
    const percentage =
      totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars: star, percentage };
  });
}
