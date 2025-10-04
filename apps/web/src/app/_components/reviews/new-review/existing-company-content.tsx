import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter } from "bad-words";
import { Form, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import type { CompanyType, RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";
import { DialogFooter } from "@cooper/ui/dialog";
import { FormControl, FormField, FormItem, FormMessage } from "@cooper/ui/form";
import { toast } from "@cooper/ui/hooks/use-toast";
import { Input } from "@cooper/ui/input";
import { Label } from "@cooper/ui/label";
import Logo from "@cooper/ui/logo";
import { Textarea } from "@cooper/ui/textarea";

import type { RoleRequestType } from "../new-role-dialogue";
import { api } from "~/trpc/react";
import Fuse from "fuse.js";

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
      toast({
        title: "Submission Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
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
        <article>
          <p className="text-lg font-semibold">Company Name</p>
          <Input
            variant="dialogue"
            onChange={(e) => {
              setCompanyLabel(e.target.value);
              handleUpdateCompanyId(undefined);
            }}
            className="w-full"
          />
          <div className="mt-2 grid w-full grid-cols-1 gap-2">
            {companies.isSuccess &&
              companies.data.length > 0 &&
              companies.data.map((company: CompanyType) => (
                <div
                  key={company.id}
                  className={cn(
                    "flex items-center justify-start space-x-4 rounded-lg border border-cooper-gray-300 p-2 hover:cursor-pointer",
                    selectedCompanyId === company.id && "bg-cooper-blue-200",
                  )}
                  onClick={() => {
                    handleUpdateCompanyId(company.id);
                    setCreatingNewRole(false);
                    setSelectedRoleId(undefined);
                  }}
                >
                  <Logo company={company} />
                  <h2 className="text-lg font-semibold">{company.name}</h2>
                </div>
              ))}
            {companies.isSuccess && companies.data.length === 0 && (
              <div className="text-md flex items-center rounded-lg py-2">
                <h2 className="text-lg italic">No companies found</h2>
              </div>
            )}
            {companies.isPending && (
              <div className="flex h-16 items-center justify-start rounded-lg p-4">
                <h2 className="text-lg italic">Loading...</h2>
              </div>
            )}
          </div>
        </article>
        {/* Roles Section */}
        {selectedCompanyId && (
          <>
            <article>
              <p className="text-lg font-semibold">Roles</p>
              <div className="mt-2 grid w-full grid-cols-1 gap-2">
                {roles.isSuccess && roles.data.length > 0 && (
                  <>
                    {roles.data.map((role: RoleType) => (
                      <div
                        key={role.id}
                        className={cn(
                          "flex flex-col items-start justify-start rounded-lg border border-cooper-gray-300 p-2 hover:cursor-pointer",
                          selectedRoleId === role.id && "bg-cooper-blue-200",
                        )}
                        onClick={() => {
                          setSelectedRoleId(role.id);
                          setCreatingNewRole(false);
                        }}
                      >
                        <h2 className="text-lg font-semibold">{role.title}</h2>
                        <p className="text-md">{role.description}</p>
                      </div>
                    ))}
                    {createdRolesCount < 4 && createNewRoleButton}
                  </>
                )}
                {roles.isPending && (
                  <div className="flex items-center rounded-lg py-2">
                    <h2 className="text-lg italic">Loading...</h2>
                  </div>
                )}
                {createdRolesCount < 4 &&
                  roles.isSuccess &&
                  roles.data.length === 0 &&
                  createNewRoleButton}
                {createdRolesCount >= 4 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-cooper-gray-300 p-2">
                    <h2 className="text-center text-lg">
                      You have already created the maximum number of roles.
                    </h2>
                    <p className="text-md">
                      Thank you for contributing to{" "}
                      <span className="font-bold text-cooper-blue-800">
                        cooper!
                      </span>
                    </p>
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
          </>
        )}
      </div>
      <DialogFooter className="mt-4">
        <Button
          className="border-none bg-cooper-yellow-500 text-white hover:bg-cooper-yellow-300"
          disabled={
            ((!selectedCompanyId || !selectedRoleId) && !creatingNewRole) ||
            isLoading
          }
          onClick={handleSubmit}
        >
          {isLoading ? "Loading..." : "Start Review"}
        </Button>
      </DialogFooter>
    </>
  );
}
