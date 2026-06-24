import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, test, vi } from "vitest";

vi.mock("~/app/_components/form/sections/interview-round-item", () => ({
  InterviewRoundItem: ({ index }: { index: number }) => (
    <div data-testid="interview-round">Round {index + 1}</div>
  ),
}));

import { InterviewSection } from "~/app/_components/form/sections/interview-section";

function Wrapper({ children }: { children: ReactNode }) {
  const form = useForm({ defaultValues: { interviewRounds: [] } });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe("InterviewSection", () => {
  test("renders the add-round button with no rounds initially", () => {
    render(
      <Wrapper>
        <InterviewSection />
      </Wrapper>,
    );
    expect(screen.getByText("+ Add interview round")).toBeInTheDocument();
    expect(screen.queryByTestId("interview-round")).not.toBeInTheDocument();
  });

  test("appends a round when the add button is clicked", () => {
    render(
      <Wrapper>
        <InterviewSection />
      </Wrapper>,
    );
    fireEvent.click(screen.getByText("+ Add interview round"));
    expect(screen.getByTestId("interview-round")).toBeInTheDocument();
  });

  test("appends multiple rounds on repeated clicks", () => {
    render(
      <Wrapper>
        <InterviewSection />
      </Wrapper>,
    );
    const button = screen.getByText("+ Add interview round");
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.getAllByTestId("interview-round")).toHaveLength(2);
  });
});
