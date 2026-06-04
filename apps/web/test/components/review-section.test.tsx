import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, test, vi } from "vitest";

vi.mock("~/app/_components/filters/filter-body", () => ({
  default: ({
    title,
    options,
    onSelectionChange,
  }: {
    title: string;
    options: { value: string; label: string }[];
    onSelectionChange: (selected: string[]) => void;
  }) => (
    <div data-testid="filter-body" data-title={title}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelectionChange([opt.value])}
        >
          {`rating-${opt.label}`}
        </button>
      ))}
    </div>
  ),
}));

import { ReviewSection } from "~/app/_components/form/sections/review-section";

function Wrapper({ children }: { children: ReactNode }) {
  const form = useForm({
    defaultValues: { overallRating: undefined, textReview: "" },
  });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe("ReviewSection", () => {
  test("renders the overall rating and review text labels", () => {
    render(
      <Wrapper>
        <ReviewSection />
      </Wrapper>,
    );
    expect(screen.getByText("Overall rating")).toBeInTheDocument();
    expect(screen.getByText("Review text")).toBeInTheDocument();
  });

  test("passes the 1-5 rating options to the filter body", () => {
    render(
      <Wrapper>
        <ReviewSection />
      </Wrapper>,
    );
    expect(screen.getByTestId("filter-body")).toHaveAttribute(
      "data-title",
      "Overall rating",
    );
    for (const n of [1, 2, 3, 4, 5]) {
      expect(screen.getByText(`rating-${n}`)).toBeInTheDocument();
    }
  });

  test("renders the review text helper copy and textarea", () => {
    render(
      <Wrapper>
        <ReviewSection />
      </Wrapper>,
    );
    expect(
      screen.getByText(/This is your chance to share more details/),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/job duties not mentioned/),
    ).toBeInTheDocument();
  });

  test("writes the selected rating back into the form", () => {
    function Probe() {
      const form = useForm({
        defaultValues: { overallRating: undefined, textReview: "" },
      });
      return (
        <FormProvider {...form}>
          <ReviewSection />
          <output data-testid="rating-value">
            {String(form.watch("overallRating"))}
          </output>
        </FormProvider>
      );
    }
    render(<Probe />);
    fireEvent.click(screen.getByText("rating-4"));
    expect(screen.getByTestId("rating-value")).toHaveTextContent("4");
  });
});
