"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

import type { LocationType } from "@cooper/db/schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cooper/ui/form";
import { Input } from "@cooper/ui/input";
import { Textarea } from "@cooper/ui/textarea";

import type { ComboBoxOption } from "~/app/_components/combo-box";
import ComboBox from "~/app/_components/combo-box";
import { FormSection } from "~/app/_components/form/form-section";
import { api } from "~/trpc/react";

/**
 * ReviewSection component renders form fields for writing a co-op review.
 */
export function ReviewSection({ textColor }: { textColor: string }) {
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
  }, [searchTerm]);

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

  return (
    <FormSection title="Review" className={textColor}>
      <FormField
        control={form.control}
        name="reviewHeadline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Review Headline*</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="textReview"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tell us about your co-op experience*</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex justify-between space-x-2">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <ComboBox
                variant="form"
                defaultLabel={locationLabel || "Select location..."}
                searchPlaceholder="Search location..."
                searchEmpty="No location found."
                valuesAndLabels={locationValuesAndLabels}
                currLabel={locationLabel}
                onChange={(value) => {
                  setSearchTerm(value);
                }}
                onSelect={(currentValue) => {
                  setLocationLabel(currentValue);
                  field.onChange(currentValue);
                }}
              />
            </FormItem>
          )}
        ></FormField>
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
      </div>
    </FormSection>
  );
}
