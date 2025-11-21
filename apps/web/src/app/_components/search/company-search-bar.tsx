import type { SubmitHandler } from "react-hook-form";
import type { z } from "zod";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

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

import type { searchFormSchema } from "./search-filter";
import { api } from "~/trpc/react";
import LocationBox from "../location";

interface SearchBarProps {
  industry?: IndustryType;
  location?: LocationType;
  onSubmit: SubmitHandler<z.infer<typeof searchFormSchema>>;
}

export function CompanySearchBar({
  industry,
  location,
  onSubmit,
}: SearchBarProps) {
  const form = useFormContext<z.infer<typeof searchFormSchema>>();
  const { handleSubmit, setValue } = form;

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
    { enabled: searchTerm.length === 3 && prefix.length === 3 },
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
    <div className="flex w-full flex-col justify-between pt-4 lg:flex-row lg:items-center">
      <div className="justify-left text-2xl xl:text-[30px]">
        Browse Companies
      </div>
      <div className="flex flex-row gap-4 p-1 md:items-center md:gap-6">
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
                    className={`h-12 w-36 md:w-[21rem] ${selectedIndustry === "INDUSTRY" ? "text-cooper-gray-400" : "text-gray font-normal"} rounded-lg border-[0.75px] border-cooper-gray-400 text-lg placeholder:opacity-50 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0`}
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
        <div className="flex items-center gap-2">
          <LocationBox
            searchBar={true}
            form={form}
            locationLabel={locationLabel}
            setSearchTerm={setSearchTerm}
            locationValuesAndLabels={locationValuesAndLabels}
            setLocationLabel={setLocationLabel}
            locationsToUpdate={locationsToUpdate}
            setValue={(name, value) =>
              setValue(name as keyof z.infer<typeof searchFormSchema>, value)
            }
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
          />
          <Button
            className="border-white bg-white p-0 text-cooper-gray-400 hover:bg-white hover:text-[#9A9A9A]"
            onClick={() => {
              setSelectedIndustry("INDUSTRY");
              setLocationLabel("");
              form.setValue("searchIndustry", undefined);
              form.setValue("searchLocation", undefined);
              onSubmit({});
            }}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
