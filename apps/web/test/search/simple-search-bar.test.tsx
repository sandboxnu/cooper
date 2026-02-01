import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { SimpleSearchBar } from "~/app/_components/search/simple-search-bar";

function Wrapper({ children }: { children: React.ReactNode }) {
  const form = useForm({
    defaultValues: { searchText: "" },
  });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe("SimpleSearchBar", () => {
  test("renders search input with placeholder", () => {
    render(
      <Wrapper>
        <SimpleSearchBar />
      </Wrapper>,
    );
    expect(
      screen.getByPlaceholderText("Search for a job, company, industry..."),
    ).toBeInTheDocument();
  });

  test("updates form value when user types", () => {
    function TestWrapper() {
      const form = useForm({ defaultValues: { searchText: "" } });
      return (
        <FormProvider {...form}>
          <SimpleSearchBar />
        </FormProvider>
      );
    }
    render(<TestWrapper />);
    const input = screen.getByPlaceholderText(
      "Search for a job, company, industry...",
    );
    fireEvent.change(input, { target: { value: "engineer" } });
    expect(input).toHaveValue("engineer");
  });
});
