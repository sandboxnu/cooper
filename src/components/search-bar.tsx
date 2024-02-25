import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem } from "./ui/form";
import { Input } from "./ui/input";

export function SearchBar() {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="searchText"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className="relative w-80">
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
                className="min-w-96 rounded-3xl border-none bg-cooper-blue-200 pl-12"
                placeholder="Search"
              />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
