import { useEffect, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter } from "bad-words";
import Fuse from "fuse.js";
import { useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";
import { Checkbox } from "@cooper/ui/checkbox";
import { FormControl, FormField, FormItem, FormMessage } from "@cooper/ui/form";
import { useCustomToast } from "@cooper/ui/hooks/use-custom-toast";
import { Input } from "@cooper/ui/input";
import { Label } from "@cooper/ui/label";
import { useReadOnly } from "@cooper/ui/read-only";

import type { RoleRequestType } from "../roles/new-role-dialogue";
import { api } from "~/trpc/react";
import { CompanyCardPreview } from "../companies/company-card-preview";
import { FieldLabel, OPTION_LABEL_CLASS } from "../form/fields";
import { FormSection } from "../form/form-section";
import LocationBox from "../location";
import { industryOptions } from "../onboarding/constants";
import FilterBody from "../filters/filter-body";

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
  // description: z
  //   .string()
  //   .min(10, {
  //     message: "The review must be at least 10 characters.",
  //   })
  //   .max(500, {
  //     message: "The description must be at most 500 characters.",
  //   })
  //   .refine((val) => !filter.isProfane(val), {
  //     message: "The description cannot contain profane words.",
  //   }),
  companyId: z.string(),
  createdBy: z.string(),
});

