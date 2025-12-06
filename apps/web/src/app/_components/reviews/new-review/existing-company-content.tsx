import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter } from "bad-words";
import Fuse from "fuse.js";
import { useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

import { FormControl, FormField, FormItem, FormMessage } from "@cooper/ui/form";
import { useCustomToast } from "@cooper/ui/hooks/use-custom-toast";
import { Input } from "@cooper/ui/input";
import { Label } from "@cooper/ui/label";
import { Checkbox } from "@cooper/ui/checkbox";
import { Button } from "@cooper/ui/button";

import type { RoleRequestType } from "../new-role-dialogue";
import { api } from "~/trpc/react";
import { Select } from "../../themed/onboarding/select";
import { FormSection } from "../../form/form-section";
import { FormLabel } from "../../themed/onboarding/form";
import { industryOptions } from "../../onboarding/constants";
import LocationBox from "../../location";
import { CompanyCardPreview } from "../../companies/company-card-preview";

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
  const [prefix, setPrefix] = useState<string>("");

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

  // Location fetching logic for new company
  useEffect(() => {
    const newPrefix =
      searchTerm.length === 3 ? searchTerm.slice(0, 3).toLowerCase() : null;
    if (newPrefix && newPrefix !== prefix) {
      setPrefix(newPrefix);
    }
  }, [prefix, searchTerm]);

  const locationsToUpdate = api.location.getByPrefix.useQuery(
    { prefix },
    { enabled: searchTerm.length === 3 },
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
    onSuccess: (roleId) => {
      toast.success("Company and role created successfully!");
      form.setValue("roleName", roleId);
      form.setValue("companyName", selectedCompany?.id ?? "");
      setShowNewCompany(false);
      setCreatingNewRole(false);
      void companies.refetch();
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

  // Get the selected company from the form
  const selectedCompanyName = form.watch("companyName") as string;
  const selectedCompany = companies.data?.find(
    (company) => company.id === selectedCompanyName,
  );

  const handleCreateCompanyWithRole = async () => {
    const companyName = form.getValues("companyName") as string;
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
      toast.error("Please enter a valid role title (at least 5 characters).");
      return;
    }

    const values = newRoleForm.getValues();

    await newRoleMutation.mutateAsync({
      title: values.title,
      description: values.description,
      companyId: selectedCompanyId,
      createdBy: profileId ?? "",
      jobType: "CO-OP",
    });
  };

  return (
    <FormSection>
      <div className="flex flex-col gap-2 pt-4 w-full">
        {/* Company Section */}
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
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
                  value={field.value as string}
                  onClear={() => field.onChange(undefined)}
                  onChange={(e) => {
                    const newId = e.target.value;
                    field.onChange(newId);
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
          <Label className="text-sm text-cooper-gray-550 font-bold cursor-pointer">
            I don't see my company
          </Label>
        </div>

        {/* Company Card - shown when company is selected */}
        {selectedCompany && (
          <div className="pt-2">
            <div className="text-sm text-cooper-gray-400 font-semibold mb-2">
              Adding a review for
            </div>
            <CompanyCardPreview
              companyObj={selectedCompany}
              className="w-[60%]"
            />
          </div>
        )}

        {/* "Add Your Company" gray box section */}
        {showNewCompany && (
          <div className="bg-cooper-gray-100 rounded-lg p-3.5 flex flex-col w-full">
            <div className="text-sm font-semibold text-cooper-gray-550">
              Add Your Company
            </div>
            <div className="text-xs text-cooper-gray-600">
              We'll verify this information before it appears on the website as
              a review.
            </div>

            {/* Company Name */}
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full pt-2.5">
                  <FormLabel className="text-xs font-bold text-cooper-gray-550 flex-shrink-0">
                    Company Name<span className="text-[#FB7373]">*</span>
                  </FormLabel>
                  <FormControl className="flex-1">
                    <Input
                      placeholder="Enter"
                      className="w-full border border-cooper-gray-150 text-sm h-10"
                      value={field.value as string}
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
                <FormItem className="flex flex-col w-full pt-2.5">
                  <FormLabel className="text-xs font-bold text-cooper-gray-550 flex-shrink-0">
                    Industry<span className="text-[#FB7373]">*</span>
                  </FormLabel>
                  <div className="relative flex-1 w-full">
                    <Select
                      options={industryOptions}
                      placeholder="Search"
                      className="w-full border border-cooper-gray-150 text-sm h-10"
                      value={field.value as string}
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

            {/* Location - Fixed */}
            <FormField
              control={form.control}
              name="locationId"
              render={() => (
                <FormItem className="flex flex-col pt-2.5 w-full">
                  <FormLabel className="text-xs font-bold text-cooper-gray-550 flex-shrink-0">
                    Location<span className="text-[#FB7373]">*</span>
                  </FormLabel>
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
                <FormItem className="flex flex-col pt-2.5 w-full">
                  <FormLabel className="text-xs font-bold text-cooper-gray-550 flex-shrink-0">
                    Your Role<span className="text-[#FB7373]">*</span>
                  </FormLabel>
                  <FormControl className="flex-1">
                    <Input
                      placeholder="Enter"
                      className="w-full border border-cooper-gray-150 text-sm h-10"
                      value={field.value as string}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button for Creating Company */}
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={handleCreateCompanyWithRole}
                disabled={createCompanyWithRoleMutation.isPending}
                className="bg-cooper-gray-550 hover:bg-cooper-gray-600 text-white rounded-lg px-8 py-3 text-lg font-semibold border-none"
              >
                {createCompanyWithRoleMutation.isPending
                  ? "Creating..."
                  : "Create Company & Role"}
              </Button>
            </div>
          </div>
        )}

        {/* Your Role section (only show when company is selected and not showing new company) */}
        <div className=" pt-4">
          <FormField
            control={form.control}
            name="roleName"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full ">
                <FormLabel className="text-sm font-semibold text-cooper-gray-400 flex-shrink-0">
                  Your Role<span className="text-[#FB7373]">*</span>
                </FormLabel>

                <div className="relative flex-1 w-full">
                  <Select
                    onClear={() => {
                      field.onChange(undefined);
                    }}
                    options={
                      roles.data?.map((r) => ({
                        value: r.id,
                        label: r.title,
                      })) ?? []
                    }
                    disabled={!selectedCompanyId}
                    className="w-full border-cooper-gray-150 text-sm h-10"
                    value={field.value as string}
                    placeholder="Select"
                    onChange={(e) => {
                      const newRoleId =
                        e.target.value === "" ? undefined : e.target.value;
                      field.onChange(newRoleId);
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

          <div className="flex items-center gap-2 flex-1 pt-2">
            <Checkbox
              checked={creatingNewRole}
              onCheckedChange={(checked) => {
                setCreatingNewRole(checked === true);
                if (checked) {
                  form.setValue("roleName", "");
                }
              }}
            />
            <Label className="text-sm text-cooper-gray-550 font-bold cursor-pointer">
              I don't see my role
            </Label>
          </div>

          {/* Create New Role Section */}
          {creatingNewRole && (
            <div className="bg-cooper-gray-100 rounded-lg p-3.5 flex flex-col w-full">
              <div className="text-sm font-semibold text-cooper-gray-550">
                Add Your Role
              </div>
              <div className="text-xs text-cooper-gray-600">
                We'll verify this information before it appears on the website
                as a review.
              </div>

              {/* Company Name */}
              <FormField
                control={newRoleForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full pt-2.5">
                    <FormLabel className="text-xs font-bold text-cooper-gray-550 flex-shrink-0">
                      Your Role<span className="text-[#FB7373]">*</span>
                    </FormLabel>
                    <FormControl className="flex-1">
                      <Input
                        placeholder="Enter"
                        className="w-full border border-cooper-gray-150 text-sm h-10"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button for Creating Role */}
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={handleCreateRole}
                  disabled={newRoleMutation.isPending}
                  className="bg-cooper-gray-550 hover:bg-cooper-gray-600 text-white rounded-lg px-8 py-3 text-lg font-semibold border-none"
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
