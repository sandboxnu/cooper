import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";

// A company's location, for now taken from its first (earliest) review that
// has a location. Shared by the company cards and the company header so they
// always agree. Returns null when no review has a location.
export function useCompanyLocation(companyId: string): string | null {
  const reviews = api.review.getByCompany.useQuery({ id: companyId });
  const firstLocationId = [...(reviews.data ?? [])]
    .filter((review) => !!review.locationId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )[0]?.locationId;
  const location = api.location.getById.useQuery(
    { id: firstLocationId ?? "" },
    { enabled: !!firstLocationId },
  );
  return location.data ? prettyLocationName(location.data) : null;
}
