import Header from "~/components/header";
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
    <div className="flex min-h-screen flex-col bg-cooper-blue-200">
      <Header />
      <article className="mt-16 flex flex-col items-center justify-center">
        <SearchFilter />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => {
            return <RoleReviewCard key={role.id} roleObj={role} />;
          })}
        </div>
      </article>
    </div>
  );
}
