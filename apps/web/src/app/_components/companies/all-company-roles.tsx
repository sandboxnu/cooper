import { useRouter } from "next/navigation";

import { cn } from "@cooper/ui";

import { api } from "~/trpc/react";
import LoadingResults from "../loading-results";
import NewRoleCard from "../reviews/new-role-card";
import { RoleCardPreview } from "../reviews/role-card-preview";
import { CompanyType } from "@cooper/db/schema";

interface RenderAllRolesProps {
  company: CompanyType | null;
}

export default function RenderAllRoles({ company }: RenderAllRolesProps) {
  const roles = api.role.getByCompany.useQuery({
    companyId: company?.id ?? "",
  });
  const router = useRouter();

  return (
    <div className="overflow-y-auto">
      <h2 className="font-bold pl-2 text-[#5A5A5A]">
        Roles at {company?.name} ({roles.data?.length})
      </h2>
      {roles.isPending ? (
        <LoadingResults />
      ) : (
        <div className="mb-8 h-[30dvh] w-full p-1">
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
                      roleObj={role}
                      className={cn(
                        "bg-cooper-gray-100 hover:bg-cooper-gray-100",
                      )}
                    />
                  </div>
                );
              })}
            </>
          )}
          {company && (
            <div className="p-2">
              <NewRoleCard companyId={company.id} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
