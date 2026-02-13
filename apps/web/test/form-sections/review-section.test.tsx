import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ReviewSection } from "~/app/_components/form/sections/review-section";

function Wrapper({ children }: { children: React.ReactNode }) {
  const form = useForm({
    defaultValues: {
      overallRating: 0,
      textReview: "",
    },
  });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe("ReviewSection", () => {
  test("renders Overall rating label", () => {
    render(
      <Wrapper>
        <ReviewSection />
      </Wrapper>,
    );
    expect(screen.getByText(/Overall rating/)).toBeInTheDocument();
  });

  test("renders Review text label", () => {
    render(
      <Wrapper>
        <ReviewSection />
      </Wrapper>,
    );
    expect(screen.getByText(/Review text/)).toBeInTheDocument();
  });

  test("renders review textarea placeholder", () => {
    render(
      <Wrapper>
        <ReviewSection />
      </Wrapper>,
    );
    expect(
      screen.getByPlaceholderText(/job duties not mentioned/),
    ).toBeInTheDocument();
  });

  test("renders respectful hint text", () => {
    render(
      <Wrapper>
        <ReviewSection />
      </Wrapper>,
    );
    expect(
      screen.getByText(
        /Please be respectful and do not mention any specific names/,
      ),
    ).toBeInTheDocument();
  });
});
