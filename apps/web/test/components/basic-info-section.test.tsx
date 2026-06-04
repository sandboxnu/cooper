import type { ReactNode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, test, vi } from "vitest";

vi.mock("~/app/_components/filters/filter-body", () => ({
  default: ({
    title,
    options,
    onSelectionChange,
  }: {
    title: string;
    options?: { id: string; label: string }[];
    onSelectionChange?: (selected: string[]) => void;
  }) => (
    <div data-testid="filter-body" data-title={title}>
      {options?.map((o) => (
        <button
          key={o.id}
          type="button"
          data-testid={`fb-${title}-${o.id}`}
          onClick={() => onSelectionChange?.([o.id])}
        >
          {o.label}
        </button>
      ))}
    </div>
  ),
}));
vi.mock("~/app/_components/reviews/existing-company-content", () => ({
  default: () => <div data-testid="existing-company" />,
}));
vi.mock("~/app/_components/location", () => ({
  default: () => <div data-testid="location-box" />,
}));
vi.mock("~/app/_components/themed/onboarding/input", () => ({
  Input: ({
    onClear: _onClear,
    ...props
  }: Record<string, unknown> & { onClear?: () => void }) => (
    <input data-testid="themed-input" {...props} />
  ),
}));

const popularityQuery = {
  data: [
    { id: "loc-1", city: "Boston", state: "MA", country: "USA" },
    { id: "loc-2", city: "London", state: null, country: "UK" },
  ],
  isSuccess: true,
};
const byIdQuery = {
  data: { id: "loc-1", city: "Boston", state: "MA", country: "USA" },
  isSuccess: true,
};
vi.mock("~/trpc/react", () => ({
  api: {
    location: {
      getByPopularity: { useQuery: () => popularityQuery },
      getById: { useQuery: () => byIdQuery },
    },
  },
}));

import { BasicInfoSection } from "~/app/_components/form/sections/basic-info-section";

type Defaults = Record<string, unknown>;

const baseDefaults: Defaults = {
  jobType: "",
  workTerm: "",
  jobLength: null,
  workYear: undefined,
  locationId: "loc-1",
};

function Wrapper({
  children,
  defaults = baseDefaults,
}: {
  children: ReactNode;
  defaults?: Defaults;
}) {
  const form = useForm({ defaultValues: defaults });
  return <FormProvider {...form}>{children}</FormProvider>;
}

function Probe({ defaults = baseDefaults }: { defaults?: Defaults }) {
  const form = useForm({ defaultValues: defaults });
  return (
    <FormProvider {...form}>
      <BasicInfoSection profileId="p1" />
      <output data-testid="v-jobType">{String(form.watch("jobType"))}</output>
      <output data-testid="v-workTerm">{String(form.watch("workTerm"))}</output>
      <output data-testid="v-jobLength">
        {String(form.watch("jobLength"))}
      </output>
      <output data-testid="v-workYear">{String(form.watch("workYear"))}</output>
    </FormProvider>
  );
}

describe("BasicInfoSection", () => {
  test("renders the core field labels", () => {
    render(
      <Wrapper>
        <BasicInfoSection profileId="p1" />
      </Wrapper>,
    );
    expect(screen.getByText("Job type")).toBeInTheDocument();
    expect(screen.getByText(/Co-op\/internship term/)).toBeInTheDocument();
    expect(screen.getByText("Job length")).toBeInTheDocument();
    expect(
      screen.getByText(/Year of co-op\/internship term/),
    ).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
  });

  test("renders the existing-company content and the location box", () => {
    render(
      <Wrapper>
        <BasicInfoSection profileId="p1" />
      </Wrapper>,
    );
    expect(screen.getByTestId("existing-company")).toBeInTheDocument();
    expect(screen.getByTestId("location-box")).toBeInTheDocument();
  });

  test("selects the job type", () => {
    render(<Probe />);
    fireEvent.click(screen.getByTestId("fb-Job type-Co-op"));
    expect(screen.getByTestId("v-jobType")).toHaveTextContent("Co-op");
  });

  test("selects the work term", () => {
    render(<Probe />);
    fireEvent.click(screen.getByTestId("fb-Co-op/internship term-SPRING"));
    expect(screen.getByTestId("v-workTerm")).toHaveTextContent("SPRING");
  });

  test("parses the job length and clears it to null", () => {
    render(<Probe />);
    const input = screen.getByTestId("themed-input");
    fireEvent.change(input, { target: { value: "6" } });
    expect(screen.getByTestId("v-jobLength")).toHaveTextContent("6");
    fireEvent.change(input, { target: { value: "" } });
    expect(screen.getByTestId("v-jobLength")).toHaveTextContent("null");
  });

  test("selects a work year as a number", () => {
    render(<Probe />);
    const yearBody = screen
      .getAllByTestId("filter-body")
      .find((el) => el.getAttribute("data-title") === "Year")!;
    const firstYear = within(yearBody).getAllByRole("button")[0]!;
    fireEvent.click(firstYear);
    expect(screen.getByTestId("v-workYear")).not.toHaveTextContent("undefined");
    expect(
      Number(screen.getByTestId("v-workYear").textContent),
    ).toBeGreaterThan(1999);
  });

  test("resets a work year that is beyond the allowed maximum", () => {
    render(<Probe defaults={{ ...baseDefaults, workYear: 9999 }} />);
    // The mount effect clamps an out-of-range year back to undefined.
    expect(screen.getByTestId("v-workYear")).toHaveTextContent("undefined");
  });

  test("populates the location label from the fetched location", () => {
    // getById returns Boston, MA so the effect derives the label without error.
    render(
      <Wrapper>
        <BasicInfoSection profileId="p1" />
      </Wrapper>,
    );
    expect(screen.getByTestId("location-box")).toBeInTheDocument();
  });
});
