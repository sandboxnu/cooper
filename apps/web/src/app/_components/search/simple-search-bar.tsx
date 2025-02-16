import Image from "next/image";
import { useFormContext } from "react-hook-form";

import { Button } from "@cooper/ui/button";
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

  const newLocal =
    "h-14 border-2 border-l-0 border-cooper-blue-700 text-lg text-cooper-blue-600 placeholder:text-cooper-blue-400 rounded-r-lg rounded-l-none";
  return (
    <div className="flex w-4/5 grid-cols-12 rounded-lg lg:w-3/4">
      <Button
        className="h-14 rounded-l-lg rounded-r-none border-l-2 border-r-0 border-t-2 border-cooper-blue-700 bg-white p-0 px-4 text-lg hover:bg-cooper-blue-200 focus:border-r-0 focus:ring-0 active:ring-0"
        type="submit"
      >
        <Image
          src="svg/magnifyingGlass.svg"
          width="35"
          height="35"
          alt="Magnifying Glass"
        />
      </Button>
      <FormField
        control={form.control}
        name="searchText"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormControl>
              <Input {...field} className={newLocal} placeholder="Search..." />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
