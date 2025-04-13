"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { IndustryType, LocationType } from "@cooper/db/schema";
import { WorkEnvironment, WorkTerm } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Form } from "@cooper/ui/form";

import { ReviewSearchBar } from "~/app/_components/search/review-search-bar";
import { CompanySearchBar } from "./company-search-bar";
import { SimpleSearchBar } from "./simple-search-bar";

export const searchFormSchema = z.object({
  searchText: z.string().optional(),
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
  searchIndustry: z.string().optional(),
  searchLocation: z.string().optional(),
});

export type SearchFilterFormType = typeof searchFormSchema;

interface SearchFilterProps {
  search?: string;
  cycle?: "FALL" | "SPRING" | "SUMMER";
  term?: "INPERSON" | "HYBRID" | "REMOTE";
  alternatePathname?: string;
  searchClassName?: string;
  searchType?: "REVIEWS" | "SIMPLE" | "COMPANIES";
  industry?: IndustryType;
  location?: LocationType;
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
  industry,
  location,
}: SearchFilterProps) {
  const form = useForm<z.infer<typeof searchFormSchema>>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      searchText: search,
      searchCycle: cycle,
      searchTerm: term,
      searchIndustry: industry,
      searchLocation: location?.id,
    },
  });

  const router = useRouter();
  const pathName = usePathname();

  const createQueryString = useCallback(
    ({
      searchCycle,
      searchTerm,
      searchText,
      searchIndustry,
      searchLocation,
    }: z.infer<typeof searchFormSchema>) => {
      // Initialize URLSearchParams with the required searchText
      const params = new URLSearchParams(window.location.search);

      // Conditionally add searchCycle and searchTerm if they have values
      if (searchCycle !== undefined) {
        params.set("cycle", searchCycle);
      }
      if (searchTerm !== undefined) {
        params.set("term", searchTerm);
      }

      if (searchText !== undefined) {
        params.set("search", searchText);
      } else if (!params.get("search")) {
        params.delete("search");
      }

      if (searchIndustry !== undefined) {
        params.set("industry", searchIndustry);
      } else {
        params.delete("industry");
      }
      if (searchLocation !== undefined) {
        params.set("location", searchLocation);
      } else {
        params.delete("location");
      }

      return params.toString();
    },
    [],
  );

  function onSubmit(values: z.infer<typeof searchFormSchema>) {
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
        className={cn(
          "w-[98vw]",
          searchType === "COMPANIES" && "w-full",
          searchClassName,
        )}
      >
        <div className={cn("flex justify-center")}>
          {searchType === "SIMPLE" && <SimpleSearchBar />}
          {searchType === "REVIEWS" && (
            <ReviewSearchBar cycle={cycle} term={term} />
          )}
          {searchType === "COMPANIES" && (
            <CompanySearchBar
              industry={industry}
              location={location}
              onSubmit={onSubmit}
            />
          )}
        </div>
      </form>
    </Form>
  );
}
