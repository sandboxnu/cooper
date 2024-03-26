import HeaderLayout from "~/components/header-layout";
import { RoleReviewCard } from "~/components/role-review-card";
import SearchFilter from "~/components/search-filter";
import { api } from "~/trpc/server";
import { unstable_noStore as noStore } from "next/cache";

export default async function Roles() {
  /**
   * FIXME: This is a temporary fix, figure out how to get build command working without noStore();
   * @returns A promise containing the roles from the database
   */
  async function getRoles() {
    noStore();
    const roles = await api.role.list.query();
    return roles;
  }

  const roles = await getRoles();

  return (
    <HeaderLayout>
      <SearchFilter />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => {
          return <RoleReviewCard key={role.id} roleObj={role} />;
        })}
      </div>
    </HeaderLayout>
  );
}
