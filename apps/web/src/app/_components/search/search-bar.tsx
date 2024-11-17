import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { Button } from "@cooper/ui/button";
import { FormControl, FormField, FormItem } from "@cooper/ui/form";
import { Input } from "@cooper/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@cooper/ui/select";

export function SearchBar() {
  const form = useFormContext();

  return (
    <div className="grid w-4/5 grid-cols-12 rounded-lg lg:w-3/4">
      <FormField
        control={form.control}
        name="searchText"
        render={({ field }) => (
          <FormItem className="col-span-full lg:col-span-7">
            <FormControl>
              <Input
                {...field}
                className="h-14 rounded-b-none rounded-t-lg border border-[#e2e8f0] pl-4 text-lg active:ring-0 lg:rounded-l-lg lg:rounded-r-none"
                placeholder="Search"
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="searchCycle"
        render={({ field }) => (
          <FormItem className="col-span-5 lg:col-span-2">
            <FormControl>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  console.log(form.getValues());
                }}
                defaultValue={field.value as string}
              >
                <SelectTrigger className="h-14 rounded-none rounded-bl border border-t-0 border-[#e2e8f0] text-lg ring-0 focus:border-2 focus:ring-0 active:ring-0 lg:rounded-none lg:border-b lg:border-l-0 lg:border-r-0 lg:border-t">
                  <SelectValue placeholder="Cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Cycle</SelectLabel>
                    <SelectItem value="FALL">Fall</SelectItem>
                    <SelectItem value="SPRING">Spring</SelectItem>
                    <SelectItem value="SUMMER">Summer</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="searchTerm"
        render={({ field }) => (
          <FormItem className="col-span-5 lg:col-span-2">
            <FormControl>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value as string}
              >
                <SelectTrigger className="h-14 rounded-none border border-l-0 border-t-0 border-[#e2e8f0] text-lg placeholder:opacity-50 focus:border-2 focus:ring-0 active:ring-0 lg:rounded-l-none lg:rounded-r-none lg:border-l lg:border-r-0 lg:border-t">
                  <SelectValue placeholder="Work Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Work Model</SelectLabel>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                    <SelectItem value="REMOTE">Remote</SelectItem>
                    <SelectItem value="INPERSON">In Person</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />
      <Button
        className="col-span-2 h-14 rounded-none rounded-br border border-l-0 border-t-0 border-[#e2e8f0] bg-white p-0 text-lg hover:bg-cooper-blue-200 focus:border-2 focus:ring-0 active:ring-0 lg:col-span-1 lg:rounded-l-none lg:rounded-r-lg lg:border-l lg:border-t"
        type="submit"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="my-auto h-8 w-8 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </Button>
    </div>
  );
}
