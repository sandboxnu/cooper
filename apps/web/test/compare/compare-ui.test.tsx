import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import {
  CompareControls,
  CompareColumns,
} from "~/app/_components/compare/compare-ui";

const mockCompare = {
  isCompareMode: false,
  comparedRoleIds: [] as string[],
  reservedSlots: 0,
  maxColumns: 3,
  enterCompareMode: vi.fn(),
  exitCompareMode: vi.fn(),
  addRoleId: vi.fn(),
  removeRoleId: vi.fn(),
  addSlot: vi.fn(),
  clear: vi.fn(),
};

vi.mock("~/app/_components/compare/compare-context", () => ({
  useCompare: () => mockCompare,
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img src="/icon.svg" alt={alt} />,
}));

vi.mock("~/trpc/react", () => ({
  api: {
    role: {
      getManyByIds: {
        useQuery: () => ({ data: [], isLoading: false }),
      },
    },
  },
}));

vi.mock("~/app/_components/reviews/role-info", () => ({
  RoleInfo: () => <div data-testid="role-info">RoleInfo</div>,
}));

describe("CompareControls", () => {
  beforeEach(() => {
    mockCompare.isCompareMode = false;
    mockCompare.comparedRoleIds = [];
    mockCompare.reservedSlots = 0;
    mockCompare.enterCompareMode.mockClear();
    mockCompare.exitCompareMode.mockClear();
    mockCompare.addSlot.mockClear();
  });

  test("returns null when anchorRoleId is not provided", () => {
    const { container } = render(<CompareControls />);
    expect(container.firstChild).toBeNull();
  });

  test("returns null when inTopBar and not in compare mode", () => {
    const { container } = render(
      <CompareControls anchorRoleId="r1" inTopBar />,
    );
    expect(container.firstChild).toBeNull();
  });

  test("renders COMPARE WITH button when not in compare mode", () => {
    render(<CompareControls anchorRoleId="r1" />);
    expect(screen.getByRole("button", { name: /compare with/i })).toBeInTheDocument();
  });

  test("clicking COMPARE WITH calls enterCompareMode", () => {
    render(<CompareControls anchorRoleId="r1" />);
    fireEvent.click(screen.getByRole("button", { name: /compare with/i }));
    expect(mockCompare.enterCompareMode).toHaveBeenCalledTimes(1);
  });

  test("when in compare mode renders ADD COMPARISON and EXIT", () => {
    mockCompare.isCompareMode = true;
    render(<CompareControls anchorRoleId="r1" />);
    expect(screen.getByRole("button", { name: /add comparison/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /exit/i })).toBeInTheDocument();
  });

  test("clicking EXIT calls exitCompareMode", () => {
    mockCompare.isCompareMode = true;
    render(<CompareControls anchorRoleId="r1" />);
    fireEvent.click(screen.getByRole("button", { name: /exit/i }));
    expect(mockCompare.exitCompareMode).toHaveBeenCalledTimes(1);
  });
});

describe("CompareColumns", () => {
  const anchorRole = {
    id: "anchor-1",
    title: "Engineer",
    companyName: "Acme",
  } as never;

  test("renders anchor role column", () => {
    render(
      <CompareColumns anchorRole={anchorRole} />,
    );
    expect(screen.getByTestId("role-info")).toBeInTheDocument();
  });
});
