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
    prefix: companyLabel,
    limit: 4,
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
    <>
      <div className="flex flex-col gap-4">
        {/* Company Section */}
        {/* Company Autocomplete */}
<article>
  <p className="text-lg font-semibold">Company name*</p>

  <div className="relative w-[70%]">
    <Input
      variant="dialogue"
      placeholder="Search companies…"
      className="w-full"
      value={companyLabel}
      onChange={(e) => {
        setCompanyLabel(e.target.value);
        handleUpdateCompanyId(undefined);
        setSelectedRoleId(undefined);
      }}
    />

    {companyLabel && companies.data && (
      <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-auto rounded-md border bg-white shadow-lg z-50">

        {companies.data.length > 0 ? (
          companies.data.map((company) => (
            <div
              key={company.id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setCompanyLabel(company.name);
                handleUpdateCompanyId(company.id);
                setSelectedRoleId(undefined);
              }}
            >
              {company.name}
            </div>
          ))
        ) : (
          <p className="px-3 py-2 italic text-gray-400">
            No matching companies
          </p>
        )}

      </div>
    )}
  </div>
</article>



{/* Roles Autocomplete */}

  <article className="mt-6">
    <p className="text-lg font-semibold">Role name*</p>

    <div className="relative w-[70%]">
      <Input
        variant="dialogue"
        placeholder="Search roles…"
        value={
          roles.data?.find((r) => r.id === selectedRoleId)?.title ?? ""
        }
        disabled={!selectedCompanyId}
        onChange={(e) => {
          setSelectedRoleId(undefined);
          setCreatingNewRole(false);
        }}
        onFocus={() => setCreatingNewRole(false)}
        className="w-full"
      />

      {roles.data && (
        <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-auto rounded-md border bg-white shadow-lg z-50">

          {roles.data.length === 0 && createdRolesCount < 4 && (
            <div
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setCreatingNewRole(true);
                setSelectedRoleId(undefined);
              }}
            >
              + Create a new role
            </div>
          )}

          {roles.data.length > 0 &&
            roles.data.map((role) => (
              <div
                key={role.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedRoleId(role.id);
                  setCreatingNewRole(false);
                }}
              >
                {role.title}
              </div>
            ))}

          {createdRolesCount < 4 && roles.data.length > 0 && (
            <div
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-t"
              onClick={() => {
                setCreatingNewRole(true);
                setSelectedRoleId(undefined);
              }}
            >
              + Create a new role
            </div>
          )}

        </div>
      )}
    </div>
  </article>

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
                              <Input
                                type="string"
                                variant="dialogue"
                                {...field}
                              />
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
      
    </>
  );
}
