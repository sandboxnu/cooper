import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@cooper/ui/button";
import { FormControl, FormField, FormItem } from "@cooper/ui/form";
import { Input } from "@cooper/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@cooper/ui/select";
import { Industry, IndustryType, LocationType } from "@cooper/db/schema";
import { api } from "~/trpc/react";

interface SearchBarProps {
  industry?: IndustryType;
  location?: LocationType;
}

export function CompanySearchBar({ industry, location }: SearchBarProps) {
  const form = useFormContext();

  const [selectedIndustry, setSelectedIndustry] = useState<string | undefined>(industry);
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(location?.city);
  const { data: locations = [] } = api.location.list.useQuery();

  return (
    <div className="flex flex-row w-full justify-between items-center">
      <div className="text-[30px] justify-left">Browse Companies</div>
      <div className="flex flex-row gap-6 min-w-0">
      <FormField
        control={form.control}
        name="searchIndustry"
        render={({ field }) => (
          <FormItem className="col-span-5 lg:col-span-2">
            <FormControl>
              <Select
                onValueChange={(value) => {
                  setSelectedIndustry(value);
                  form.setValue(
                    field.name,
                    value === "INDUSTRY" ? undefined : value,
                  );
                }}
                value={selectedIndustry}
              >
                <SelectTrigger className="h-12 w-[340px] rounded-none border-2 border-l-0 border-t-0 border-[#9A9A9A] text-lg placeholder:opacity-50 focus:ring-0 active:ring-0 lg:rounded-md lg:border-2">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem className="font-bold" value="INDUSTRY">
                      Industry
                    </SelectItem>
                    <SelectSeparator />
                    {Object.entries(Industry).map(([key, value]) => (
                      <SelectItem key={value} value={value}>{key.charAt(0) + key.slice(1).toLowerCase()}</SelectItem>
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
              <Select
                onValueChange={(value) => {
                  setSelectedLocation(value);
                  form.setValue(
                    field.name,
                    value === "LOCATION" ? undefined : value,
                  );
                }}
                value={selectedLocation}
              >
                <SelectTrigger className="h-12 w-[340px] rounded-none border-2 border-l-0 border-t-0 border-[#9A9A9A] text-lg placeholder:opacity-50 focus:ring-0 active:ring-0 lg:rounded-md lg:border-2">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem className="font-bold" value="LOCATION">
                      Location
                    </SelectItem>
                    <SelectSeparator />
                    {locations.map((location: LocationType) => (
                      <SelectItem key={location.id} value={location.id}>{location.city + ", " + location.state}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />
      <Button
        className="bg-white hover:bg-white hover:text-[#9A9A9A] border-white text-black"
        type="submit"
      >
        Search
      </Button>
      <Button
        className="bg-white hover:bg-white hover:text-[#9A9A9A] border-white text-black"
        onClick={() => {
          setSelectedIndustry("INDUSTRY")
          setSelectedLocation("LOCATION")
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
