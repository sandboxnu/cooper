"use client";

import { create } from "domain";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter } from "bad-words";
import { Form, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import type { CompanyType, RoleType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cooper/ui/dialog";
import { FormControl, FormField, FormItem, FormMessage } from "@cooper/ui/form";
import { toast } from "@cooper/ui/hooks/use-toast";
import { Input } from "@cooper/ui/input";
import { Label } from "@cooper/ui/label";
import { Textarea } from "@cooper/ui/textarea";

import type { RoleRequestType } from "./new-role-dialogue";
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

interface NewReviewDialogProps {
  trigger?: React.ReactNode;
}

/**
 * General "+ New Review"
 *
 * @returns A "+ New Review" button that prompts users for a company + role before redirecting to the review form.
 */
export function NewReviewDialog({ trigger }: NewReviewDialogProps) {
  const router = useRouter();
  const session = api.auth.getSession.useQuery();

  const [companyMode, setCompanyMode] = useState<"existing" | "new">(
    "existing",
  );
  const [companyLabel, setCompanyLabel] = useState<string>("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<
    string | undefined
  >();
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>();
  const [creatingNewRole, setCreatingNewRole] = useState<boolean>(false);

  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const companies = api.company.list.useQuery(
    { prefix: companyLabel, limit: 4, sortBy: "rating" },
    { enabled: companyMode === "existing" },
  );

  const roles = api.role.getByCompany.useQuery(
    {
      companyId: selectedCompanyId ?? "",
    },
    {
      enabled: !!selectedCompanyId,
    },
  );

  const { data: profile } = api.profile.getCurrentUser.useQuery();
  const profileId = profile?.id;

  // const createdRoles =
  //   api.role.getByCreatedBy.useQuery(
  //     { createdBy: profileId ?? "" },
  //     { enabled: !!profileId },
  //   ).data ?? [];
  // const createdRolesCount = createdRoles.length;

  const newRoleForm = useForm<z.infer<RoleRequestType>>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      title: "",
      description: "",
      companyId: "",
      createdBy: profileId,
    },
  });

  const newRoleMutation = api.role.create.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (error) => {
      toast({
        title: "Submission Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  function handleUpdateCompanyId(newId: string | undefined) {
    newRoleForm.setValue("companyId", newId ?? "");
    setSelectedCompanyId(newId);
  }

  async function handleSubmitNewRole(values: z.infer<RoleRequestType>) {
    if (!selectedCompanyId) {
      return;
    }

    const newRoles = await newRoleMutation.mutateAsync({
      ...values,
      companyId: selectedCompanyId,
      createdBy: profileId ?? "",
    });

    if (newRoles[0]) {
      router.push("/review?id=" + newRoles[0].id);
    } else {
      setIsLoading(false);
    }
  }

  async function handleSubmit() {
    if (selectedRoleId) {
      router.push("/review?id=" + selectedRoleId);
    }

    if (creatingNewRole) {
      const res = await newRoleForm.trigger(["title", "description"], {
        shouldFocus: true,
      });

      if (!res) {
        return;
      }

      setIsLoading(true);

      await newRoleForm.handleSubmit(handleSubmitNewRole)();
    }
  }

  if (!session.isSuccess && !session.data) {
    return;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ? (
          <Button className="m-0 -mt-2 border-none bg-white p-0 text-3xl font-thin text-black outline-none hover:bg-white">
            {trigger}
          </Button>
        ) : (
          <Button className="h-9 rounded-lg border-none border-cooper-yellow-500 bg-cooper-yellow-500 px-4 py-3 text-sm font-semibold text-white hover:border-cooper-yellow-300 hover:bg-cooper-yellow-300">
            + New Review
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80dvh] w-[80dvw] overflow-scroll bg-white">
        <DialogHeader>
          <DialogTitle className="text-cooper-gray-900 flex flex-col items-center justify-between text-2xl font-semibold md:flex-row md:gap-12">
            New Review
            <div className="">
              <Button
                variant="link"
                className={cn(
                  "mr-4 px-0 py-0 text-cooper-gray-300 hover:no-underline md:text-lg",
                  companyMode === "existing" && "underline hover:underline",
                )}
                onClick={() => {
                  setCompanyMode("existing");
                }}
              >
                Existing Company
              </Button>
              <Button
                variant="link"
                className={cn(
                  "mr-2 px-0 py-0 text-cooper-gray-300 hover:no-underline md:text-lg",
                  companyMode === "new" && "underline hover:underline",
                )}
                onClick={() => {
                  setCompanyMode("new");
                }}
              >
                New Company
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <section>
          {companyMode === "existing" && (
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
                          selectedCompanyId === company.id &&
                            "bg-cooper-blue-200",
                        )}
                        onClick={() => {
                          handleUpdateCompanyId(company.id);
                          setCreatingNewRole(false);
                          setSelectedRoleId(undefined);
                        }}
                      >
                        <Image
                          src={`https://logo.clearbit.com/${company.name.replace(/\s/g, "")}.com`}
                          width={64}
                          height={64}
                          alt={`Logo of ${company.name}`}
                          className="h-16 w-16 rounded-lg"
                        />
                        <h2 className="text-lg font-semibold">
                          {company.name}
                        </h2>
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
                                selectedRoleId === role.id &&
                                  "bg-cooper-blue-200",
                              )}
                              onClick={() => {
                                setSelectedRoleId(role.id);
                                setCreatingNewRole(false);
                              }}
                            >
                              <h2 className="text-lg font-semibold">
                                {role.title}
                              </h2>
                              <p className="text-md">{role.description}</p>
                            </div>
                          ))}
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
                        </>
                      )}
                      {roles.isPending && (
                        <div className="flex items-center rounded-lg py-2">
                          <h2 className="text-lg italic">Loading...</h2>
                        </div>
                      )}
                      {roles.isSuccess && roles.data.length === 0 && (
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
          )}
        </section>
        <section></section>
        <DialogFooter className="mt-4">
          <Button
            className="border-none bg-cooper-yellow-500 text-white hover:bg-cooper-yellow-300"
            disabled={
              (companyMode === "existing" &&
                (!selectedCompanyId || !selectedRoleId) &&
                !creatingNewRole) ||
              isLoading
            }
            onClick={handleSubmit}
          >
            Start Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
