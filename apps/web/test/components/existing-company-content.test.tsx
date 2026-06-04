import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { beforeEach, describe, expect, test, vi } from "vitest";

const h = vi.hoisted(() => ({
  state: {
    companies: [
      { id: "c1", name: "Acme", industry: "Technology" },
      { id: "c2", name: "Beta", industry: "Finance" },
    ] as { id: string; name: string; industry: string }[],
    roles: [] as { id: string; title: string }[],
    locations: [] as unknown[],
  },
  createCompanySpy: vi
    .fn()
    .mockResolvedValue({ roleId: "r1", companyId: "c1" }),
  createRoleSpy: vi.fn().mockResolvedValue([{ id: "newrole" }]),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

// A light stand-in for FilterBody that exposes its callbacks as buttons so we
// can drive selection/search without the real autocomplete UI.
vi.mock("~/app/_components/filters/filter-body", () => ({
  default: ({
    title,
    options,
    placeholder,
    onSelectionChange,
    onSearchChange,
  }: {
    title: string;
    options: { value: string }[];
    placeholder?: string;
    onSelectionChange?: (selected: (string | undefined)[]) => void;
    onSearchChange?: (term: string) => void;
  }) => (
    <div data-testid={`filter-${title}`}>
      <span>{placeholder}</span>
      <span data-testid={`count-${title}`}>{options.length}</span>
      <button
        data-testid={`select-${title}`}
        onClick={() => onSelectionChange?.([options[0]?.value])}
      >
        select {title}
      </button>
      <button
        data-testid={`clear-${title}`}
        onClick={() => onSelectionChange?.([])}
      >
        clear {title}
      </button>
      <input
        data-testid={`search-${title}`}
        onChange={(e) => onSearchChange?.(e.target.value)}
      />
    </div>
  ),
}));

vi.mock("~/app/_components/location", () => ({
  default: () => <div data-testid="location-box" />,
}));
vi.mock("~/app/_components/companies/company-card-preview", () => ({
  CompanyCardPreview: ({ companyObj }: { companyObj: { name: string } }) => (
    <div data-testid="company-card">{companyObj.name}</div>
  ),
}));

vi.mock("@cooper/ui/hooks/use-custom-toast", () => ({
  useCustomToast: () => ({
    toast: { success: h.toastSuccess, error: h.toastError },
  }),
}));

vi.mock("~/trpc/react", () => ({
  api: {
    company: {
      list: { useQuery: () => ({ data: h.state.companies, refetch: vi.fn() }) },
      createWithRole: {
        useMutation: () => ({
          mutateAsync: h.createCompanySpy,
          isPending: false,
        }),
      },
    },
    role: {
      getByCompany: {
        useQuery: () => ({ data: h.state.roles, refetch: vi.fn() }),
      },
      create: {
        useMutation: () => ({ mutateAsync: h.createRoleSpy, isPending: false }),
      },
    },
    location: {
      getByPopularity: { useQuery: () => ({ data: h.state.locations }) },
    },
  },
}));

import ExistingCompanyContent from "~/app/_components/reviews/existing-company-content";

function Wrapper({
  children,
  defaults = {},
}: {
  children: ReactNode;
  defaults?: Record<string, unknown>;
}) {
  const form = useForm({
    defaultValues: {
      companyName: "",
      roleName: "",
      industry: "",
      locationId: "",
      title: "",
      ...defaults,
    },
  });
  return <FormProvider {...form}>{children}</FormProvider>;
}

function renderContent(defaults?: Record<string, unknown>) {
  return render(
    <Wrapper defaults={defaults}>
      <ExistingCompanyContent profileId="p1" />
    </Wrapper>,
  );
}

describe("ExistingCompanyContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.state.companies = [
      { id: "c1", name: "Acme", industry: "Technology" },
      { id: "c2", name: "Beta", industry: "Finance" },
    ];
    h.state.roles = [];
  });

  test("renders the company and role pickers", () => {
    renderContent();
    expect(screen.getByText("Company name")).toBeInTheDocument();
    expect(screen.getByText("I don't see my company")).toBeInTheDocument();
    expect(screen.getByText("I don't see my role")).toBeInTheDocument();
    // Both company options are passed through to FilterBody.
    expect(screen.getByTestId("count-Company")).toHaveTextContent("2");
  });

  test("selecting a company shows its preview card", async () => {
    renderContent();
    fireEvent.click(screen.getByTestId("select-Company"));
    expect(await screen.findByTestId("company-card")).toHaveTextContent("Acme");
  });

  test("clearing the company selection removes the preview", async () => {
    renderContent();
    fireEvent.click(screen.getByTestId("select-Company"));
    expect(await screen.findByTestId("company-card")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("clear-Company"));
    await waitFor(() =>
      expect(screen.queryByTestId("company-card")).not.toBeInTheDocument(),
    );
  });

  test("company search filters the option list", () => {
    renderContent();
    fireEvent.change(screen.getByTestId("search-Company"), {
      target: { value: "bet" },
    });
    expect(screen.getByTestId("count-Company")).toHaveTextContent("1");
  });

  test("'I don't see my company' reveals the add-company form", () => {
    renderContent();
    fireEvent.click(screen.getByText("I don't see my company"));
    expect(screen.getByText("Add Your Company")).toBeInTheDocument();
    expect(screen.getByText("Create Company & Role")).toBeInTheDocument();
  });

  test("creating a company validates the company name", () => {
    renderContent();
    fireEvent.click(screen.getByText("I don't see my company"));
    fireEvent.click(screen.getByText("Create Company & Role"));
    expect(h.toastError).toHaveBeenCalledWith(
      "Company name must be at least 3 characters.",
    );
    expect(h.createCompanySpy).not.toHaveBeenCalled();
  });

  test("creating a company validates the industry", () => {
    renderContent();
    fireEvent.click(screen.getByText("I don't see my company"));
    fireEvent.change(screen.getAllByPlaceholderText("Enter")[0]!, {
      target: { value: "New Company" },
    });
    fireEvent.click(screen.getByText("Create Company & Role"));
    expect(h.toastError).toHaveBeenCalledWith("Please select an industry.");
  });

  test("creating a company validates the location", () => {
    renderContent({ industry: "Technology" });
    fireEvent.click(screen.getByText("I don't see my company"));
    fireEvent.change(screen.getAllByPlaceholderText("Enter")[0]!, {
      target: { value: "New Company" },
    });
    fireEvent.click(screen.getByText("Create Company & Role"));
    expect(h.toastError).toHaveBeenCalledWith("Please select a location.");
  });

  test("creating a company validates the role title", () => {
    renderContent({ industry: "Technology", locationId: "loc1", title: "" });
    fireEvent.click(screen.getByText("I don't see my company"));
    fireEvent.change(screen.getAllByPlaceholderText("Enter")[0]!, {
      target: { value: "New Company" },
    });
    fireEvent.click(screen.getByText("Create Company & Role"));
    expect(h.toastError).toHaveBeenCalledWith(
      "Role title must be at least 3 characters.",
    );
  });

  test("submits when every company field is provided", async () => {
    renderContent({
      industry: "Technology",
      locationId: "loc1",
      title: "Engineer",
    });
    fireEvent.click(screen.getByText("I don't see my company"));
    fireEvent.change(screen.getAllByPlaceholderText("Enter")[0]!, {
      target: { value: "New Company" },
    });
    fireEvent.click(screen.getByText("Create Company & Role"));
    await waitFor(() =>
      expect(h.createCompanySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          companyName: "New Company",
          industry: "Technology",
          createdBy: "p1",
        }),
      ),
    );
  });

  test("shows a hint when the selected company has no roles", async () => {
    h.state.roles = [];
    renderContent();
    fireEvent.click(screen.getByTestId("select-Company"));
    expect(
      await screen.findByText(/No roles available for this company/),
    ).toBeInTheDocument();
  });

  // The role checkbox is the second checkbox on the page; its label is not
  // wired with htmlFor, so we toggle the control directly.
  const roleCheckbox = () => screen.getAllByRole("checkbox")[1]!;

  test("'I don't see my role' reveals the add-role form", () => {
    renderContent();
    fireEvent.click(roleCheckbox());
    expect(screen.getByText("Add Your Role")).toBeInTheDocument();
    expect(screen.getByText("Create Role")).toBeInTheDocument();
  });

  test("creating a role requires a company to be selected first", () => {
    renderContent();
    fireEvent.click(roleCheckbox());
    fireEvent.click(screen.getByText("Create Role"));
    expect(h.toastError).toHaveBeenCalledWith("Please select a company first.");
    expect(h.createRoleSpy).not.toHaveBeenCalled();
  });

  test("submits a new role once a company is selected and the title is valid", async () => {
    renderContent();
    fireEvent.click(screen.getByTestId("select-Company"));
    fireEvent.click(roleCheckbox());
    fireEvent.change(screen.getByPlaceholderText("Enter"), {
      target: { value: "Backend Engineer" },
    });
    fireEvent.click(screen.getByText("Create Role"));
    await waitFor(() =>
      expect(h.createRoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Backend Engineer",
          companyId: "c1",
          createdBy: "p1",
        }),
      ),
    );
  });

  test("rejects an invalid (too short) new role title", async () => {
    renderContent();
    fireEvent.click(screen.getByTestId("select-Company"));
    fireEvent.click(roleCheckbox());
    fireEvent.change(screen.getByPlaceholderText("Enter"), {
      target: { value: "Dev" },
    });
    fireEvent.click(screen.getByText("Create Role"));
    await waitFor(() => expect(h.toastError).toHaveBeenCalled());
    expect(h.createRoleSpy).not.toHaveBeenCalled();
  });
});
