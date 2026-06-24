import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, test } from "vitest";

import { SimpleSearchBar } from "~/app/_components/search/simple-search-bar";

function Wrapper({ children }: { children: ReactNode }) {
  const form = useForm({ defaultValues: { searchText: "" } });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe("SimpleSearchBar", () => {
  test("renders the search input with its placeholder", () => {
    render(
      <Wrapper>
        <SimpleSearchBar />
      </Wrapper>,
    );
    expect(
      screen.getByPlaceholderText("Search for a job, company, industry..."),
    ).toBeInTheDocument();
  });

  test("is wired to the form field and reflects typed input", () => {
    render(
      <Wrapper>
        <SimpleSearchBar />
      </Wrapper>,
    );
    const input = screen.getByPlaceholderText(
      "Search for a job, company, industry...",
    );
    fireEvent.change(input, { target: { value: "google" } });
    expect(input).toHaveValue("google");
  });
});
