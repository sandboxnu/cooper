import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { render, screen, waitFor } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import ExistingCompanyContent from "~/app/_components/reviews/new-review/existing-company-content";

const mockRefetch = vi.fn();
const mockCompanyListData = [
  { id: "c1", name: "Acme Corp" },
  { id: "c2", name: "Beta Inc" },
];

vi.mock("~/trpc/react", () => ({
  api: {
    company: {
      list: {
        useQuery: () => ({
          data: mockCompanyListData,
          refetch: mockRefetch,
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
        useQuery: () => ({ data: [], refetch: mockRefetch }),
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

const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();
vi.mock("@cooper/ui/hooks/use-custom-toast", () => ({
  useCustomToast: () => ({
    toast: {
      error: mockToastError,
      success: mockToastSuccess,
    },
  }),
}));

vi.mock("~/app/_components/location", () => ({
  default: () => <div data-testid="location-box">Location</div>,
}));

vi.mock("~/app/_components/companies/company-card-preview", () => ({
  CompanyCardPreview: () => (
    <div data-testid="company-card-preview">Preview</div>
  ),
}));

vi.mock("~/app/_components/combo-box", () => ({
  default: ({ onSelect }: { onSelect?: (label: string) => void }) => (
    <div data-testid="combo-box">
      <button
        type="button"
        onClick={() => onSelect?.("Acme Corp")}
        data-testid="select-company-c1"
      >
        Select Acme
      </button>
    </div>
  ),
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
    const companyCheckbox =
      checkboxes.find((el) =>
        el.closest("div")?.textContent?.includes("I don't see my company"),
      ) ?? checkboxes[0];
    fireEvent.click(companyCheckbox);
    expect(screen.getByText("Add Your Company")).toBeInTheDocument();
    expect(
      screen.getByText(/We'll verify this information/),
    ).toBeInTheDocument();
  });

  test("shows Company Name, Industry, Location, Your Role in Add Your Company section", () => {
    render(
      <Wrapper>
        <ExistingCompanyContent />
      </Wrapper>,
    );
    const companyCheckbox = screen
      .getAllByRole("checkbox")
      .find((el) =>
        el.closest("div")?.textContent?.includes("I don't see my company"),
      );
    fireEvent.click(companyCheckbox!);
    expect(screen.getByText(/Company Name/)).toBeInTheDocument();
    expect(screen.getByText(/Industry/)).toBeInTheDocument();
    expect(screen.getAllByText(/Location/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Your Role/).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByRole("button", { name: "Create Company & Role" }),
    ).toBeInTheDocument();
  });

  test("shows Create Company & Role button in Add Your Company section", () => {
    render(
      <Wrapper>
        <ExistingCompanyContent />
      </Wrapper>,
    );
    const companyCheckbox = screen
      .getAllByRole("checkbox")
      .find((el) =>
        el.closest("div")?.textContent?.includes("I don't see my company"),
      );
    fireEvent.click(companyCheckbox!);
    const button = screen.getByRole("button", {
      name: "Create Company & Role",
    });
    expect(button).toBeInTheDocument();
  });

  test("calls toast.error when Create Company & Role clicked with empty company name", async () => {
    mockToastError.mockClear();
    render(
      <Wrapper>
        <ExistingCompanyContent />
      </Wrapper>,
    );
    const companyCheckbox = screen
      .getAllByRole("checkbox")
      .find((el) =>
        el.closest("div")?.textContent?.includes("I don't see my company"),
      );
    fireEvent.click(companyCheckbox!);
    const button = screen.getByRole("button", {
      name: "Create Company & Role",
    });
    fireEvent.click(button);
    expect(mockToastError).toHaveBeenCalledWith(
      "Company name must be at least 3 characters.",
    );
  });

  test("shows Adding a review for and CompanyCardPreview when company is selected", () => {
    render(
      <Wrapper defaultValues={{ companyName: "c1" }}>
        <ExistingCompanyContent />
      </Wrapper>,
    );
    expect(screen.getByText("Adding a review for")).toBeInTheDocument();
    expect(screen.getByTestId("company-card-preview")).toBeInTheDocument();
  });

  test("renders Your Role section and I don't see my role checkbox", () => {
    render(
      <Wrapper>
        <ExistingCompanyContent />
      </Wrapper>,
    );
    expect(screen.getByText(/Your Role/)).toBeInTheDocument();
    expect(screen.getByText("I don't see my role")).toBeInTheDocument();
  });

  test("shows Add Your Role section when I don't see my role is checked", () => {
    render(
      <Wrapper defaultValues={{ companyName: "c1" }}>
        <ExistingCompanyContent />
      </Wrapper>,
    );
    const roleCheckbox = screen
      .getAllByRole("checkbox")
      .find((el) =>
        el.closest("div")?.textContent?.includes("I don't see my role"),
      );
    fireEvent.click(roleCheckbox!);
    expect(screen.getByText("Add Your Role")).toBeInTheDocument();
    expect(
      screen.getByText(/We'll verify this information before it appears/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Role" }),
    ).toBeInTheDocument();
  });

  test("calls toast.error when Create Role clicked without selecting company", async () => {
    mockToastError.mockClear();
    render(
      <Wrapper>
        <ExistingCompanyContent />
      </Wrapper>,
    );
    const roleCheckbox = screen
      .getAllByRole("checkbox")
      .find((el) =>
        el.closest("div")?.textContent?.includes("I don't see my role"),
      );
    fireEvent.click(roleCheckbox!);
    const createRoleButton = screen.getByRole("button", {
      name: "Create Role",
    });
    fireEvent.click(createRoleButton);
    expect(mockToastError).toHaveBeenCalledWith(
      "Please select a company first.",
    );
  });

  test("calls toast.error when Create Role clicked with short title", async () => {
    mockToastError.mockClear();
    render(
      <Wrapper>
        <ExistingCompanyContent />
      </Wrapper>,
    );
    fireEvent.click(screen.getByTestId("select-company-c1"));
    const roleCheckbox = screen
      .getAllByRole("checkbox")
      .find((el) =>
        el.closest("div")?.textContent?.includes("I don't see my role"),
      );
    fireEvent.click(roleCheckbox!);
    const roleTitleInput = screen.getByPlaceholderText("Enter");
    fireEvent.change(roleTitleInput, { target: { value: "ab" } });
    const createRoleButton = screen.getByRole("button", {
      name: "Create Role",
    });
    fireEvent.click(createRoleButton);
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Please enter a valid role title (at least 5 characters).",
      );
    });
  });

  test("renders profileId when passed", () => {
    render(
      <Wrapper>
        <ExistingCompanyContent profileId="profile-123" />
      </Wrapper>,
    );
    expect(screen.getByText(/Company name/)).toBeInTheDocument();
  });

  test("shows No roles available when company selected and roles empty", () => {
    render(
      <Wrapper>
        <ExistingCompanyContent />
      </Wrapper>,
    );
    fireEvent.click(screen.getByTestId("select-company-c1"));
    expect(
      screen.getByText(
        "No roles available for this company. Please add a role first.",
      ),
    ).toBeInTheDocument();
  });
});
