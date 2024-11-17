"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { WorkEnvironment, WorkTerm } from "@cooper/db/schema";
import { Form } from "@cooper/ui/form";

import { SearchBar } from "~/app/_components/search/search-bar";

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

export default function SearchFilter() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchText: "",
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
    router.push(pathName + "?" + createQueryString(values));
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
