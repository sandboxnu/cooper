import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem, FormMessage } from "@cooper/ui/form";

import {
  FieldLabel,
  FieldRow,
  SelectField,
} from "~/app/_components/form/fields";
import { FormSection } from "~/app/_components/form/form-section";
import { Input } from "~/app/_components/themed/onboarding/input";
import ExistingCompanyContent from "../../reviews/existing-company-content";
import LocationBox from "../../location";
import { api } from "~/trpc/react";

/**
 * BasicInfoSection renders the company, role, term and location fields.
 */
export function BasicInfoSection({
  profileId,
}: {
  profileId: string | undefined;
}) {
  const form = useFormContext();
  const [locationLabel, setLocationLabel] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const prefix =
    searchTerm.length >= 3 ? searchTerm.slice(0, 3).toLowerCase() : "";

  // Need to evaluate whether this is a bad idea
  const currentYear = dayjs().year();
  const currentMonth = dayjs().month() + 1;

  // Month when each term begins — used to block future-term reviews
  const TERM_START_MONTHS: Record<string, number> = {
    SPRING: 1, // January
    SUMMER: 5, // May
    FALL: 8, // August
  };

  const workTerm = form.watch("workTerm") as string | undefined;

  const termStartMonth = workTerm ? (TERM_START_MONTHS[workTerm] ?? 1) : 1;
  const maxYear =
    termStartMonth <= currentMonth ? currentYear : currentYear - 1;

  const years = Array.from(
    { length: maxYear - 1999 },
    (_, index) => maxYear - index,
  );

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

  useEffect(() => {
    const currentWorkYear = form.getValues("workYear") as number | undefined;
    if (currentWorkYear && currentWorkYear > maxYear) {
      form.setValue("workYear", undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxYear]);

  return (
    <FormSection>
      <ExistingCompanyContent profileId={profileId} />

      <FieldRow>
        <SelectField
          name="jobType"
          label="Job type"
          required
          options={[
            { id: "Co-op", label: "Co-op" },
            { id: "Internship", label: "Internship" },
          ]}
        />
        <SelectField
          name="workTerm"
          label="Term"
          required
          options={[
            { id: "SPRING", label: "Spring" },
            { id: "SUMMER", label: "Summer" },
            { id: "FALL", label: "Fall" },
          ]}
        />
      </FieldRow>

      <FieldRow>
        <SelectField
          name="workYear"
          label="Year"
          required
          numeric
          searchable
          options={years.map((year) => ({
            id: String(year),
            label: String(year),
          }))}
        />
        <FormField
          control={form.control}
          name="jobLength"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FieldLabel required>Job length (months)</FieldLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="Enter"
                  value={(field.value as number | null) ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  onClear={() => field.onChange(null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FieldRow>

      <FormField
        control={form.control}
        name="locationId"
        render={() => (
          <FormItem className="flex w-full flex-col">
            <FieldLabel required>Location</FieldLabel>
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
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
