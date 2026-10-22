import { useEffect, useState } from "react";
import Image from "next/image";
import { useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem, FormMessage } from "@cooper/ui/form";
import { Input } from "@cooper/ui/input";
import { useReadOnly } from "@cooper/ui/read-only";

import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { CompanyCardPreview } from "../companies/company-card-preview";
import FilterBody from "../filters/filter-body";
import { FieldLabel } from "../form/fields";
import { FormSection } from "../form/form-section";
import { industryOptions } from "../onboarding/constants";

// Stands in for companyName / roleName while a new company or role is picked
// but not created yet; the review form creates it on submit or draft save
export const NEW_ITEM_ID = "__new__";

// Form fields for a not-yet-created company or role. They aren't in the review
// form's schema, so read them with form.getValues().
export const NEW_COMPANY_NAME_FIELD = "newCompanyName";
export const NEW_COMPANY_LOCATION_FIELD = "companyLocationId";
export const NEW_ROLE_TITLE_FIELD = "newRoleTitle";
// Existing form field reused for the new company's industry
export const NEW_COMPANY_INDUSTRY_FIELD = "industry";

/**
 * What's missing before a pending new company or role can be created, or null
 * when nothing is pending or it's complete. Mirrors company.createWithRole's
 * limits.
 */
export function pendingCompanyRoleError(
  values: Record<string, unknown>,
): string | null {
  const text = (key: string) => {
    const value = values[key];
    return typeof value === "string" ? value.trim() : "";
  };
  const newCompany = values.companyName === NEW_ITEM_ID;
  const newRole = values.roleName === NEW_ITEM_ID;
  if (!newCompany && !newRole) return null;
  if (newCompany) {
    if (text(NEW_COMPANY_NAME_FIELD).length < 3)
      return "The new company's name must be at least 3 characters.";
    if (!text(NEW_COMPANY_INDUSTRY_FIELD))
      return "Pick an industry for the new company.";
    if (!text(NEW_COMPANY_LOCATION_FIELD))
      return "Pick a location for the new company.";
  }
  if (text(NEW_ROLE_TITLE_FIELD).length < 3)
    return "The new role's title must be at least 3 characters.";
  return null;
}

const INPUT_CLASS =
  "h-9 w-full rounded-lg border border-cooper-gray-150 text-sm shadow-none hover:bg-[#F6F6F6] focus:bg-white";

// "New" chip for a company or role that will be created with the review; its
// X (edit only) undoes it
function PendingItem({
  label,
  onRemove,
}: {
  label: string;
  onRemove?: () => void;
}) {
  return (
    <div className="flex h-9 w-full items-center justify-between gap-3 rounded-lg border border-cooper-gray-150 bg-white px-3 text-sm">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-cooper-gray-900">{label}</span>
        <span className="shrink-0 rounded bg-cooper-gray-150 px-1.5 py-0.5 text-xs text-cooper-gray-400">
          New
        </span>
      </div>
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
          className="shrink-0 rounded-full transition hover:bg-[#F6F6F6] hover:shadow-[0px_0px_0px_8px_#F6F6F6]"
        >
          <Image
            src="/svg/exitComparisonButton.svg"
            width={12}
            height={12}
            alt=""
          />
        </button>
      )}
    </div>
  );
}

