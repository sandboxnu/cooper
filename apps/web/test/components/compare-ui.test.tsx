import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { RoleType } from "@cooper/db/schema";

// --- mocks ------------------------------------------------------------------

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

vi.mock("@cooper/ui", () => ({
  cn: (...inputs: unknown[]) => inputs.flat().filter(Boolean).join(" "),
}));

vi.mock("@cooper/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("~/app/_components/roles/role-info", () => ({
  RoleInfo: ({ roleObj }: { roleObj: { id: string; title?: string } }) => (
    <div data-testid="role-info">{roleObj.title ?? roleObj.id}</div>
  ),
}));

// trpc api mock - controllable per test
const getByIdQuery = vi.fn();
const getManyByIdsQuery = vi.fn();

vi.mock("~/trpc/react", () => ({
  api: {
    role: {
      getById: {
        useQuery: (...args: unknown[]) => getByIdQuery(...args),
      },
      getManyByIds: {
        useQuery: (...args: unknown[]) => getManyByIdsQuery(...args),
      },
    },
  },
}));

import {
  CompareColumns,
  CompareControls,
} from "~/app/_components/compare/compare-ui";
import {
  CompareProvider,
  useCompare,
} from "~/app/_components/compare/compare-context";

const anchorRole = {
  id: "anchor-1",
  title: "Anchor Role",
} as unknown as RoleType;

// Helper to drive the context from inside the provider during a render.
let driver: ReturnType<typeof useCompare> | null = null;
function Driver() {
  driver = useCompare();
  return null;
}

function renderWithProvider(ui: React.ReactNode) {
  return render(
    <CompareProvider>
      <Driver />
      {ui}
    </CompareProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  driver = null;
  getByIdQuery.mockReturnValue({ data: undefined });
  getManyByIdsQuery.mockReturnValue({ data: [] });
});

// --- CompareControls --------------------------------------------------------

describe("CompareControls", () => {
  test("renders nothing without an anchor role id", () => {
    const { container } = renderWithProvider(<CompareControls />);
    expect(container.querySelector("button")).toBeNull();
  });

  test("renders the COMPARE button when not in compare mode", () => {
    renderWithProvider(<CompareControls anchorRoleId="anchor-1" />);
    expect(
      screen.getByRole("button", { name: /COMPARE/i }),
    ).toBeInTheDocument();
  });

  test("entering compare mode swaps to the EXIT COMPARE button", () => {
    renderWithProvider(<CompareControls anchorRoleId="anchor-1" />);
    fireEvent.click(screen.getByRole("button", { name: /COMPARE/i }));
    expect(
      screen.getByRole("button", { name: /EXIT COMPARE/i }),
    ).toBeInTheDocument();
    expect(driver?.isCompareMode).toBe(true);
    expect(driver?.anchorRoleId).toBe("anchor-1");
  });

  test("clicking EXIT COMPARE exits compare mode", () => {
    renderWithProvider(<CompareControls anchorRoleId="anchor-1" />);
    fireEvent.click(screen.getByRole("button", { name: /COMPARE/i }));
    fireEvent.click(screen.getByRole("button", { name: /EXIT COMPARE/i }));
    expect(driver?.isCompareMode).toBe(false);
    expect(
      screen.getByRole("button", { name: /COMPARE/i }),
    ).toBeInTheDocument();
  });
});

// --- CompareColumns ---------------------------------------------------------

describe("CompareColumns", () => {
  test("renders the anchor role plus an empty drop slot when there is capacity", () => {
    const { container } = renderWithProvider(
      <CompareColumns anchorRole={anchorRole} />,
    );
    expect(screen.getByText("Anchor Role")).toBeInTheDocument();
    // one empty placeholder (dashed border drop slot) present
    expect(container.querySelector(".border-dashed")).not.toBeNull();
  });

  test("renders a loading anchor slot when the anchor role data is unavailable", () => {
    getByIdQuery.mockReturnValue({ data: undefined });
    // Provide a different persisted anchor id so it won't match anchorRole.id
    window.localStorage.setItem(
      "cooper.compare-state",
      JSON.stringify({
        comparedRoleIds: [],
        reservedSlots: 0,
        anchorRoleId: "other-anchor",
      }),
    );
    renderWithProvider(<CompareColumns anchorRole={anchorRole} />);
    expect(screen.getByText("Loading role...")).toBeInTheDocument();
  });

  test("renders loaded compared roles fetched by getManyByIds", () => {
    getManyByIdsQuery.mockReturnValue({
      data: [{ id: "r1", title: "Role One" }],
    });
    window.localStorage.setItem(
      "cooper.compare-state",
      JSON.stringify({
        comparedRoleIds: ["r1"],
        reservedSlots: 0,
        anchorRoleId: "anchor-1",
      }),
    );
    renderWithProvider(<CompareColumns anchorRole={anchorRole} />);
    expect(screen.getByText("Anchor Role")).toBeInTheDocument();
    expect(screen.getByText("Role One")).toBeInTheDocument();
  });

  test("renders a loading slot for compared roles not yet loaded", () => {
    getManyByIdsQuery.mockReturnValue({ data: [] });
    window.localStorage.setItem(
      "cooper.compare-state",
      JSON.stringify({
        comparedRoleIds: ["r1"],
        reservedSlots: 0,
        anchorRoleId: "anchor-1",
      }),
    );
    renderWithProvider(<CompareColumns anchorRole={anchorRole} />);
    expect(screen.getByText("Loading role...")).toBeInTheDocument();
  });

  test("shows no empty slot once columns reach the max", () => {
    getManyByIdsQuery.mockReturnValue({
      data: [
        { id: "r1", title: "Role One" },
        { id: "r2", title: "Role Two" },
      ],
    });
    window.localStorage.setItem(
      "cooper.compare-state",
      JSON.stringify({
        comparedRoleIds: ["r1", "r2"],
        reservedSlots: 0,
        anchorRoleId: "anchor-1",
      }),
    );
    renderWithProvider(<CompareColumns anchorRole={anchorRole} />);
    expect(screen.getByText("Anchor Role")).toBeInTheDocument();
    expect(screen.getByText("Role One")).toBeInTheDocument();
    expect(screen.getByText("Role Two")).toBeInTheDocument();
    // no "Drag in..." dragging label because no empty slot when dragging
    expect(
      screen.queryByText("Drag in or select a card from the list"),
    ).toBeNull();
  });
});

