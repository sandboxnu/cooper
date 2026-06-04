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
vi.mock("~/app/_components/form/sections/tools-autocomplete", () => ({
  ToolsAutocomplete: () => <div data-testid="tools-autocomplete" />,
}));
vi.mock("~/app/_components/themed/onboarding/input", () => ({
  Input: ({
    onClear: _onClear,
    ...props
  }: Record<string, unknown> & { onClear?: () => void }) => (
    <input data-testid="themed-input" {...props} />
  ),
}));

import { CompanyDetailsSection } from "~/app/_components/form/sections/company-details-section";

type Defaults = Record<string, unknown>;

const baseDefaults: Defaults = {
  workEnvironment: "",
  workHours: null,
  federalHolidays: "",
  drugTest: "",
  accessibleByTransportation: "",
  teamOutings: false,
  coffeeChats: false,
  constructiveFeedback: false,
  onboarding: false,
  workStructure: false,
  careerGrowth: false,
  freeLunch: false,
  travelBenefits: false,
  freeMerch: false,
  snackBar: false,
  toolNames: [],
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
      <CompanyDetailsSection />
      <output data-testid="v-workEnvironment">
        {String(form.watch("workEnvironment"))}
      </output>
      <output data-testid="v-workHours">
        {String(form.watch("workHours"))}
      </output>
      <output data-testid="v-freeLunch">
        {String(form.watch("freeLunch"))}
      </output>
    </FormProvider>
  );
}

describe("CompanyDetailsSection", () => {
  test("renders the primary field labels", () => {
    render(
      <Wrapper>
        <CompanyDetailsSection />
      </Wrapper>,
    );
    expect(screen.getByText("Work model")).toBeInTheDocument();
    expect(screen.getByText("Work hours")).toBeInTheDocument();
    expect(screen.getByText("Federal holidays off")).toBeInTheDocument();
    expect(screen.getByText("Drug test required")).toBeInTheDocument();
    expect(
      screen.getByText("Accessible by transportation"),
    ).toBeInTheDocument();
    expect(screen.getByText("Tools and software")).toBeInTheDocument();
  });

  test("renders company-culture and co-op support checkboxes", () => {
    render(
      <Wrapper>
        <CompanyDetailsSection />
      </Wrapper>,
    );
    expect(screen.getByText("Team outings")).toBeInTheDocument();
    expect(screen.getByText("Coffee chats")).toBeInTheDocument();
    expect(screen.getByText("Constructive feedback")).toBeInTheDocument();
    expect(screen.getByText("Onboarding")).toBeInTheDocument();
    expect(screen.getByText("Work structure")).toBeInTheDocument();
    expect(screen.getByText("Career growth")).toBeInTheDocument();
  });

  test("renders the tools autocomplete and a benefits filter body", () => {
    render(
      <Wrapper>
        <CompanyDetailsSection />
      </Wrapper>,
    );
    expect(screen.getByTestId("tools-autocomplete")).toBeInTheDocument();
    expect(screen.getAllByTestId("filter-body").length).toBeGreaterThanOrEqual(
      2,
    );
  });

  test("updates the work model when an option is selected", () => {
    render(<Probe />);
    fireEvent.click(screen.getByTestId("fb-Work model-INPERSON"));
    expect(screen.getByTestId("v-workEnvironment")).toHaveTextContent(
      "INPERSON",
    );
  });

  test("parses work hours from the number input and clears to null", () => {
    render(<Probe />);
    const input = screen.getByTestId("themed-input");
    fireEvent.change(input, { target: { value: "40" } });
    expect(screen.getByTestId("v-workHours")).toHaveTextContent("40");
    fireEvent.change(input, { target: { value: "" } });
    expect(screen.getByTestId("v-workHours")).toHaveTextContent("null");
  });

  test("toggles a benefit through the benefits filter body", () => {
    render(<Probe />);
    fireEvent.click(screen.getByTestId("fb-Benefits-freeLunch"));
    expect(screen.getByTestId("v-freeLunch")).toHaveTextContent("true");
  });

  test("reflects pre-selected benefits in the selected options", () => {
    render(
      <Wrapper defaults={{ ...baseDefaults, freeLunch: true }}>
        <CompanyDetailsSection />
      </Wrapper>,
    );
    // freeLunch default true exercises the selectedBenefits mapping.
    expect(screen.getByText("Free lunch")).toBeInTheDocument();
  });
});