export default function ExistingCompanyContent({
  profileId,
}: {
  profileId?: string;
}) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<
    string | undefined
  >();
  const [creatingNewRole, setCreatingNewRole] = useState<boolean>(false);
  const [showNewCompany, setShowNewCompany] = useState<boolean>(false);
  const [locationLabel, setLocationLabel] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const prefix =
    searchTerm.length >= 3 ? searchTerm.slice(0, 3).toLowerCase() : "";
  const [companySearchTerm, setCompanySearchTerm] = useState<string>("");
  const [newCompanyName, setNewCompanyName] = useState<string>("");

  const { toast } = useCustomToast();

  const companies = api.company.list.useQuery({
    sortBy: "rating",
    limit: 10000,
  });

  const roles = api.role.getByCompany.useQuery(
    {
      companyId: selectedCompanyId ?? "",
    },
    {
      enabled: !!selectedCompanyId,
    },
  );

  // Location fetching logic for new company
  useEffect(() => {
    if (!showNewCompany) {
      setLocationLabel("");
      setSearchTerm("");
      setNewCompanyName("");
    }
  }, [showNewCompany]);

  const locationsToUpdate = api.location.getByPopularity.useQuery(
    { prefix },
    { enabled: prefix.length === 3 },
  );

  const locationValuesAndLabels = locationsToUpdate.data
    ? locationsToUpdate.data.map((location) => {
        return {
          value: location.id,
          label:
            location.city +
            (location.state ? `, ${location.state}` : "") +
            ", " +
            location.country,
        };
      })
    : [];

  const extendedRoleSchema = roleSchema.extend({
    title: roleSchema.shape.title.refine(
      (val) => {
        if (!roles.data || !selectedCompanyId) return true;
        const fuseOptions = {
          keys: ["title"],
          threshold: 0.1,
          includeScore: true,
        };

        const fuse = new Fuse(roles.data, fuseOptions);
        const searchResults = fuse.search(val.trim().toLowerCase());
        const hasSimilarRole = searchResults.some(
          (result) => result.score !== undefined && result.score < 0.1,
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
    onSuccess: (data) => {
      toast.success("Role created successfully!");
      const createdRole = data[0];
      if (createdRole) {
        form.setValue("roleName", createdRole.id);
        setCreatingNewRole(false);
        // Refresh roles list
        void roles.refetch();
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  const createCompanyWithRoleMutation = api.company.createWithRole.useMutation({
    onSuccess: async ({ roleId, companyId }) => {
      toast.success("Company and role created successfully!");
      setNewCompanyName("");
      form.setValue("industry", "");
      form.setValue("title", "");
      form.setValue("locationId", "");
      await companies.refetch();
      setSelectedCompanyId(companyId);
      form.setValue("companyName", companyId);
      form.setValue("roleName", roleId);
      setShowNewCompany(false);
      setCreatingNewRole(false);
      void roles.refetch();
    },
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
  const readOnly = useReadOnly();

  // Get the selected company from the form
  const selectedCompanyName = form.watch("companyName") as string;

  // Sync selectedCompanyId from form value (handles pre-populated edit mode)
  useEffect(() => {
    if (selectedCompanyName && selectedCompanyName !== selectedCompanyId) {
      setSelectedCompanyId(selectedCompanyName);
    }
  }, [selectedCompanyName, selectedCompanyId]);
  const selectedCompany = companies.data?.find(
    (company) => company.id === selectedCompanyName,
  );

  const handleCreateCompanyWithRole = async () => {
    const companyName = newCompanyName;
    const industry = form.getValues("industry") as string;
    const locationId = form.getValues("locationId") as string;
    const roleTitle =
      (form.getValues("title") as string) ||
      (form.getValues("roleName") as string);

    // Validate required fields
    if (!companyName || companyName.length < 3) {
      toast.error("Company name must be at least 3 characters.");
      return;
    }
    if (!industry) {
      toast.error("Please select an industry.");
      return;
    }
    if (!locationId) {
      toast.error("Please select a location.");
      return;
    }
    if (!roleTitle || roleTitle.length < 3) {
      toast.error("Role title must be at least 3 characters.");
      return;
    }

    await createCompanyWithRoleMutation.mutateAsync({
      companyName: companyName.trim(),
      description: `Company in ${industry} industry`,
      industry,
      roleTitle: roleTitle.trim(),
      roleDescription: "Role description",
      createdBy: profileId ?? "",
    });
  };

  const handleCreateRole = async () => {
    if (!selectedCompanyId) {
      toast.error("Please select a company first.");
      return;
    }

    // Only validate the title field since companyId and createdBy are set programmatically
    const isTitleValid = await newRoleForm.trigger("title");
    if (!isTitleValid) {
      const errorMessage = newRoleForm.formState.errors.title?.message;
      toast.error(errorMessage ?? "Please enter a valid role title.");
      return;
    }

    const values = newRoleForm.getValues();

    await newRoleMutation.mutateAsync({
      title: values.title,
      description: values.description,
      companyId: selectedCompanyId,
      createdBy: profileId ?? "",
    });
  };

  return (
    <FormSection>
      <div className="flex w-full flex-col gap-2">
        {/* Company Section */}
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FieldLabel required>Company</FieldLabel>

              {/* Once picked, the company shows as a card; its X (edit only)
                  clears it and brings back the search field */}
              {selectedCompany && (
                <CompanyCardPreview
                  companyObj={selectedCompany}
                  className="w-full hover:cursor-default hover:bg-card"
                  action={
                    readOnly ? null : (
                      <button
                        type="button"
                        aria-label="Change company"
                        onClick={() => {
                          field.onChange(undefined);
                          setSelectedCompanyId(undefined);
                          form.setValue("roleName", "");
                          setCompanySearchTerm("");
                        }}
                        className="rounded-full transition hover:bg-[#F6F6F6] hover:shadow-[0px_0px_0px_12px_#F6F6F6]"
                      >
                        <Image
                          src="/svg/exitComparisonButton.svg"
                          width={14}
                          height={14}
                          alt=""
                          style={{ minHeight: "14px", minWidth: "14px" }}
                        />
                      </button>
                    )
                  }
                />
              )}
              <div
                className={cn(
                  "relative w-full flex-1",
                  selectedCompany && "hidden",
                )}
              >
                <FilterBody
                  variant="autocomplete"
                  title="Company"
                  options={(() => {
                    const allCompanies =
                      companies.data?.filter(Boolean).map((company) => ({
                        id: company.id,
                        label: company.name,
                        value: company.id,
                      })) ?? [];
                    if (companySearchTerm) {
                      const filtered = allCompanies.filter((c) =>
                        c.label
                          .toLowerCase()
                          .includes(companySearchTerm.toLowerCase()),
                      );
                      return filtered.slice(0, 50);
                    }
                    return allCompanies.slice(0, 50);
                  })()}
                  selectedOptions={
                    field.value &&
                    typeof field.value === "string" &&
                    field.value.length > 0
                      ? [field.value]
                      : []
                  }
                  placeholder="Enter"
                  singleSelect
                  onSearchChange={setCompanySearchTerm}
                  onSelectionChange={(selected) => {
                    const selectedId = selected[0];
                    if (selectedId) {
                      field.onChange(selectedId);
                      handleUpdateCompanyId(selectedId);
                      setShowNewCompany(false);
                    } else {
                      field.onChange(undefined);
                      setSelectedCompanyId(undefined);
                    }
                    setCompanySearchTerm("");
                  }}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* "I don't see my company" checkbox */}

        <div
          className={cn(
            "flex flex-1 items-center gap-2",
            (readOnly || selectedCompany) && "hidden",
          )}
          onClick={() => !selectedCompany && setShowNewCompany(!showNewCompany)}
        >
          <Checkbox
            checked={showNewCompany}
            disabled={!!selectedCompany}
            onCheckedChange={(checked) => {
              setShowNewCompany(checked === true);
              if (checked) {
                form.setValue("companyName", "");
                setSelectedCompanyId(undefined);
                setLocationLabel("");
                setSearchTerm("");
              } else {
                form.setValue("companyName", "");
                form.setValue("industry", "");
                form.setValue("locationId", "");
                form.setValue("title", "");
                setSelectedCompanyId(undefined);
                setLocationLabel("");
                setSearchTerm("");
              }
            }}
          />
          <Label className={OPTION_LABEL_CLASS}>I don't see my company</Label>
        </div>

        {/* "Add Your Company" gray box section */}
        {showNewCompany && (
          <div className="flex w-full flex-col gap-3 rounded-lg bg-cooper-gray-100 p-4">
            <div className="text-cooper-gray-550 text-sm font-semibold">
              Add your company
            </div>
            <p className="-mt-2 text-sm text-cooper-gray-350">
              We'll verify this before it appears on the site.
            </p>

            {/* Company Name */}
            <div className="flex w-full flex-col">
              <FieldLabel required>Company name</FieldLabel>
              <Input
                placeholder="Enter"
                className="h-9 w-full rounded-lg border border-cooper-gray-150 text-sm shadow-none hover:bg-[#F6F6F6] focus:bg-white"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
              />
            </div>

            {/* Industry */}
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem className="flex flex-1 flex-col">
                  <FieldLabel required>Industry</FieldLabel>
                  <FormControl className="relative w-full">
                    <FilterBody
                      variant="autocomplete"
                      title="Industry"
                      options={[...industryOptions]
                        .sort((a, b) => a.label.localeCompare(b.label))
                        .map((o) => ({
                          id: o.value,
                          label: o.label,
                          value: o.value,
                        }))}
                      selectedOptions={
                        field.value &&
                        typeof field.value === "string" &&
                        field.value.length > 0
                          ? [field.value]
                          : []
                      }
                      placeholder="Enter"
                      singleSelect
                      onSelectionChange={(selected) => {
                        field.onChange(selected[0] ?? undefined);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location - Fixed */}
            <FormField
              control={form.control}
              name="locationId"
              render={() => (
                <FormItem className="flex w-full flex-col">
                  <FieldLabel required>Location</FieldLabel>
                  <FormControl className="flex-1">
                    <LocationBox
                      searchBar={false}
                      form={form}
                      locationLabel={locationLabel}
                      setSearchTerm={setSearchTerm}
                      locationValuesAndLabels={locationValuesAndLabels}
                      setLocationLabel={setLocationLabel}
                      locationsToUpdate={locationsToUpdate}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Your Role */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FieldLabel required>Role</FieldLabel>
                  <FormControl className="flex-1">
                    <Input
                      placeholder="Enter"
                      className="h-9 w-full rounded-lg border border-cooper-gray-150 text-sm shadow-none hover:bg-[#F6F6F6] focus:bg-white"
                      value={
                        field.value &&
                        typeof field.value === "string" &&
                        field.value.length > 0
                          ? field.value
                          : ""
                      }
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button for Creating Company */}
            <div className="flex justify-end pt-1">
              <Button
                type="button"
                onClick={handleCreateCompanyWithRole}
                disabled={createCompanyWithRoleMutation.isPending}
                className="h-9 rounded-lg border-none bg-cooper-gray-550 px-4 text-sm font-semibold text-white hover:bg-cooper-gray-600"
              >
                {createCompanyWithRoleMutation.isPending
                  ? "Creating..."
                  : "Create Company & Role"}
              </Button>
            </div>
          </div>
        )}

        {/* Your Role section (only show when company is selected and not showing new company) */}
        <div className="flex flex-col gap-2 pt-3">
          <FormField
            control={form.control}
            name="roleName"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full ">
                <FieldLabel required>Role</FieldLabel>

                <div className="relative flex-1 w-full">
                  <FilterBody
                    variant="autocomplete"
                    title="Role"
                    options={
                      roles.data?.map((r) => ({
                        id: r.id,
                        label: r.title,
                        value: r.id,
                      })) ?? []
                    }
                    selectedOptions={
                      field.value &&
                      typeof field.value === "string" &&
                      field.value.length > 0
                        ? [field.value]
                        : []
                    }
                    placeholder={
                      selectedCompanyId ? "Enter" : "Select a company first"
                    }
                    singleSelect
                    onSelectionChange={(selected) => {
                      const selectedId = selected[0];
                      field.onChange(selectedId ?? undefined);
                      setCreatingNewRole(false);
                    }}
                  />
                </div>
                <FormMessage />
                {selectedCompanyId &&
                  !showNewCompany &&
                  roles.data?.length === 0 && (
                    <p className="mt-1 text-sm text-red-500">
                      No roles available for this company. Please add a role
                      first.
                    </p>
                  )}
              </FormItem>
            )}
          />

          {/* "I don't see my role" checkbox */}

          <div
            className={cn(
              "flex flex-1 items-center gap-2",
              readOnly && "hidden",
            )}
          >
            <Checkbox
              checked={creatingNewRole}
              onCheckedChange={(checked) => {
                setCreatingNewRole(checked === true);
                form.setValue("roleName", "");
                if (!checked) {
                  newRoleForm.setValue("title", "");
                }
              }}
            />
            <Label className={OPTION_LABEL_CLASS}>I don't see my role</Label>
          </div>

          {/* Create New Role Section */}
          {creatingNewRole && (
            <div className="flex w-full flex-col gap-3 rounded-lg bg-cooper-gray-100 p-4">
              <div className="text-cooper-gray-550 text-sm font-semibold">
                Add your role
              </div>
              <p className="-mt-2 text-sm text-cooper-gray-350">
                We'll verify this before it appears on the site.
              </p>

              {/* Company Name */}
              <FormField
                control={newRoleForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FieldLabel required>Role</FieldLabel>
                    <FormControl className="flex-1">
                      <Input
                        placeholder="Enter"
                        className="h-9 w-full rounded-lg border border-cooper-gray-150 text-sm shadow-none hover:bg-[#F6F6F6] focus:bg-white"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button for Creating Role */}
              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  onClick={handleCreateRole}
                  disabled={newRoleMutation.isPending}
                  className="h-9 rounded-lg border-none bg-cooper-gray-550 px-4 text-sm font-semibold text-white hover:bg-cooper-gray-600"
                >
                  {newRoleMutation.isPending ? "Creating..." : "Create Role"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </FormSection>
  );
}
