import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import type { IndustryType, LocationType } from "@cooper/db/schema";
import { Industry } from "@cooper/db/schema";
import { Button } from "@cooper/ui/button";
import { FormControl, FormField, FormItem } from "@cooper/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@cooper/ui/select";

import { api } from "~/trpc/react";
import ComboBox from "../combo-box";

interface SearchBarProps {
  industry?: IndustryType;
  location?: LocationType;
}

const _formSchema = z.object({
  searchIndustry: z.string().optional(),
  searchLocation: z.string().optional(),
});
type FormSchema = z.infer<typeof _formSchema>;

export function CompanySearchBar({ industry, location }: SearchBarProps) {
  const form = useFormContext();
  const { handleSubmit, setValue } = form;
  const router = useRouter();
  const pathName = usePathname();

  const [selectedIndustry, setSelectedIndustry] = useState<string | undefined>(
    industry,
  );

  const [locationLabel, setLocationLabel] = useState<string>(
    location ? `${location.city}, ${location.state}` : "Location",
  );
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

  const onSubmit = (data: FormSchema) => {
    router.push(pathName + "?" + createQueryString(data));
  };

  const createQueryString = useCallback(
    ({ searchIndustry, searchLocation }: FormSchema) => {
      const currentParams = new URLSearchParams(window.location.search);
      // Update the query parameters with the new values
      if (searchIndustry) {
        currentParams.set("industry", searchIndustry);
      } else {
        currentParams.delete("industry");
      }

      if (searchLocation) {
        currentParams.set("location", searchLocation);
      } else {
        currentParams.delete("location");
      }

      return currentParams.toString();
    },
    [],
  );

  return (
    <div className="flex w-full flex-row items-center justify-between pt-4">
      <div className="justify-left text-[30px]">Browse Companies</div>
      <div className="flex min-w-0 flex-row items-center gap-6">
        <FormField
          control={form.control}
          name="searchIndustry"
          render={({ field }) => (
            <FormItem className="col-span-5 lg:col-span-2">
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    setSelectedIndustry(value);
                    const finalValue = value === "INDUSTRY" ? undefined : value;
                    setValue(field.name, finalValue);
                    void handleSubmit(onSubmit)();
                  }}
                  value={selectedIndustry}
                >
                  <SelectTrigger
                    className={`h-12 w-[21rem] ${selectedIndustry === "INDUSTRY" ? "text-cooper-gray-400" : "text-gray font-normal"} rounded-none border-[0.75px] border-l-0 border-t-0 border-cooper-gray-400 text-lg placeholder:opacity-50 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 lg:rounded-md lg:border-[0.75px]`}
                  >
                    <span
                      className={`overflow-hidden whitespace-nowrap text-lg ${selectedIndustry === "INDUSTRY" ? "text-cooper-gray-400" : "text-gray"}`}
                    >
                      <SelectValue placeholder="Industry" />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem className="font-bold" value="INDUSTRY">
                        Industry
                      </SelectItem>
                      <SelectSeparator />
                      {Object.entries(Industry).map(([key, value]) => (
                        <SelectItem key={value} value={value}>
                          {key.charAt(0) + key.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="searchLocation"
          render={({ field }) => (
            <FormItem className="col-span-5 lg:col-span-2">
              <FormControl>
                <ComboBox
                  {...field}
                  variant="filtering"
                  defaultLabel={locationLabel || "Location"}
                  searchPlaceholder="Type to begin..."
                  searchEmpty="No location found."
                  valuesAndLabels={locationValuesAndLabels}
                  currLabel={locationLabel}
                  onChange={(value) => {
                    setSearchTerm(value);
                  }}
                  onSelect={(currentValue) => {
                    setLocationLabel(currentValue);
                    const selectedLoc = locationsToUpdate.data?.find(
                      (loc) =>
                        `${loc.city}${loc.state ? `, ${loc.state}` : ""}${loc.country ? `, ${loc.country}` : ""}` ===
                        currentValue,
                    );
                    const finalValue =
                      currentValue === "LOCATION" ? undefined : selectedLoc?.id;
                    setValue(field.name, finalValue);
                    void handleSubmit(onSubmit)();
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          className="border-white bg-white p-0 text-cooper-gray-400 hover:bg-white hover:text-[#9A9A9A]"
          onClick={() => {
            setSelectedIndustry("INDUSTRY");
            setLocationLabel("");
            form.setValue("searchIndustry", undefined);
            form.setValue("searchLocation", undefined);
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
