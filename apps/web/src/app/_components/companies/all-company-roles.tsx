import { useRouter, useSearchParams } from "next/navigation";

import { api } from "~/trpc/react";
import LoadingResults from "../loading-results";
import { RoleCardPreview } from "../roles/role-card-preview";
import type { CompanyType } from "@cooper/db/schema";

interface RenderAllRolesProps {
  company: CompanyType | null;
  onClose?: () => void;
}

// Cream panel listing the company's roles; the list scrolls inside the panel
export default function RenderAllRoles({
  company,
  onClose,
}: RenderAllRolesProps) {
  const roles = api.role.getByCompany.useQuery({
    companyId: company?.id ?? "",
    onlyWithReviews: true,
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 rounded-lg bg-[#fafaf7] pl-5 pr-2.5 pt-4 shadow-[inset_0px_0px_5px_0px_rgba(0,0,0,0.04)]">
      <p className="text-[16px] font-bold leading-6 tracking-[-0.16px] text-cooper-gray-400">
        Roles at {company?.name} ({roles.data?.length ?? 0})
      </p>
      {roles.isPending ? (
        <LoadingResults />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-4 pr-2">
          {roles.isSuccess &&
            roles.data.map((role) => (
              <div
                key={role.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose?.();
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("company", company?.slug ?? "");
                  params.set("role", role.slug);
                  router.push(`/roles/?${params.toString()}`);
                }}
              >
                <RoleCardPreview roleObj={role} className="bg-white" />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
