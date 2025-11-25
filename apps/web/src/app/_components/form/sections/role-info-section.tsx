"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cooper/ui/form";
import { Input } from "@cooper/ui/input";
import { Textarea } from "@cooper/ui/textarea";

import { FormSection } from "~/app/_components/form/form-section";
import { api } from "~/trpc/react";
import LocationBox from "../../location";
import { RadioGroup, RadioGroupItem } from "node_modules/@cooper/ui/src/radio-group";
import { Label } from "node_modules/@cooper/ui/src/label";
import { Select } from "../../themed/onboarding/select";
import { industryOptions } from "../../onboarding/constants";

/**
 * ReviewSection component renders form fields for writing a co-op review.
 */
export function RoleInfoSection() {
  const form = useFormContext();

  const [locationLabel, setLocationLabel] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [prefix, setPrefix] = useState<string>("");

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

  return (
    <FormSection>
      <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <Label>Industry</Label>
                    <FormControl>
                      <Select
                        placeholder="Select an industry"
                        options={industryOptions}
                        className="min-w-full max-w-fit border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
      <LocationBox
          searchBar={false}
          form={form}
          locationLabel={locationLabel}
          setSearchTerm={setSearchTerm}
          locationValuesAndLabels={locationValuesAndLabels}
          setLocationLabel={setLocationLabel}
        />
      <FormField
        control={form.control}
        name="workEnvironment"
        render={({ field }) => (
          <FormItem className="space-y-6">
            <FormLabel>Job type*</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                defaultValue={field.value}
                className="flex flex-col space-y-3"
              >
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="coop"
                      checked={field.value === "coop"}
                    />
                  </FormControl>
                  <FormLabel>Co-op</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="internship"
                      checked={field.value === "internship"}
                    />
                  </FormControl>
                  <FormLabel>Internship</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="parttime"
                      checked={field.value === "parttime"}
                    />
                  </FormControl>
                  <FormLabel>Part time</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
        
        <FormField
          control={form.control}
          name="hourlyPay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hourly Pay (USD)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
    </FormSection>
  );
}
