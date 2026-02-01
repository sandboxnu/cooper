import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { BasicInfoSection } from "~/app/_components/form/sections/basic-info-section";

vi.mock("~/trpc/react", () => ({
  api: {
    location: {
      getByPrefix: { useQuery: () => ({ data: [] }) },
      getById: { useQuery: () => ({ data: undefined }) },
    },
  },
}));

vi.mock("~/app/_components/reviews/new-review/existing-company-content", () => ({
  default: () => <div data-testid="existing-company-content">Company</div>,
}));

vi.mock("~/app/_components/location", () => ({
  default: () => <div data-testid="location-box">Location</div>,
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
      jobType: "",
      workTerm: "",
      workYear: undefined,
      locationId: "",
      industry: "",
      companyName: "",
      roleName: "",
      ...defaultValues,
    },
  });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe("BasicInfoSection", () => {
  test("renders ExistingCompanyContent", () => {
    render(
      <Wrapper>
        <BasicInfoSection profileId={undefined} />
      </Wrapper>,
    );
    expect(screen.getByTestId("existing-company-content")).toBeInTheDocument();
  });

  test("renders Job type label", () => {
    render(
      <Wrapper>
        <BasicInfoSection profileId={undefined} />
      </Wrapper>,
    );
    expect(screen.getByText(/Job type/)).toBeInTheDocument();
  });

  test("renders Co-op/internship term label", () => {
    render(
      <Wrapper>
        <BasicInfoSection profileId={undefined} />
      </Wrapper>,
    );
    expect(screen.getByText(/Co-op\/internship term/)).toBeInTheDocument();
  });

  test("renders Year of co-op/internship term label", () => {
    render(
      <Wrapper>
        <BasicInfoSection profileId={undefined} />
      </Wrapper>,
    );
    expect(
      screen.getByText(/Year of co-op\/internship term/),
    ).toBeInTheDocument();
  });

  test("renders LocationBox", () => {
    render(
      <Wrapper>
        <BasicInfoSection profileId="profile-1" />
      </Wrapper>,
    );
    expect(screen.getByTestId("location-box")).toBeInTheDocument();
  });
});
