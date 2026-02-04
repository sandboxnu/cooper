import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import LocationBox from "~/app/_components/location";

vi.mock("~/app/_components/combo-box", () => ({
  default: ({
    defaultLabel,
    currLabel,
    onSelect,
    onClear,
    onChange,
  }: {
    defaultLabel: string;
    currLabel: string;
    onSelect: (v: string) => void;
    onClear?: () => void;
    onChange?: (v: string) => void;
  }) => (
    <div data-testid="location-combobox">
      <span data-testid="default-label">{defaultLabel}</span>
      <span data-testid="curr-label">{currLabel}</span>
      <button
        type="button"
        onClick={() => onSelect("Boston, MA, USA")}
        data-testid="select-location"
      >
        Select
      </button>
      <button
        type="button"
        onClick={() => onClear?.()}
        data-testid="clear-location"
      >
        Clear
      </button>
      <input
        data-testid="location-search"
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  ),
}));

function Wrapper({
  children,
  defaultValues = {},
}: {
  children: (form: unknown) => React.ReactNode;
  defaultValues?: Record<string, unknown>;
}) {
  const form = useForm({
    defaultValues: {
      locationId: "",
      searchLocation: "",
      searchIndustry: "",
      ...defaultValues,
    },
  });
  return <FormProvider {...form}>{children(form)}</FormProvider>;
}

describe("LocationBox", () => {
  test("renders ComboBox with form variant when searchBar is false", () => {
    render(
      <Wrapper>
        {(form) => (
          <LocationBox
            searchBar={false}
            form={form as never}
            locationLabel=""
            setSearchTerm={vi.fn()}
            locationValuesAndLabels={[]}
            setLocationLabel={vi.fn()}
          />
        )}
      </Wrapper>,
    );
    expect(screen.getByTestId("location-combobox")).toBeInTheDocument();
    expect(screen.getByTestId("default-label")).toHaveTextContent(
      "Search by location...",
    );
  });

  test("renders with Location default label when searchBar is true", () => {
    render(
      <Wrapper defaultValues={{ searchLocation: "" }}>
        {(form) => (
          <LocationBox
            searchBar
            form={form as never}
            locationLabel=""
            setSearchTerm={vi.fn()}
            locationValuesAndLabels={[]}
            setLocationLabel={vi.fn()}
          />
        )}
      </Wrapper>,
    );
    expect(screen.getByTestId("default-label")).toHaveTextContent("Location");
  });

  test("calls setLocationLabel and field.onChange when option selected (form mode)", () => {
    const setLocationLabel = vi.fn();
    let formRef: ReturnType<typeof useForm> | undefined;
    render(
      <Wrapper>
        {(form) => {
          formRef = form as ReturnType<typeof useForm>;
          return (
            <LocationBox
              searchBar={false}
              form={form as never}
              locationLabel=""
              setSearchTerm={vi.fn()}
              locationValuesAndLabels={[
                { value: "loc-1", label: "Boston, MA, USA" },
              ]}
              setLocationLabel={setLocationLabel}
            />
          );
        }}
      </Wrapper>,
    );
    fireEvent.click(screen.getByTestId("select-location"));
    expect(setLocationLabel).toHaveBeenCalledWith("Boston, MA, USA");
    if (!formRef) throw new Error("formRef not set");
    expect(formRef.getValues("locationId")).toBe("loc-1");
  });

  test("calls setSearchTerm when search input changes", () => {
    const setSearchTerm = vi.fn();
    render(
      <Wrapper>
        {(form) => (
          <LocationBox
            searchBar={false}
            form={form as never}
            locationLabel=""
            setSearchTerm={setSearchTerm}
            locationValuesAndLabels={[]}
            setLocationLabel={vi.fn()}
          />
        )}
      </Wrapper>,
    );
    const input = screen.getByTestId("location-search");
    fireEvent.change(input, { target: { value: "Bos" } });
    expect(setSearchTerm).toHaveBeenCalledWith("Bos");
  });

  test("calls onClear when clear clicked and onClear prop provided", () => {
    const onClear = vi.fn();
    render(
      <Wrapper defaultValues={{ locationId: "loc-1" }}>
        {(form) => (
          <LocationBox
            searchBar={false}
            form={form as never}
            locationLabel="Boston"
            setSearchTerm={vi.fn()}
            locationValuesAndLabels={[]}
            setLocationLabel={vi.fn()}
            onClear={onClear}
          />
        )}
      </Wrapper>,
    );
    fireEvent.click(screen.getByTestId("clear-location"));
    expect(onClear).toHaveBeenCalled();
  });
});
