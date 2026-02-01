import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { PaySection } from "~/app/_components/form/sections/pay-section";

vi.mock("~/trpc/react", () => ({
  api: {
    location: {
      getById: { useQuery: () => ({ data: undefined }) },
    },
  },
}));

function Wrapper({
  children,
  defaultValues = {},
}: {
  children: React.ReactNode;
  defaultValues?: Record<string, unknown>;
}) {
  const form = useForm({
    defaultValues: {
      hourlyPay: "",
      locationId: "",
      overtimeNormal: undefined,
      pto: undefined,
      ...defaultValues,
    },
  });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe("PaySection", () => {
  test("renders Hourly pay label", () => {
    render(
      <Wrapper>
        <PaySection />
      </Wrapper>,
    );
    expect(screen.getByText(/Hourly pay/)).toBeInTheDocument();
  });

  test("renders hourly pay input placeholder", () => {
    render(
      <Wrapper>
        <PaySection />
      </Wrapper>,
    );
    expect(screen.getByPlaceholderText("$")).toBeInTheDocument();
  });

  test("renders Unpaid position checkbox label", () => {
    render(
      <Wrapper>
        <PaySection />
      </Wrapper>,
    );
    expect(screen.getByText(/Unpaid position/)).toBeInTheDocument();
  });

  test("renders Worked overtime label", () => {
    render(
      <Wrapper>
        <PaySection />
      </Wrapper>,
    );
    expect(screen.getByText(/Worked overtime/)).toBeInTheDocument();
  });

  test("renders Worked overtime Yes and No options", () => {
    render(
      <Wrapper>
        <PaySection />
      </Wrapper>,
    );
    const yesLabels = screen.getAllByText("Yes");
    const noLabels = screen.getAllByText("No");
    expect(yesLabels.length).toBeGreaterThanOrEqual(1);
    expect(noLabels.length).toBeGreaterThanOrEqual(1);
  });

  test("renders Received PTO label", () => {
    render(
      <Wrapper>
        <PaySection />
      </Wrapper>,
    );
    expect(screen.getByText(/Received PTO/)).toBeInTheDocument();
  });

  test("toggling Unpaid position disables hourly pay input", () => {
    render(
      <Wrapper>
        <PaySection />
      </Wrapper>,
    );
    const unpaidLabel = screen.getByText(/Unpaid position/);
    const input = screen.getByPlaceholderText("$");
    expect(input).not.toBeDisabled();
    fireEvent.click(unpaidLabel);
    expect(input).toBeDisabled();
  });

  test("renders with existing hourlyPay value", () => {
    render(
      <Wrapper defaultValues={{ hourlyPay: "25" }}>
        <PaySection />
      </Wrapper>,
    );
    const input = screen.getByPlaceholderText("$");
    expect(input).toHaveValue("25");
  });

  test("renders with overtimeNormal and pto values", () => {
    render(
      <Wrapper defaultValues={{ overtimeNormal: "yes", pto: "no" }}>
        <PaySection />
      </Wrapper>,
    );
    expect(screen.getByText(/Worked overtime/)).toBeInTheDocument();
    expect(screen.getByText(/Received PTO/)).toBeInTheDocument();
  });
});
