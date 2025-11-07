import { useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem } from "@cooper/ui/form";
import { Input } from "@cooper/ui/input";

/**
 * This Search Bar employs filtering and fuzzy searching.
 *
 * NOTE: Cycle and Term only make sense for Roles
 *
 * @param param0 Cycle and Term to be set as default values for their respective dropdowns
 * @returns A search bar which is connected to a parent 'useForm'
 */
export function SimpleSearchBar() {
  const form = useFormContext();

  return (
    <div className="flex w-full rounded-lg">
      <FormField
        control={form.control}
        name="searchText"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormControl>
              <Input
                {...field}
                className="rounded-[8px] border border-cooper-gray-150 bg-white text-sm placeholder:text-cooper-gray-400 focus:border-cooper-gray-200 focus:ring-0 py-2 px-4 h-9 max-w-80"
                placeholder="Search for a job, company, industry..."
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
