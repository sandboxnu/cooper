"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "node_modules/@cooper/ui/src/checkbox";
import {
  RadioGroup,
  RadioGroupItem,
} from "node_modules/@cooper/ui/src/radio-group";
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
  const locationId = form.watch("locationId") as string;
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
          <FormItem className="flex w-full flex-col rounded-md">
            <FormLabel className="block text-sm font-bold text-cooper-gray-400">
              Hourly pay<span className="text-[#FB7373]">*</span>
            </FormLabel>
            <FormControl>
              <div className="flex w-full flex-col gap-2">
                <Input
                  {...field}
                  placeholder="$"
                  className="border-cooper-gray-150 h-9 rounded-lg border-2 bg-transparent pl-4 text-sm text-cooper-gray-400 focus:outline-none"
                  disabled={isUnpaid}
                />
                <div
                  className="flex cursor-pointer items-center gap-2 rounded-md pt-2.5"
                  onClick={() => setIsUnpaid(!isUnpaid)}
                >
                  <Checkbox checked={isUnpaid} />
                  <span className="text-sm text-cooper-gray-400">
                    Unpaid position
                  </span>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex flex-row gap-8 pt-3">
        <FormField
          control={form.control}
          name="overtimeNormal"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-sm font-bold text-cooper-gray-400">
                Worked overtime<span className="text-[#FB7373]">*</span>
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
                    <FormLabel className="text-cooper-gray-350 text-sm">
                      Yes
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-4 space-y-0">
                    <FormControl>
                      <RadioGroupItem
                        value="no"
                        checked={field.value === "no"}
                      />
                    </FormControl>
                    <FormLabel className="text-cooper-gray-350 text-sm">
                      No
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="pto"
        render={({ field }) => (
          <FormItem className="flex flex-col pt-3">
            <FormLabel className="text-sm font-bold text-cooper-gray-400">
              Received PTO<span className="text-[#FB7373]">*</span>
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
                  <FormLabel className="text-cooper-gray-350 text-sm">
                    Yes
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="no" checked={field.value === "no"} />
                  </FormControl>
                  <FormLabel className="text-cooper-gray-350 text-sm">
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
