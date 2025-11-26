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
import {
  RadioGroup,
  RadioGroupItem,
} from "node_modules/@cooper/ui/src/radio-group";
import { NumberedRating } from "../numbered-rating";

/**
 * ReviewSection component renders form fields for writing a co-op review.
 */
export function ReviewSection() {
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
        name="reviewHeadline"
        render={({ field }) => (
          <FormItem className="flex flex-row gap-14">
            <FormLabel className="text-sm text-cooper-gray-400">
              Review Headline*
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Ex. SWE Experience @ Google"
                className="border border-cooper-gray-150 w-[50%] rounded-lg h-10 text-sm"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="textReview"
        render={({ field }) => (
          <FormItem className="flex flex-row gap-14">
            <FormLabel className="text-sm text-cooper-gray-400">
              Your co-op experience*
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Write about your co-op experience..."
                className="border border-cooper-gray-150 w-[50%] text-sm"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex flex-row gap-56">
        <div>Rate</div>
        <div className="flex flex-col justify-between overflow-hidden md:flex-col md:space-x-2">
          <FormField
            control={form.control}
            name="overallRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Overall co-op experience*</FormLabel>
                <FormControl>
                  <NumberedRating {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cultureRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company culture*</FormLabel>
                <FormControl>
                  <NumberedRating {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supervisorRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supervisor rating*</FormLabel>
                <FormControl>
                  <NumberedRating {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interviewRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interview experience*</FormLabel>
                <FormControl>
                  <NumberedRating {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </FormSection>
  );
}
