"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
    let searchString = "";

    if (values.searchText != "") {
      searchString = `/?${createQueryString("search", values.searchText)}`;
    } else if (values.searchCycle) {
      searchString += `/?${createQueryString("cycle", values.searchCycle)}`;
    } else if (values.searchTerm) {
      searchString += `/?${createQueryString("term", values.searchTerm)}`;
    }

    router.push(pathName + searchString);
  }

  useEffect(() => console.log("errors", form.formState.errors), [form]);

  return (
    <Form {...form}>
      <form
        onSubmit={() => {
          console.log("submit");
          form.handleSubmit(onSubmit);
        }}
        className="w-[100vw]"
      >
        <div className="flex justify-center">
          <SearchBar />
        </div>
      </form>
    </Form>
  );
}
