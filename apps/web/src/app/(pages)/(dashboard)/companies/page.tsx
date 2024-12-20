import { unstable_noStore as noStore } from "next/cache";

import NoResults from "~/app/_components/no-results";
import { RoleReviewCard } from "~/app/_components/reviews/role-review-card";
import SearchFilter from "~/app/_components/search/search-filter";
import { api } from "~/trpc/server";

export default async function Companies() {
  /**
   * FIXME: This is a temporary fix, figure out how to get build command working without noStore();
   * @returns A promise containing the roles from the database
   */
  async function getRoles() {
    noStore();
    const roles = await api.role.list();
    return roles;
  }

  const roles = await getRoles();

  return (
    <>
      <SearchFilter />
      {roles.length > 0 ? (
        <div className="mb-8 grid h-[70dvh] w-3/4 grid-cols-1 gap-4 overflow-y-scroll md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => {
            return (
              <RoleReviewCard key={role.id} roleObj={role} className="mb-4" />
            );
          })}
        </div>
      ) : (
        <NoResults />
      )}
    </>
  );
}
