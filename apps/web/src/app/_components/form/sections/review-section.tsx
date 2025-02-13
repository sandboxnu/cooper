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

import type { ComboBoxOption } from "~/app/_components/combo-box";
import ComboBox from "~/app/_components/combo-box";
import { FormSection } from "~/app/_components/form/form-section";

/**
 * ReviewSection component renders form fields for writing a co-op review.
 */
export function ReviewSection({ textColor }: { textColor: string }) {
  const form = useFormContext();

  const [locations, setLocations] = useState<ComboBoxOption<string>[]>([]);
  const [locationLabel, setLocationLabel] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (searchTerm.length === 2) {
      const prefix = searchTerm.toLowerCase();
      const moduleName = `${prefix}Cities`;

      import(`../constants/cities/${prefix}`)
        .then((module) => {
          const cities = module[moduleName];
          const flattenedNames = cities.map(
            (location: { city: string; state: string; country: string }) => ({
              value: location.city,
              label: `${location.city}, ${location.state}, ${location.country}`,
            }),
          );
          setLocations(flattenedNames);
        })
        .catch((error) => {
          console.error(`Error loading module for prefix ${prefix}:`, error);
        });
    }
  }, [searchTerm]);

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
                valuesAndLabels={locations}
                currLabel={locationLabel}
                onChange={(value) => {
                  setSearchTerm(value);
                  field.onChange(value);
                }}
                onSelect={(currentValue) => {
                  setLocationLabel(
                    currentValue === locationLabel ? "" : currentValue,
                  );
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