export default function ExistingCompanyContent({
  allowNew = true,
}: {
  // Offer "+ Add ... as a new company/role" (off when editing a saved review)
  allowNew?: boolean;
}) {
  const form = useFormContext();
  const readOnly = useReadOnly();

  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [companyLocationSearch, setCompanyLocationSearch] = useState("");

  const companyValue = form.watch("companyName") as string | null | undefined;
  const roleValue = form.watch("roleName") as string | null | undefined;
  const isNewCompany = companyValue === NEW_ITEM_ID;
  const isNewRole = roleValue === NEW_ITEM_ID;
  const selectedCompanyId =
    companyValue && !isNewCompany ? companyValue : undefined;

  const newCompanyName = form.watch(NEW_COMPANY_NAME_FIELD) as
    | string
    | undefined;
  const newRoleTitle = form.watch(NEW_ROLE_TITLE_FIELD) as string | undefined;

  const companies = api.company.list.useQuery({
    sortBy: "rating",
    limit: 10000,
  });
  const roles = api.role.getByCompany.useQuery(
    { companyId: selectedCompanyId ?? "" },
    { enabled: !!selectedCompanyId },
  );
  const locationPrefix =
    companyLocationSearch.length >= 3
      ? companyLocationSearch.slice(0, 3).toLowerCase()
      : "";
  const companyLocations = api.location.getByPopularity.useQuery(
    { prefix: locationPrefix },
    { enabled: locationPrefix.length === 3 },
  );

  // A new company has no roles yet, so its role is always new too
  useEffect(() => {
    if (isNewCompany && !isNewRole) {
      form.setValue("roleName", NEW_ITEM_ID);
    }
  }, [isNewCompany, isNewRole, form]);

  const selectedCompany = companies.data?.find(
    (company) => company.id === selectedCompanyId,
  );

  // "+ Add ..." shows whenever what's typed isn't an exact existing name
  const addOption = (term: string, names: string[], kind: string) => {
    const trimmed = term.trim();
    if (!allowNew || !trimmed) return [];
    const exists = names.some(
      (name) => name.toLowerCase() === trimmed.toLowerCase(),
    );
    return exists
      ? []
      : [
          {
            id: NEW_ITEM_ID,
            value: NEW_ITEM_ID,
            label: `+ Add "${trimmed}" as a new ${kind}`,
          },
        ];
  };

  const companyOptions = [
    ...(companies.data ?? [])
      .filter(
        (company) =>
          !companySearchTerm ||
          company.name.toLowerCase().includes(companySearchTerm.toLowerCase()),
      )
      .slice(0, 50)
      .map((company) => ({
        id: company.id,
        label: company.name,
        value: company.id,
      })),
    ...addOption(
      companySearchTerm,
      (companies.data ?? []).map((company) => company.name),
      "company",
    ),
  ];

  const roleOptions = [
    ...(roles.data ?? []).map((role) => ({
      id: role.id,
      label: role.title,
      value: role.id,
    })),
    ...addOption(
      roleSearchTerm,
      (roles.data ?? []).map((role) => role.title),
      "role",
    ),
  ];

  const clearRole = () => {
    form.setValue("roleName", "");
    form.setValue(NEW_ROLE_TITLE_FIELD, "");
  };

  const clearNewCompany = () => {
    form.setValue("companyName", "");
    form.setValue(NEW_COMPANY_NAME_FIELD, "");
    form.setValue(NEW_COMPANY_INDUSTRY_FIELD, "");
    form.setValue(NEW_COMPANY_LOCATION_FIELD, "");
    clearRole();
  };

  return (
    <FormSection>
      <div className="flex w-full flex-col gap-2">
        {/* Company */}
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FieldLabel required>Company</FieldLabel>

              {selectedCompany ? (
                // Picked: shown as its card; the X (edit only) clears it
                <CompanyCardPreview
                  companyObj={selectedCompany}
                  className="w-full hover:cursor-default hover:bg-card"
                  action={
                    readOnly ? null : (
                      <button
                        type="button"
                        aria-label="Change company"
                        onClick={() => {
                          field.onChange("");
                          clearRole();
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
              ) : isNewCompany ? (
                <PendingItem
                  label={newCompanyName ?? ""}
                  onRemove={readOnly ? undefined : clearNewCompany}
                />
              ) : (
                <div className="relative w-full flex-1">
                  <FilterBody
                    variant="autocomplete"
                    title="Company"
                    options={companyOptions}
                    selectedOptions={[]}
                    placeholder="Enter"
                    singleSelect
                    onSearchChange={setCompanySearchTerm}
                    onSelectionChange={(selected) => {
                      const selectedId = selected[0];
                      if (selectedId === NEW_ITEM_ID) {
                        form.setValue(
                          NEW_COMPANY_NAME_FIELD,
                          companySearchTerm.trim(),
                        );
                        field.onChange(NEW_ITEM_ID);
                      } else if (selectedId) {
                        field.onChange(selectedId);
                      }
                      clearRole();
                      setCompanySearchTerm("");
                    }}
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* New company details */}
        {isNewCompany && !readOnly && (
          <div className="flex w-full flex-col gap-3 rounded-lg bg-cooper-gray-100 p-4">
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-cooper-gray-550">
                New company
              </p>
              <p className="text-sm text-cooper-gray-350">
                It&apos;s added when you submit. We&apos;ll verify it before it
                appears on the site.
              </p>
            </div>

            <FormField
              control={form.control}
              name={NEW_COMPANY_INDUSTRY_FIELD}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FieldLabel required>Industry</FieldLabel>
                  <FormControl className="relative w-full">
                    <FilterBody
                      variant="autocomplete"
                      title="Industry"
                      options={[...industryOptions]
                        .sort((a, b) => a.label.localeCompare(b.label))
                        .map((option) => ({
                          id: option.value,
                          label: option.label,
                          value: option.value,
                        }))}
                      selectedOptions={
                        typeof field.value === "string" && field.value
                          ? [field.value]
                          : []
                      }
                      placeholder="Enter"
                      singleSelect
                      onSelectionChange={(selected) =>
                        field.onChange(selected[0] ?? "")
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* The company's own location, separate from this review's job
                location */}
            <FormField
              control={form.control}
              name={NEW_COMPANY_LOCATION_FIELD}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FieldLabel required>Company location</FieldLabel>
                  <FormControl className="relative w-full">
                    <FilterBody
                      variant="location"
                      title="Company location"
                      options={(companyLocations.data ?? []).map(
                        (location) => ({
                          id: location.id,
                          label: prettyLocationName(location),
                        }),
                      )}
                      selectedOptions={
                        typeof field.value === "string" && field.value
                          ? [field.value]
                          : []
                      }
                      onSearchChange={setCompanyLocationSearch}
                      onSelectionChange={(selected) =>
                        field.onChange(selected[selected.length - 1] ?? "")
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Role */}
        <FormField
          control={form.control}
          name="roleName"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col pt-3">
              <FieldLabel required>Role</FieldLabel>

              {isNewCompany ? (
                // A new company has no roles, so just name it
                <Input
                  placeholder="Enter"
                  className={INPUT_CLASS}
                  value={newRoleTitle ?? ""}
                  disabled={readOnly}
                  onChange={(event) =>
                    form.setValue(NEW_ROLE_TITLE_FIELD, event.target.value)
                  }
                />
              ) : isNewRole ? (
                <PendingItem
                  label={newRoleTitle ?? ""}
                  onRemove={readOnly ? undefined : clearRole}
                />
              ) : (
                <div className="relative w-full flex-1">
                  <FilterBody
                    variant="autocomplete"
                    title="Role"
                    options={selectedCompanyId ? roleOptions : []}
                    selectedOptions={
                      typeof field.value === "string" && field.value
                        ? [field.value]
                        : []
                    }
                    placeholder={
                      selectedCompanyId ? "Enter" : "Select a company first"
                    }
                    singleSelect
                    onSearchChange={setRoleSearchTerm}
                    onSelectionChange={(selected) => {
                      const selectedId = selected[0];
                      if (selectedId === NEW_ITEM_ID) {
                        form.setValue(
                          NEW_ROLE_TITLE_FIELD,
                          roleSearchTerm.trim(),
                        );
                        field.onChange(NEW_ITEM_ID);
                      } else {
                        field.onChange(selectedId ?? "");
                      }
                      setRoleSearchTerm("");
                    }}
                  />
                </div>
              )}
              {isNewRole && !isNewCompany && (
                <p className="text-sm text-cooper-gray-350">
                  It&apos;s added when you submit. We&apos;ll verify it before
                  it appears on the site.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSection>
  );
}
