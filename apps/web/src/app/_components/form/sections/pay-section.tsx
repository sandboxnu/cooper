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
import {
  RadioGroup,
  RadioGroupItem,
} from "node_modules/@cooper/ui/src/radio-group";
import { Checkbox } from "node_modules/@cooper/ui/src/checkbox";

/**
 * ReviewSection component renders form fields for writing a co-op review.
 */
export function PaySection() {
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
        name="hourlyPay"
        render={({ field }) => (
          <FormItem className="rounded-md pb-10 flex flex-col pt-6">
            <FormLabel className="text-sm font-medium block  text-cooper-gray-400 ">
              Pay<span className="text-[#FB7373]">*</span>
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
      <FormField
        control={form.control}
        name="overtimePay"
        render={({ field }) => (
          <FormItem className="rounded-md pb-10 flex flex-col pt-6">
            <FormLabel className="text-sm font-medium block  text-cooper-gray-400">
              Overtime Pay<span className="text-[#FB7373]">*</span>
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
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="drugTest"
        render={({ field }) => (
          <FormItem className="flex flex-col pt-6 ">
            <FormLabel className="text-cooper-gray-400 text-sm ">
              Drug test required<span className="text-[#FB7373]">*</span>
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                defaultValue={field.value}
                className="flex flex-row space-x-3"
              >
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="yes"
                      checked={field.value === "yes"}
                    />
                  </FormControl>
                  <FormLabel className="text-cooper-gray-450 text-sm">
                    Yes
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="no" checked={field.value === "no"} />
                  </FormControl>
                  <FormLabel className="text-cooper-gray-450 text-sm">
                    No
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
