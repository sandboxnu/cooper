import { useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem } from "@cooper/ui/form";
import { Input } from "@cooper/ui/input";

export function SearchBar() {
  const form = useFormContext();

  return (
    <div className="grid w-4/5 grid-cols-12 rounded-lg lg:w-3/4">
      <FormField
        control={form.control}
        name="searchText"
        render={({ field }) => (
          <FormItem className="relative col-span-full lg:col-span-8">
            <FormControl>
              <div className="h-14">
                {/* SEARCH TEXT INPUT */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute bottom-0 left-3 top-0 my-auto h-6 w-6 text-gray-500"
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

                <Input
                  {...field}
                  className="h-14 rounded-b-none rounded-t-lg border border-[#e2e8f0] pl-12 text-lg active:ring-0 lg:rounded-l-lg lg:rounded-r-none"
                  placeholder="Search"
                />
              </div>
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="searchCycle"
        render={({ field }) => (
          <FormItem className="col-span-6 lg:col-span-2">
            <FormControl>
              <Input
                {...field}
                className="h-14 rounded-none rounded-bl border border-t-0 border-[#e2e8f0] text-lg ring-0 active:ring-0 lg:border-b lg:border-l-0 lg:border-r-0 lg:border-t"
                placeholder="Cycle"
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="searchTerm"
        render={({ field }) => (
          <FormItem className="col-span-6 lg:col-span-2">
            <FormControl>
              <Input
                {...field}
                className="h-14 rounded-none rounded-br border border-l-0 border-t-0 border-[#e2e8f0] text-lg active:ring-0 lg:rounded-l-none lg:rounded-r-lg lg:border-l lg:border-t"
                placeholder="Environment"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
