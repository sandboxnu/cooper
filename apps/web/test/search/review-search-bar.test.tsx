import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ReviewSearchBar } from "~/app/_components/search/review-search-bar";

function Wrapper({
  children,
  defaultCycle,
  defaultTerm,
}: {
  children: React.ReactNode;
  defaultCycle?: "FALL" | "SPRING" | "SUMMER";
  defaultTerm?: "INPERSON" | "HYBRID" | "REMOTE";
}) {
  const form = useForm({
    defaultValues: {
      searchText: "",
      searchCycle: defaultCycle,
      searchTerm: defaultTerm,
    },
  });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe("ReviewSearchBar (search)", () => {
  test("renders search input with Search placeholder", () => {
    render(
      <Wrapper>
        <ReviewSearchBar />
      </Wrapper>,
    );
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });

  test("renders Cycle placeholder", () => {
    render(
      <Wrapper>
        <ReviewSearchBar />
      </Wrapper>,
    );
    expect(screen.getByText("Cycle")).toBeInTheDocument();
  });

  test("renders Work Term placeholder", () => {
    render(
      <Wrapper>
        <ReviewSearchBar />
      </Wrapper>,
    );
    expect(screen.getByText("Work Term")).toBeInTheDocument();
  });

  test("renders submit button", () => {
    render(
      <Wrapper>
        <ReviewSearchBar />
      </Wrapper>,
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("uses cycle and term as initial values when provided", () => {
    render(
      <Wrapper defaultCycle="FALL" defaultTerm="HYBRID">
        <ReviewSearchBar cycle="FALL" term="HYBRID" />
      </Wrapper>,
    );
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });
});
