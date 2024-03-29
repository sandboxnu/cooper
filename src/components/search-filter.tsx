"use client";

import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Industry, WorkEnvironment, WorkTerm } from "@prisma/client";
import { cn } from "~/lib/utils";
import { buttonVariants } from "./ui/button";
import { SearchBar } from "./search-bar";

const formSchema = z.object({
  searchText: z.string(),
  searchIndustry: z.nativeEnum(Industry).optional(),
  searchWorkTerm: z.nativeEnum(WorkTerm).optional(),
  searchWorkModel: z.nativeEnum(WorkEnvironment).optional(),
});

/**
 * Used to abstract the dropdowns in the search bar.
 */
const searchDropdown: {
  name: "searchIndustry" | "searchWorkTerm" | "searchWorkModel";
  title: string;
  enumObj: object;
}[] = [
  {
    name: "searchIndustry",
    title: "Industry",
    enumObj: Industry,
  },
  {
    name: "searchWorkTerm",
    title: "Work Term",
    enumObj: WorkTerm,
  },
  {
    name: "searchWorkModel",
    title: "Work Model",
    enumObj: WorkEnvironment,
  },
];

export type SearchFilterFormType = typeof formSchema;

export default function SearchFilter() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchText: "",
      searchIndustry: undefined,
      searchWorkTerm: undefined,
      searchWorkModel: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className="m-4 mt-0 flex h-32 min-w-[80vw] items-center justify-center rounded-2xl bg-cooper-blue-400 p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-4 grid w-full grid-cols-1 gap-2 lg:grid-cols-2"
        >
          <div className="flex justify-center">
            <SearchBar />
          </div>
          <div className="ml-[-1.75rem] mr-4 flex items-center justify-around gap-3 lg:ml-0 lg:mr-0 lg:justify-end">
            {searchDropdown.map(({ name, title, enumObj }) => {
              return (
                <FormField
                  key={`${name}-dropdown`}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <FormControl>
                          <select
                            className={cn(
                              buttonVariants({
                                variant: "outline",
                                size: "lg",
                              }),
                              "w-36 appearance-none border border-none border-blue-500 bg-transparent pr-8 text-right text-white",
                              "hover:bg-transparent hover:text-secondary",
                              "focus:ring-0",
                            )}
                            {...field}
                          >
                            <option value={undefined}>{title}</option>
                            {(
                              Object.keys(enumObj) as Array<
                                keyof typeof Industry
                              >
                            ).map((elem) => {
                              return (
                                <option key={elem} value={elem}>
                                  {elem}
                                </option>
                              );
                            })}
                          </select>
                        </FormControl>
                        {/* Triangle Down Icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="7"
                          viewBox="0 0 14 7"
                          fill="none"
                          className="absolute right-2 top-3.5 h-3 w-3"
                        >
                          <path
                            d="M1 1L6.17459 5.4559C6.54056 5.77104 7.07947 5.77959 7.45526 5.47622L13 1"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </FormItem>
                  )}
                />
              );
            })}
          </div>
        </form>
      </Form>
    </div>
  );
}
