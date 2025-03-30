import { useRouter } from "next/navigation";

import { cn } from "@cooper/ui";

import { api } from "~/trpc/react";
import LoadingResults from "../loading-results";
import NewRoleCard from "../reviews/new-role-card";
import { RoleCardPreview } from "../reviews/role-card-preview";

interface RenderAllRolesProps {
  company: string | null;
}

export default function RenderAllRoles({ company }: RenderAllRolesProps) {
  const roles = api.role.getByCompany.useQuery({ companyId: company ?? "" });
  const router = useRouter();

  return (
    <>
      <h2 className="mb-4 text-2xl">Job Postings</h2>
      {roles.isPending ? (
        <LoadingResults />
      ) : (
        <div className="mb-8 grid h-[30dvh] w-full grid-cols-1 gap-3 p-1 md:grid-cols-2 xl:grid-cols-3">
          {roles.isSuccess && roles.data.length > 0 && (
            <>
              {roles.data.map((role) => {
                return (
                  <div
                    key={role.id}
                    className="p-2"
                    onClick={() => router.push(`/role?id=${role.id}`)}
                  >
                    <RoleCardPreview
                      reviewObj={role}
                      className={cn("mb-4 hover:bg-cooper-gray-100")}
                    />
                  </div>
                );
              })}
            </>
          )}
          {company && (
            <div className="p-2">
              <NewRoleCard companyId={company} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
