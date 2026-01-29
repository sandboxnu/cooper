import dayjs from "dayjs";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cooper/ui/form";

import { FormSection } from "~/app/_components/form/form-section";
import ExistingCompanyContent from "../../reviews/new-review/existing-company-content";
import { Select } from "../../themed/onboarding/select";
import { industryOptions } from "../../onboarding/constants";
import LocationBox from "../../location";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

/**
 * CoopCycleSection component renders form fields for selecting co-op cycle and year.
 */
export function BasicInfoSection({
  profileId,
}: {
  profileId: string | undefined;
}) {
  const form = useFormContext();
  const [locationLabel, setLocationLabel] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [prefix, setPrefix] = useState<string>("");

  // Need to evaluate whether this is a bad idea
  const currentYear = dayjs().year();
  const years = Array.from(
    { length: currentYear - 1999 },
    (_, index) => currentYear - index,
  );

  useEffect(() => {
    const newPrefix =
      searchTerm.length === 3 ? searchTerm.slice(0, 3).toLowerCase() : null;
    if (newPrefix && newPrefix !== prefix) {
      setPrefix(newPrefix);
    }
  }, [prefix, searchTerm]);

  const locationsToUpdate = api.location.getByPopularity.useQuery(
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

  const { data: locationByIdData } = api.location.getById.useQuery(
    { id: `${form.getValues("locationId")}` },
    { enabled: !!form.getValues("locationId") },
  );

  useEffect(() => {
    // ensures that location name persists across form states
    if (!locationLabel && locationByIdData) {
      const locationName =
        locationByIdData.city +
        (locationByIdData.state ? `, ${locationByIdData.state}` : "") +
        ", " +
        locationByIdData.country;
      setLocationLabel(locationName);
      setSearchTerm(locationName.slice(0, 3));
    }
  }, [locationByIdData, locationLabel]);

  const locationId = form.watch("locationId") as string;
  useEffect(() => {
    if (!locationId) {
      setLocationLabel("");
      setSearchTerm("");
    }
  }, [locationId]);

  return (
    <FormSection>
      <ExistingCompanyContent profileId={profileId} />

      <FormField
        control={form.control}
        name="jobType"
        render={({ field }) => (
          <FormItem className="flex flex-col w-full pt-4">
            <FormLabel className="text-sm font-bold text-cooper-gray-400">
              Job type<span className="text-[#FB7373]">*</span>
            </FormLabel>
            <FormControl className="relative w-full">
              <Select
                onClear={() => field.onChange(undefined)}
                options={[
                  { value: "Co-op", label: "Co-op" },
                  { value: "Internship", label: "Internship" },
                  { value: "Part time", label: "Part time" },
                ]}
                className="w-full border-cooper-gray-150 text-cooper-gray-350 text-sm h-10"
                value={
                  field.value &&
                  typeof field.value === "string" &&
                  field.value.length > 0
                    ? field.value
                    : ""
                }
                placeholder="Select"
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? undefined : e.target.value;
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="workTerm"
        render={({ field }) => (
          <FormItem className="flex flex-col flex-1 pt-4">
            <FormLabel className="text-sm font-bold text-cooper-gray-400">
              Co-op/internship term<span className="text-[#FB7373]">*</span>
            </FormLabel>
            <FormControl className="relative w-full">
              <Select
                onClear={() => field.onChange(undefined)}
                options={[
                  { value: "SPRING", label: "Spring" },
                  { value: "SUMMER", label: "Summer" },
                  { value: "FALL", label: "Fall" },
                ]}
                className="w-full border-cooper-gray-150 text-cooper-gray-350 text-sm h-10"
                value={
                  field.value &&
                  typeof field.value === "string" &&
                  field.value.length > 0
                    ? field.value
                    : ""
                }
                placeholder="Select"
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? undefined : e.target.value;
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="workYear"
        render={({ field }) => (
          <FormItem className="flex flex-col flex-1 pt-4">
            <FormLabel className="text-sm font-bold text-cooper-gray-400">
              Year of co-op/internship term
              <span className="text-[#FB7373]">*</span>
            </FormLabel>
            <FormControl className="relative w-full">
              <Select
                options={years.map((year) => ({
                  value: year,
                  label: year,
                }))}
                className="w-full border-2 h-10 rounded-lg text-sm text-cooper-gray-350 border-cooper-gray-150"
                placeholder="Select"
                onClear={() => field.onChange(undefined)}
                value={
                  field.value && field.value > 0 ? String(field.value) : ""
                }
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? undefined : Number(e.target.value);
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="industry"
        render={({ field }) => (
          <FormItem className="flex flex-col pt-4">
            <FormLabel className="text-sm text-cooper-gray-400 font-bold">
              Industry<span className="text-[#FB7373]">*</span>
            </FormLabel>
            <div>
              <Select
                placeholder="Search by industry..."
                options={industryOptions.sort((a, b) =>
                  a.label.localeCompare(b.label),
                )}
                className="border-2 rounded-lg h-10 text-sm text-cooper-gray-350 border-cooper-gray-150"
                value={
                  field.value &&
                  typeof field.value === "string" &&
                  field.value.length > 0
                    ? field.value
                    : ""
                }
                onClear={() => field.onChange(undefined)}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? undefined : String(e.target.value);
                  field.onChange(value);
                }}
              />
            </div>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="locationId"
        render={() => (
          <FormItem className="flex flex-col pt-4 w-full">
            <FormLabel className="text-sm text-cooper-gray-400 font-bold">
              Location<span className="text-[#FB7373]">*</span>
            </FormLabel>
            <FormControl className="w-full">
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
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
