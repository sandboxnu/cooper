import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { CompanyDetailsSection } from "~/app/_components/form/sections/company-details-section";

function Wrapper({
  children,
  defaultValues = {},
}: {
  children: React.ReactNode;
  defaultValues?: Record<string, unknown>;
}) {
  const form = useForm({
    defaultValues: {
      workEnvironment: "",
      drugTest: undefined,
      cultureRating: 0,
      supervisorRating: 0,
      benefits: undefined,
      ...defaultValues,
    },
  });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe("CompanyDetailsSection", () => {
  test("renders Work model label", () => {
    render(
      <Wrapper>
        <CompanyDetailsSection />
      </Wrapper>,
    );
    expect(screen.getByText(/Work model/)).toBeInTheDocument();
  });

  test("renders work environment options", () => {
    render(
      <Wrapper>
        <CompanyDetailsSection />
      </Wrapper>,
    );
    expect(screen.getByText(/Work model/)).toBeInTheDocument();
    expect(screen.getByText("In person")).toBeInTheDocument();
    expect(screen.getByText("Hybrid")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
  });

  test("renders Drug Test label", () => {
    render(
      <Wrapper>
        <CompanyDetailsSection />
      </Wrapper>,
    );
    expect(screen.getByText(/Drug Test/)).toBeInTheDocument();
  });

  test("renders Drug Test Yes and No options", () => {
    render(
      <Wrapper>
        <CompanyDetailsSection />
      </Wrapper>,
    );
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  test("renders Company Culture label", () => {
    render(
      <Wrapper>
        <CompanyDetailsSection />
      </Wrapper>,
    );
    expect(screen.getByText(/Company Culture/)).toBeInTheDocument();
  });

  test("renders Supervisor rating label", () => {
    render(
      <Wrapper>
        <CompanyDetailsSection />
      </Wrapper>,
    );
    expect(screen.getByText(/Supervisor rating/)).toBeInTheDocument();
  });

  test("renders Benefits label", () => {
    render(
      <Wrapper>
        <CompanyDetailsSection />
      </Wrapper>,
    );
    expect(screen.getAllByText(/Benefits/).length).toBeGreaterThanOrEqual(1);
  });

  test("renders with existing workEnvironment value", () => {
    render(
      <Wrapper defaultValues={{ workEnvironment: "REMOTE" }}>
        <CompanyDetailsSection />
      </Wrapper>,
    );
    expect(screen.getByText(/Work model/)).toBeInTheDocument();
  });

  test("renders with existing cultureRating and supervisorRating values", () => {
    render(
      <Wrapper defaultValues={{ cultureRating: 4, supervisorRating: 5 }}>
        <CompanyDetailsSection />
      </Wrapper>,
    );
    expect(screen.getByText(/Company Culture/)).toBeInTheDocument();
    expect(screen.getByText(/Supervisor rating/)).toBeInTheDocument();
  });

  test("can select drug test Yes", () => {
    render(
      <Wrapper>
        <CompanyDetailsSection />
      </Wrapper>,
    );
    const yesLabel = screen.getByText("Yes");
    fireEvent.click(yesLabel);
    expect(yesLabel).toBeInTheDocument();
  });
});