// --- DropSlot interactions (rendered via CompareColumns) ---------------------

describe("DropSlot drag-and-drop", () => {
  function getDropSlot(container: HTMLElement) {
    const slot = container.querySelector(".border-dashed");
    if (!slot) throw new Error("drop slot not found");
    return slot as HTMLElement;
  }

  function makeDataTransfer(map: Record<string, string>): DataTransfer {
    return {
      getData: (type: string) => map[type] ?? "",
    } as unknown as DataTransfer;
  }

  test("ignores drag interactions when not in compare mode", () => {
    const { container } = renderWithProvider(
      <CompareColumns anchorRole={anchorRole} />,
    );
    const slot = getDropSlot(container);
    // not in compare mode: dragOver should be a no-op (no active styling)
    fireEvent.dragOver(slot);
    expect(slot.className).not.toContain("border-cooper-blue-400");
  });

  test("activates on drag over and deactivates on drag leave in compare mode", () => {
    const { container } = renderWithProvider(
      <CompareColumns anchorRole={anchorRole} />,
    );
    act(() => driver?.enterCompareMode("anchor-1"));
    const slot = getDropSlot(container);
    fireEvent.dragOver(slot);
    expect(slot.className).toContain("border-cooper-blue-400");
    fireEvent.dragLeave(slot);
    expect(slot.className).not.toContain("border-cooper-blue-400");
  });

  test("drop adds a new role id from application/role-id", () => {
    const { container } = renderWithProvider(
      <CompareColumns anchorRole={anchorRole} />,
    );
    act(() => driver?.enterCompareMode("anchor-1"));
    const slot = getDropSlot(container);
    fireEvent.drop(slot, {
      dataTransfer: makeDataTransfer({ "application/role-id": "new-role" }),
    });
    expect(driver?.comparedRoleIds).toContain("new-role");
  });

  test("drop falls back to text/plain data", () => {
    const { container } = renderWithProvider(
      <CompareColumns anchorRole={anchorRole} />,
    );
    act(() => driver?.enterCompareMode("anchor-1"));
    const slot = getDropSlot(container);
    fireEvent.drop(slot, {
      dataTransfer: makeDataTransfer({ "text/plain": "plain-role" }),
    });
    expect(driver?.comparedRoleIds).toContain("plain-role");
  });

  test("drop ignores the anchor role id", () => {
    const { container } = renderWithProvider(
      <CompareColumns anchorRole={anchorRole} />,
    );
    act(() => driver?.enterCompareMode("anchor-1"));
    const slot = getDropSlot(container);
    fireEvent.drop(slot, {
      dataTransfer: makeDataTransfer({ "application/role-id": "anchor-1" }),
    });
    expect(driver?.comparedRoleIds).not.toContain("anchor-1");
  });

  test("drop ignores empty payloads", () => {
    const { container } = renderWithProvider(
      <CompareColumns anchorRole={anchorRole} />,
    );
    act(() => driver?.enterCompareMode("anchor-1"));
    const before = [...(driver?.comparedRoleIds ?? [])];
    const slot = getDropSlot(container);
    fireEvent.drop(slot, { dataTransfer: makeDataTransfer({}) });
    expect(driver?.comparedRoleIds).toEqual(before);
  });

  test("drop is a no-op when not in compare mode", () => {
    const { container } = renderWithProvider(
      <CompareColumns anchorRole={anchorRole} />,
    );
    const slot = getDropSlot(container);
    fireEvent.drop(slot, {
      dataTransfer: makeDataTransfer({ "application/role-id": "x" }),
    });
    expect(driver?.comparedRoleIds ?? []).not.toContain("x");
  });

  test("window dragstart on a draggable element sets dragging while in compare mode", () => {
    const { container } = renderWithProvider(
      <CompareColumns anchorRole={anchorRole} />,
    );
    act(() => driver?.enterCompareMode("anchor-1"));

    const draggable = document.createElement("div");
    draggable.setAttribute("draggable", "true");
    document.body.appendChild(draggable);

    act(() => {
      const evt = new Event("dragstart", { bubbles: true });
      Object.defineProperty(evt, "target", { value: draggable });
      window.dispatchEvent(evt);
    });
    expect(driver?.isDragging).toBe(true);

    // dragging label should now appear in the empty slot
    expect(
      screen.getByText("Drag in or select a card from the list"),
    ).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event("dragend"));
    });
    expect(driver?.isDragging).toBe(false);

    document.body.removeChild(draggable);
    // touch container to satisfy lint (unused var guard)
    expect(container).toBeTruthy();
  });

  test("window dragstart ignores non-draggable targets", () => {
    renderWithProvider(<CompareColumns anchorRole={anchorRole} />);
    act(() => driver?.enterCompareMode("anchor-1"));

    const plain = document.createElement("span");
    document.body.appendChild(plain);
    act(() => {
      const evt = new Event("dragstart", { bubbles: true });
      Object.defineProperty(evt, "target", { value: plain });
      window.dispatchEvent(evt);
    });
    expect(driver?.isDragging).toBe(false);
    document.body.removeChild(plain);
  });
});
