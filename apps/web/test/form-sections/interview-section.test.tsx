import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { InterviewSection } from "~/app/_components/form/sections/interview-section";

function Wrapper({
  children,
  defaultValues = {},
}: {
  children: React.ReactNode;
  defaultValues?: Record<string, unknown>;
}) {
  const form = useForm({
    defaultValues: {
      interviewDifficulty: 0,
      ...defaultValues,
    },
  });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe("InterviewSection", () => {
  test("renders Interview difficulty label", () => {
    render(
      <Wrapper>
        <InterviewSection />
      </Wrapper>,
    );
    expect(screen.getByText(/Interview difficulty/)).toBeInTheDocument();
  });

  test("renders difficulty select with options", () => {
    render(
      <Wrapper>
        <InterviewSection />
      </Wrapper>,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Select")).toBeInTheDocument();
  });

  test("renders with existing interviewDifficulty value", () => {
    render(
      <Wrapper defaultValues={{ interviewDifficulty: 3 }}>
        <InterviewSection />
      </Wrapper>,
    );
    expect(screen.getByText(/Interview difficulty/)).toBeInTheDocument();
  });
});
