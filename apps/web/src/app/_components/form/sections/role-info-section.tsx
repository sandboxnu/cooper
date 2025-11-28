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

import { FormSection } from "~/app/_components/form/form-section";
import { api } from "~/trpc/react";
import LocationBox from "../../location";
import {
  RadioGroup,
  RadioGroupItem,
} from "node_modules/@cooper/ui/src/radio-group";
import { Label } from "node_modules/@cooper/ui/src/label";
import { Select } from "../../themed/onboarding/select";
import { industryOptions } from "../../onboarding/constants";
import { Checkbox } from "node_modules/@cooper/ui/src/checkbox";

/**
 * ReviewSection component renders form fields for writing a co-op review.
 */
export function RoleInfoSection() {
  const form = useFormContext();

  const [locationLabel, setLocationLabel] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [prefix, setPrefix] = useState<string>("");
  const [isUnpaid, setIsUnpaid] = useState<boolean>(false);

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

  // NEW: clear local state when form locationId is cleared
  const locationId = form.watch("locationId");
  useEffect(() => {
    if (!locationId) {
      setLocationLabel("");
      setSearchTerm("");
    }
  }, [locationId]);

  return (
    <FormSection>
      <FormField
        control={form.control}
        name="industry"
        render={({ field }) => (
          <FormItem className="pl-2 md:pl-0 flex flex-row gap-14 items-center pt-6">
            <FormLabel className="text-sm text-cooper-gray-400 font-medium md:w-60 text-right">
              Industry
            </FormLabel>
            <div>
              <Select
                placeholder="Search by industry..."
                options={industryOptions}
                className="md:w-[305px] border-2 rounded-lg h-10 text-sm text-cooper-gray-350 border-cooper-gray-150"
                value={field.value ?? ""}
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
          <FormItem className="flex flex-row pl-2 md:pl-0 gap-14 items-center pt-6">
            <FormLabel className="text-sm text-cooper-gray-400 font-medium md:w-60 text-right">
              Location
            </FormLabel>
            <FormControl>
              <LocationBox
                searchBar={false}
                form={form}
                locationLabel={locationLabel}
                setSearchTerm={setSearchTerm}
                locationValuesAndLabels={locationValuesAndLabels}
                setLocationLabel={setLocationLabel}
              />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="jobType"
        render={({ field }) => (
          <FormItem className="rounded-md flex flex-row gap-14 pl-2 md:pl-0 pt-6 space-y-0">
            <FormLabel className="text-sm font-medium block text-cooper-gray-400 md:w-60 text-right">
              Job type
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col gap-2.5 "
              >
                <div className="flex items-center gap-3 ">
                  <RadioGroupItem
                    value="coop"
                    id="coop"
                    checked={field.value === "coop"}
                  />
                  <Label
                    htmlFor="coop"
                    className="text-cooper-gray-450 font-normal cursor-pointer"
                  >
                    Co-op
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem
                    value="internship"
                    id="internship"
                    checked={field.value === "internship"}
                  />
                  <Label
                    htmlFor="internship"
                    className="text-cooper-gray-450 font-normal cursor-pointer"
                  >
                    Internship
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem
                    value="parttime"
                    id="parttime"
                    checked={field.value === "parttime"}
                  />
                  <Label
                    htmlFor="parttime"
                    className="text-cooper-gray-450 font-normal cursor-pointer"
                  >
                    Part time
                  </Label>
                </div>
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
          <FormItem className="rounded-md pb-10 flex flex-row pl-2 md:pl-0 gap-12  pt-6 items-center">
            <FormLabel className="text-sm font-medium block  text-cooper-gray-400 md:w-60 text-right">
              Hourly pay
            </FormLabel>
            <FormControl>
              <div className="flex items-center gap-2 flex-row">
                <div className="flex items-center ">
                  <Input
                    {...field}
                    placeholder="$"
                    className="border-2 border-cooper-gray-150 rounded-lg h-9 w-20 text-cooper-gray-400 bg-transparent text-sm pl-4 focus:outline-none"
                    disabled={isUnpaid}
                  />
                </div>
                <div
                  className="flex items-center gap-2 rounded-md cursor-pointer"
                  onClick={() => setIsUnpaid(!isUnpaid)}
                >
                  <Checkbox
                    checked={isUnpaid}
                    className="border-cooper-yellow-500"
                  />
                  <span className="text-md font-small text-cooper-gray-400">
                    Unpaid
                  </span>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
