import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter } from "bad-words";
import Fuse from "fuse.js";
import { Form, FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

import { FormControl, FormField, FormItem, FormMessage } from "@cooper/ui/form";
import { useCustomToast } from "@cooper/ui/hooks/use-custom-toast";
import { Input } from "@cooper/ui/input";
import { Label } from "@cooper/ui/label";
import { Textarea } from "@cooper/ui/textarea";
import { Checkbox } from "@cooper/ui/checkbox";

import type { RoleRequestType } from "../new-role-dialogue";
import { api } from "~/trpc/react";
import { Select } from "../../themed/onboarding/select";
import { FormSection } from "../../form/form-section";
import { FormLabel } from "../../themed/onboarding/form";
import { industryOptions } from "../../onboarding/constants";
import LocationBox from "../../location";

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

export default function ExistingCompanyContent({
  profileId,
}: {
  profileId?: string;
}) {
  const router = useRouter();

  const [selectedCompanyId, setSelectedCompanyId] = useState<
    string | undefined
  >();
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>();
  const [creatingNewRole, setCreatingNewRole] = useState<boolean>(false);
  const [showNewCompany, setShowNewCompany] = useState<boolean>(false);

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
    },
  });

  function handleUpdateCompanyId(newId: string | undefined) {
    newRoleForm.setValue("companyId", newId ?? "");
    setSelectedCompanyId(newId);
  }

  const form = useFormContext();

  return (
    <FormSection>
      <div className="flex flex-col gap-6 pt-4 w-full">
        {/* Company Section */}
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-14 pl-2 md:pl-0 w-full">
              <FormLabel className="text-sm text-cooper-gray-400 font-semibold flex-shrink-0">
                Company name<span className="text-[#FB7373]">*</span>
              </FormLabel>

              <div className="relative flex-1 w-full">
                <Select
                  options={
                    companies.data?.filter(Boolean).map((company) => ({
                      value: company.id,
                      label: company.name,
                    })) ?? []
                  }
                  placeholder="Select"
                  className="w-full border-cooper-gray-150 text-sm h-10"
                  value={field.value ?? ""}
                  onClear={() => field.onChange(undefined)}
                  onChange={(e) => {
                    const newId = e.target.value;
                    field.onChange(newId);
                    setSelectedRoleId(undefined);
                    handleUpdateCompanyId(newId);
                    if (newId) {
                      setShowNewCompany(false);
                    }
                  }}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* "I don't see my company" checkbox */}

        <div className="flex items-center gap-2 flex-1">
          <Checkbox
            checked={showNewCompany}
            onCheckedChange={(checked) => {
              setShowNewCompany(checked === true);
              if (checked) {
                form.setValue("companyName", "");
                setSelectedCompanyId(undefined);
              }
            }}
          />
          <Label className="text-sm text-cooper-gray-400 cursor-pointer">
            I don't see my company
          </Label>
        </div>

        {/* "Add Your Company" gray box section */}
        {showNewCompany && (
          <div className="bg-cooper-gray-100 rounded-lg p-6 flex flex-col gap-4 w-full">
            <div className="text-lg font-semibold text-cooper-gray-400">
              Add Your Company
            </div>
            <div className="text-xs text-cooper-gray-350">
              We'll verify this information before it appears on the website as
              a review.
            </div>

            {/* Company Name */}
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-14 w-full">
                  <FormLabel className="text-sm font-semibold text-cooper-gray-400 md:w-60 text-right flex-shrink-0">
                    Company Name<span className="text-[#FB7373]">*</span>
                  </FormLabel>
                  <FormControl className="flex-1">
                    <Input
                      placeholder="Enter"
                      className="w-full border-cooper-gray-150 text-sm h-10"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Industry */}
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-14 w-full">
                  <FormLabel className="text-sm font-semibold text-cooper-gray-400 md:w-60 text-right flex-shrink-0">
                    Industry<span className="text-[#FB7373]">*</span>
                  </FormLabel>
                  <div className="relative flex-1 w-full">
                    <Select
                      options={industryOptions}
                      placeholder="Search"
                      className="w-full border-cooper-gray-150 text-sm h-10"
                      value={field.value ?? ""}
                      onClear={() => field.onChange(undefined)}
                      onChange={(e) => {
                        const value =
                          e.target.value === "" ? undefined : e.target.value;
                        field.onChange(value);
                      }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location - you'll need to add locationId to form schema if not already */}
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-14 w-full">
                  <FormLabel className="text-sm font-semibold text-cooper-gray-400 md:w-60 text-right flex-shrink-0">
                    Location<span className="text-[#FB7373]">*</span>
                  </FormLabel>
                  <FormControl className="flex-1">
                    <LocationBox
                      searchBar={false}
                      form={form}
                      locationLabel=""
                      setSearchTerm={() => {}}
                      locationValuesAndLabels={[]}
                      setLocationLabel={() => {}}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Your Role */}
            <FormField
              control={form.control}
              name="roleName"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-14 w-full">
                  <FormLabel className="text-sm font-semibold text-cooper-gray-400 flex-shrink-0">
                    Your Role<span className="text-[#FB7373]">*</span>
                  </FormLabel>
                  <FormControl className="flex-1">
                    <Input
                      placeholder="Enter"
                      className="w-full border-cooper-gray-150 text-sm h-10"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Your Role section (only show when company is selected and not showing new company) */}
        <>
          <FormField
            control={form.control}
            name="roleName"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-14 pl-2 md:pl-0 w-full">
                <FormLabel className="text-sm font-semibold text-cooper-gray-400 flex-shrink-0">
                  Your Role<span className="text-[#FB7373]">*</span>
                </FormLabel>

                <div className="relative flex-1 w-full">
                  <Select
                    onClear={() => field.onChange(undefined)}
                    options={
                      roles.data?.map((r) => ({
                        value: r.id,
                        label: r.title,
                      })) ?? []
                    }
                    disabled={!selectedCompanyId}
                    className="w-full border-cooper-gray-150 text-sm h-10"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const newRoleId = e.target.value;
                      field.onChange(newRoleId);
                      setSelectedRoleId(newRoleId);
                      setCreatingNewRole(false);
                    }}
                    onFocus={() => setCreatingNewRole(false)}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* "I don't see my role" checkbox */}

          <div className="flex items-center gap-2 flex-1">
            <Checkbox
              checked={creatingNewRole}
              onCheckedChange={(checked) => {
                setCreatingNewRole(checked === true);
                if (checked) {
                  setSelectedRoleId(undefined);
                  form.setValue("roleName", "");
                }
              }}
            />
            <Label className="text-sm text-cooper-gray-400 cursor-pointer">
              I don't see my role
            </Label>
          </div>

          {/* Create New Role Section */}
          {creatingNewRole && (
            <article className="bg-cooper-gray-100 rounded-lg p-6">
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
      </div>
    </FormSection>
  );
}
