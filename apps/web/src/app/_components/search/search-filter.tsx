"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@cooper/ui/form";

import { SearchBar } from "~/app/_components/search/search-bar";

const formSchema = z.object({
  searchText: z.string(),
});

export type SearchFilterFormType = typeof formSchema;

interface SearchFilterProps {
  search?: string;
}

/**
 * Handles searching logic, updates the search param base on user search and passes the text to backend with fuzzy searching.
 * @param param0 user input text that's passed to the fuzzy search
 * @returns the search bar with the user inputted text
 */
export default function SearchFilter({ search }: SearchFilterProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchText: search ?? "",
    },
  });

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.searchText != "") {
      router.push(
        pathName + `/?${createQueryString("search", values.searchText)}`,
      );
    } else {
      router.push(pathName);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-[100vw]">
        <div className="flex justify-center">
          <SearchBar />
        </div>
      </form>
    </Form>
  );
}
