"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Industry, WorkEnvironment, WorkTerm } from "@prisma/client";
import { Input } from "./ui/input";
import { cn } from "~/lib/utils";
import { buttonVariants } from "./ui/button";
import { TriangleDownIcon } from "@radix-ui/react-icons";

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
    <div className="flex h-24 min-w-[80vw] items-center justify-center rounded-2xl bg-accent p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-between flex w-full items-center justify-between"
        >
          <FormField
            control={form.control}
            name="searchText"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center justify-between">
                    {/* SEARCH TEXT INPUT */}
                    <Input
                      {...field}
                      className="min-w-96 rounded-3xl border-none bg-secondary"
                      placeholder="🔎 Search"
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex items-center justify-around space-x-3">
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
                              buttonVariants({ variant: "outline" }),
                              "w-36 appearance-none border-none bg-transparent pr-8 text-right text-white",
                              "hover:bg-transparent hover:text-secondary",
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
                        <TriangleDownIcon className="absolute right-2.5 top-2.5 h-5 w-5" />
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
