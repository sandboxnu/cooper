import { useRouter } from "next/navigation";

import { cn } from "@cooper/ui";

import { api } from "~/trpc/react";
import LoadingResults from "../loading-results";
import NewRoleCard from "../reviews/new-role-card";
import { RoleCardPreview } from "../reviews/role-card-preview";
import type { CompanyType } from "@cooper/db/schema";

interface RenderAllRolesProps {
  company: CompanyType | null;
  onClose?: () => void;
}

export default function RenderAllRoles({ company, onClose }: RenderAllRolesProps) {
  const roles = api.role.getByCompany.useQuery({
    companyId: company?.id ?? "",
    onlyWithReviews: true,
  });
  const router = useRouter();

  return (
    <div className="flex h-full flex-col overflow-y-auto">
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
                    onClick={() => {
                      onClose?.();
                      router.push(
                        `/?company=${company?.name.toLowerCase()}&role=${role.title.toLowerCase().replace(/ /g, "-")}&type=roles`,
                      );
                    }}
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
