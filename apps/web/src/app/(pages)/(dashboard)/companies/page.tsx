import { unstable_noStore as noStore } from "next/cache";
import { usePathname, useRouter } from "next/navigation";

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

  const router = useRouter();

  const handleRoleSelect = (roleId: string) => {
    router.push(`/companies/company?id=${roleId}`);
  };

  const roles = await getRoles();

  return (
    <>
      <SearchFilter />
      {roles.length > 0 ? (
        <div className="mb-8 grid h-[70dvh] w-3/4 grid-cols-1 gap-4 overflow-y-scroll md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => {
            return (
              <div
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className="cursor-pointer"
              >
                <RoleReviewCard roleObj={role} className="mb-4" />
              </div>

              // <RoleReviewCard key={role.id}
              // roleObj={role} className="mb-4" />
            );
          })}
        </div>
      ) : (
        <NoResults />
      )}
    </>
  );
}
