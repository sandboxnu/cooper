import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter } from "bad-words";
import Fuse from "fuse.js";
import { Form, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@cooper/ui";
import { FormControl, FormField, FormItem, FormMessage } from "@cooper/ui/form";
import { useCustomToast } from "@cooper/ui/hooks/use-custom-toast";
import { Input } from "@cooper/ui/input";
import { Label } from "@cooper/ui/label";
import { Textarea } from "@cooper/ui/textarea";

import type { RoleRequestType } from "../new-role-dialogue";
import { api } from "~/trpc/react";
import { Select } from "../../themed/onboarding/select";
import { FormSection } from "../../form/form-section";
import { FormLabel } from "../../themed/onboarding/form";

const filter = new Filter();
const roleSchema = z.object({
  title: z
    .string({ required_error: "You need to enter a role title." })
    .min(5, {
      message: "The role title must be at least 5 characters.",
    })
    .refine((val) => !filter.isProfane(val), {
      message: "The title cannot contain profane words.",
    }),
  description: z
    .string()
    .min(10, {
      message: "The review must be at least 10 characters.",
    })
    .max(500, {
      message: "The description must be at most 500 characters.",
    })
    .refine((val) => !filter.isProfane(val), {
      message: "The description cannot contain profane words.",
    }),
  companyId: z.string(),
  createdBy: z.string(),
});

interface ExistingCompanyContentProps {
  createdRolesCount: number;
  profileId?: string;
}

export default function ExistingCompanyContent({
  createdRolesCount,
  profileId,
}: ExistingCompanyContentProps) {
  const router = useRouter();

  const [companyLabel, setCompanyLabel] = useState<string>("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<
    string | undefined
  >();
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>();
  const [creatingNewRole, setCreatingNewRole] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { toast } = useCustomToast();

  const companies = api.company.list.useQuery({
    sortBy: "rating",
  });

  const roles = api.role.getByCompany.useQuery(
    {
      companyId: selectedCompanyId ?? "",
    },
    {
      enabled: !!selectedCompanyId,
    },
  );

  const extendedRoleSchema = roleSchema.extend({
    title: roleSchema.shape.title.refine(
      (val) => {
        if (!roles.data || !selectedCompanyId) return true;
        const fuseOptions = {
          keys: ["title"],
          threshold: 0.3,
          includeScore: true,
        };

        const fuse = new Fuse(roles.data, fuseOptions);
        const searchResults = fuse.search(val.trim().toLowerCase());
        const hasSimilarRole = searchResults.some(
          (result) => result.score !== undefined && result.score < 0.3,
        );
        return !hasSimilarRole;
      },
      {
        message: "A role with this title already exists for this company.",
      },
    ),
  });

  const newRoleForm = useForm<z.infer<RoleRequestType>>({
    resolver: zodResolver(extendedRoleSchema),
    defaultValues: {
      title: "",
      description: "",
      companyId: "",
      createdBy: profileId,
    },
  });

  const newRoleMutation = api.role.create.useMutation({
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");

      setIsLoading(false);
    },
  });

  function handleUpdateCompanyId(newId: string | undefined) {
    newRoleForm.setValue("companyId", newId ?? "");
    setSelectedCompanyId(newId);
  }

  async function handleSubmit() {
    // Existing Company and Role Case
    if (selectedRoleId) {
      router.push("/review?id=" + selectedRoleId);
      return;
    }

    // Existing Company and New Role Case
    if (creatingNewRole && selectedCompanyId) {
      const res = await newRoleForm.trigger(["title", "description"], {
        shouldFocus: true,
      });

      if (!res) {
        return;
      }

      setIsLoading(true);

      try {
        const newRoles = await newRoleMutation.mutateAsync({
          ...newRoleForm.getValues(),
          companyId: selectedCompanyId,
          createdBy: profileId ?? "",
        });

        if (newRoles[0]) {
          router.push("/review?id=" + newRoles[0].id);
        } else {
          setIsLoading(false);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setIsLoading(false);
      }
    }
  }

  const createNewRoleButton = (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-cooper-gray-300 p-2 hover:cursor-pointer",
        creatingNewRole && "bg-cooper-blue-200",
      )}
      onClick={() => {
        setCreatingNewRole(true);
        setSelectedRoleId(undefined);
      }}
    >
      <h2 className="text-lg">Don't see your role?</h2>
      <p className="text-md">Add a New One</p>
    </div>
  );

  return (
    <FormSection>
      <div className="flex flex-col gap-6 pt-4">
        {/* Company Section */}
        {/* Company Autocomplete */}
        <FormItem className="flex flex-row gap-14 pl-2 md:pl-0 items-center">
          <FormLabel className="text-sm text-cooper-gray-400 font-semibold md:w-60 text-right">
            Company name<span className="text-[#FB7373]">*</span>
          </FormLabel>

          <div className="relative flex-1">
            <Select
              options={
                companies.data?.filter(Boolean).map((company) => ({
                  value: company.id,
                  label: company.name,
                })) ?? []
              }
              placeholder="Search companies…"
              className="w-full border-cooper-gray-150 text-sm h-10"
              value={companyLabel}
              onChange={(e) => {
                const newId = e.target.value;

                setCompanyLabel(e.target.value);
                setSelectedRoleId(undefined);
                handleUpdateCompanyId(newId);
              }}
            />
          </div>
        </FormItem>

        {/* Roles Autocomplete */}

        <FormItem className="flex flex-row gap-14 pl-2 md:pl-0 items-center">
          <FormLabel className="text-sm font-semibold text-cooper-gray-400 md:w-60 text-right ">
            Role name<span className="text-[#FB7373]">*</span>
          </FormLabel>

          <div className="relative flex-1">
            <Select
              placeholder="Search roles…"
              options={
                roles.data?.map((r) => ({
                  value: r.id,
                  label: r.title,
                })) ?? []
              }
              disabled={!selectedCompanyId}
              onChange={(e) => {
                const newRoleId = e.target.value;
                setSelectedRoleId(newRoleId);
                setCreatingNewRole(false);
              }}
              onFocus={() => setCreatingNewRole(false)}
              className="w-full border-cooper-gray-150 text-sm h-10"
            />
          </div>
        </FormItem>

        {/* Create New Role Section */}
        {creatingNewRole && (
          <article>
            <FormProvider {...newRoleForm}>
              <Form>
                <div className="flex flex-col gap-4">
                  <FormField
                    control={newRoleForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Role Name</Label>
                        <FormControl>
                          <Input type="string" variant="dialogue" {...field} />
                        </FormControl>
                        <FormMessage className="text-sm" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newRoleForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Role Description</Label>
                        <FormControl>
                          <Textarea variant="dialogue" {...field} />
                        </FormControl>
                        <FormMessage className="text-sm" />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </FormProvider>
          </article>
        )}
      </div>
    </FormSection>
  );
}
