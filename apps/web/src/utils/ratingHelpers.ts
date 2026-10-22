// A company's overall rating: the average of each job's average rating, so
// every job counts equally however many reviews it has
export function averageOfRoleAverages(
  reviews: { roleId: string | null; overallRating: number | null }[],
): number {
  const byRole = new Map<string, number[]>();
  for (const review of reviews) {
    if (review.overallRating == null || !review.roleId) continue;
    const ratings = byRole.get(review.roleId) ?? [];
    ratings.push(review.overallRating);
    byRole.set(review.roleId, ratings);
  }
  const roleAverages = [...byRole.values()].map(
    (ratings) => ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
  );
  return roleAverages.length > 0
    ? roleAverages.reduce((sum, avg) => sum + avg, 0) / roleAverages.length
    : 0;
}
