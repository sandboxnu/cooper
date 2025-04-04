"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { WorkEnvironment, WorkTerm } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Form } from "@cooper/ui/form";

import { ReviewSearchBar } from "~/app/_components/search/review-search-bar";
import { SimpleSearchBar } from "./simple-search-bar";

const formSchema = z.object({
  searchText: z.string(),
  searchCycle: z
    .nativeEnum(WorkTerm, {
      message: "Invalid cycle type",
    })
    .optional(),
  searchTerm: z
    .nativeEnum(WorkEnvironment, {
      message: "Invalid cycle type",
    })
    .optional(),
});

export type SearchFilterFormType = typeof formSchema;

interface SearchFilterProps {
  search?: string;
  cycle?: "FALL" | "SPRING" | "SUMMER";
  term?: "INPERSON" | "HYBRID" | "REMOTE";
  alternatePathname?: string;
  searchClassName?: string;
  searchType?: "REVIEWS" | "SIMPLE";
}

/**
 * Handles searching logic, updates the search param base on user search and passes the text to backend with fuzzy searching.
 * @param param0 user input text that's passed to the fuzzy search, cycle filter, and term filter.
 * - alternatePathname example: "/roles" or "/companies"
 * @returns the search bar with the user inputted text
 */
export default function SearchFilter({
  search,
  cycle,
  term,
  alternatePathname,
  searchClassName,
  searchType = "SIMPLE",
}: SearchFilterProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchText: search ?? "",
      searchCycle: cycle,
      searchTerm: term,
    },
  });

  const router = useRouter();
  const pathName = usePathname();

  const createQueryString = useCallback(
    ({ searchText, searchCycle, searchTerm }: z.infer<typeof formSchema>) => {
      // Initialize URLSearchParams with the required searchText
      const params = new URLSearchParams({ search: searchText });

      // Conditionally add searchCycle and searchTerm if they have values
      if (searchCycle) {
        params.set("cycle", searchCycle);
      }
      if (searchTerm) {
        params.set("term", searchTerm);
      }

      return params.toString(); // Returns a query string, e.g., "search=yo&cycle=SPRING"
    },
    [],
  );

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (alternatePathname) {
      router.push(alternatePathname + "?" + createQueryString(values));
    } else {
      router.push(pathName + "?" + createQueryString(values));
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("w-[100vw]", searchClassName)}
      >
        <div className={cn("flex justify-center")}>
          {searchType === "SIMPLE" && <SimpleSearchBar />}
          {searchType === "REVIEWS" && (
            <ReviewSearchBar cycle={cycle} term={term} />
          )}
        </div>
      </form>
    </Form>
  );
}
