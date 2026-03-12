"use client";
import { UserRole, UserRoleType } from "@cooper/db/schema";
import { cn, useCustomToast } from "@cooper/ui";
import { useRouter } from "next/navigation";
import { Button } from "node_modules/@cooper/ui/src/button";
import { Input } from "node_modules/@cooper/ui/src/input";
import { useState } from "react";
import { CompanyCardPreview } from "~/app/_components/companies/company-card-preview";
import { ReviewCard } from "~/app/_components/reviews/review-card";
import { RoleCardPreview } from "~/app/_components/reviews/role-card-preview";
import { Select } from "~/app/_components/themed/onboarding/select";
import { api } from "~/trpc/react";

export default function Admin() {
  const router = useRouter();

  const {
    data: session,
    isLoading: sessionLoading,
    error: _sessionError,
  } = api.auth.getSession.useQuery();

  if (
    !sessionLoading &&
    session?.user.role &&
    session.user.role !== UserRole.ADMIN
  ) {
    router.replace("/404");
  }
  const roles = api.role.list.useQuery({}, {});
  const { toast } = useCustomToast();
  const reviews = api.review.list.useQuery({}, {});
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [email, setEmail] = useState("");
  const createUser = api.user.create.useMutation({
    onSuccess: () => {
      toast.success("User added successfully.");
      setEmail("");
      setSelectedRole("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const companies = api.company.list.useQuery(
    {
      showAll: false,
    },
    {},
  );

  return (
    <div className="bg-cooper-cream-100 flex flex-col h-screen w-full justify-center overflow-auto">
      <div className="flex flex-row">
        <Input
          className={cn(
            "border-cooper-gray-150 h-9 border-[1px] pl-5 w-[30%] text-sm text-cooper-gray-400",
          )}
          placeholder="Type email here"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="w-[10%]">
          <Select
            options={[
              { value: UserRole.ADMIN, label: "Admin" },
              { value: UserRole.COORDINATOR, label: "Co-op advisor" },
            ]}
            className="border-cooper-gray-150 h-10 text-sm"
            value={selectedRole}
            placeholder="Select"
            onChange={(e) => {
              setSelectedRole(e.target.value);
            }}
          />
        </div>
        <Button
          type="button"
          className="bg-cooper-gray-550 hover:bg-cooper-gray-600 rounded-lg border-none px-8 py-3 text-lg font-semibold text-white"
          onClick={() => {
            if (!email || !selectedRole) return;
            createUser.mutate({ email, role: selectedRole as UserRoleType });
          }}
        >
          Submit
        </Button>
      </div>
      <div className="flex flex-row gap-2">
        <div className="flex flex-col">
          All reviews
          {reviews.data?.map((review) => (
            <ReviewCard
              reviewObj={review}
              key={review.id}
              className="h-[30%]"
            />
          ))}
        </div>
        <div>
          All roles:
          {roles.data?.roles.map((role) => (
            <RoleCardPreview key={role.id} roleObj={role} />
          ))}
        </div>
        <div>
          All companies
          {companies.data?.map((company) => (
            <CompanyCardPreview key={company.id} companyObj={company} />
          ))}
        </div>
      </div>
    </div>
  );
}
