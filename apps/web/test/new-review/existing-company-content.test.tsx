import { FormProvider, useForm } from "react-hook-form";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import ExistingCompanyContent from "~/app/_components/reviews/new-review/existing-company-content";

vi.mock("~/trpc/react", () => ({
  api: {
    company: {
      list: {
        useQuery: () => ({
          data: [
            { id: "c1", name: "Acme Corp" },
            { id: "c2", name: "Beta Inc" },
          ],
        }),
      },
      createWithRole: {
        useMutation: () => ({
          mutateAsync: vi.fn(),
          isPending: false,
        }),
      },
    },
    role: {
      getByCompany: {
        useQuery: () => ({ data: [] }),
      },
      create: {
        useMutation: () => ({
          mutateAsync: vi.fn(),
          isPending: false,
        }),
      },
    },
    location: {
      getByPrefix: {
        useQuery: () => ({ data: [] }),
      },
    },
  },
}));

vi.mock("@cooper/ui/hooks/use-custom-toast", () => ({
  useCustomToast: () => ({ toast: { error: vi.fn(), success: vi.fn() } }),
}));

vi.mock("~/app/_components/location", () => ({
  default: () => <div data-testid="location-box">Location</div>,
}));

vi.mock("~/app/_components/companies/company-card-preview", () => ({
  CompanyCardPreview: () => <div data-testid="company-card-preview">Preview</div>,
}));

vi.mock("~/app/_components/combo-box", () => ({
  default: () => <div data-testid="combo-box">ComboBox</div>,
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
      companyName: "",
      industry: "",
      locationId: "",
      roleName: "",
      title: "",
      ...defaultValues,
    },
  });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe("ExistingCompanyContent", () => {
  test("renders Company name label", () => {
    render(
      <Wrapper>
        <ExistingCompanyContent />
      </Wrapper>,
    );
    expect(screen.getByText(/Company name/)).toBeInTheDocument();
  });

  test("renders I don't see my company checkbox", () => {
    render(
      <Wrapper>
        <ExistingCompanyContent />
      </Wrapper>,
    );
    expect(screen.getByText("I don't see my company")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox").length).toBeGreaterThan(0);
  });

  test("renders ComboBox for company selection", () => {
    render(
      <Wrapper>
        <ExistingCompanyContent />
      </Wrapper>,
    );
    expect(screen.getByTestId("combo-box")).toBeInTheDocument();
  });

  test("shows Add Your Company section when checkbox is checked", () => {
    render(
      <Wrapper>
        <ExistingCompanyContent />
      </Wrapper>,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    const companyCheckbox = checkboxes.find(
      (el) => el.closest("div")?.textContent?.includes("I don't see my company"),
    ) ?? checkboxes[0];
    fireEvent.click(companyCheckbox);
    expect(screen.getByText("Add Your Company")).toBeInTheDocument();
    expect(screen.getByText(/We'll verify this information/)).toBeInTheDocument();
  });
});
