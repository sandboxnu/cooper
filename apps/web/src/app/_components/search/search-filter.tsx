"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { IndustryType, LocationType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Form } from "@cooper/ui/form";

import { SimpleSearchBar } from "./simple-search-bar";

export const searchFormSchema = z.object({
  searchText: z.string().optional(),
});

export type SearchFilterFormType = typeof searchFormSchema;

interface SearchFilterProps {
  className?: string;
}

/**
 * Handles searching logic, updates the search param base on user search and passes the text to backend with fuzzy searching.
 * @param param0 user input text that's passed to the fuzzy search, cycle filter, and term filter.
 * - alternatePathname example: "/roles" or "/companies"
 * @returns the search bar with the user inputted text
 */
export default function SearchFilter({ className }: SearchFilterProps) {
  const form = useForm<z.infer<typeof searchFormSchema>>({
    resolver: zodResolver(searchFormSchema),
  });

  const router = useRouter();
  const pathName = usePathname();

  const createQueryString = useCallback(
    ({ searchText }: z.infer<typeof searchFormSchema>) => {
      // Initialize URLSearchParams with the required searchText
      const params = new URLSearchParams(window.location.search);

      // Clear company and role params when searching
      params.delete("company");
      params.delete("role");

      if (searchText !== undefined) {
        params.set("search", searchText);
      } else if (!params.get("search")) {
        params.delete("search");
      }

      return params.toString();
    },
    [],
  );

  function onSubmit(values: z.infer<typeof searchFormSchema>) {
    router.push(pathName + "?" + createQueryString(values));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        <div className={cn("flex justify-center")}>
          <SimpleSearchBar />
        </div>
      </form>
    </Form>
  );
}
