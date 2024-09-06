"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@cooper/ui/form";

import { SearchBar } from "~/app/_components/search/search-bar";

const formSchema = z.object({
  searchText: z.string(),
});

export type SearchFilterFormType = typeof formSchema;

export default function SearchFilter() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchText: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
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
