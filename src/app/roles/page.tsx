import HeaderLayout from "~/components/header-layout";
import { RoleReviewCard } from "~/components/role-review-card";
import SearchFilter from "~/components/search-filter";
import { api } from "~/trpc/server";

export default async function Roles() {
  const roles: {
    id: string;
    title: string;
    description: string | null;
    companyId: string;
  }[] = await api.role.list.query();

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
