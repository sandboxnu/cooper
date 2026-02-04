import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import {
  CompareProvider,
  useCompare,
} from "~/app/_components/compare/compare-context";

function TestConsumer() {
  const compare = useCompare();
  return (
    <div>
      <span data-testid="mode">{String(compare.isCompareMode)}</span>
      <span data-testid="ids">{compare.comparedRoleIds.join(",")}</span>
      <button
        type="button"
        onClick={() => compare.enterCompareMode()}
        data-testid="enter"
      >
        Enter
      </button>
      <button
        type="button"
        onClick={() => compare.exitCompareMode()}
        data-testid="exit"
      >
        Exit
      </button>
      <button
        type="button"
        onClick={() => compare.addRoleId("role-1")}
        data-testid="add"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => compare.removeRoleId("role-1")}
        data-testid="remove"
      >
        Remove
      </button>
      <button type="button" onClick={() => compare.clear()} data-testid="clear">
        Clear
      </button>
      <button
        type="button"
        onClick={() => compare.addSlot()}
        data-testid="slot"
      >
        Slot
      </button>
    </div>
  );
}

const mockGetItem = vi.fn((): string | null => null);
const mockSetItem = vi.fn();
const mockRemoveItem = vi.fn();

const mockLocalStorage = {
  getItem: mockGetItem,
  setItem: mockSetItem,
  removeItem: mockRemoveItem,
};

describe("CompareContext", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- vitest beforeEach callback with mocks
  beforeEach(() => {
    if (typeof window !== "undefined") {
      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
        writable: true,
      });
    }
  });

  test("useCompare throws when outside provider", () => {
    expect(() => render(<TestConsumer />)).toThrow(
      "useCompare must be used within CompareProvider",
    );
  });

  test("provider exposes initial state", () => {
    render(
      <CompareProvider>
        <TestConsumer />
      </CompareProvider>,
    );
    expect(screen.getByTestId("mode")).toHaveTextContent("false");
    expect(screen.getByTestId("ids")).toHaveTextContent("");
  });

  test("enterCompareMode sets isCompareMode true", () => {
    render(
      <CompareProvider>
        <TestConsumer />
      </CompareProvider>,
    );
    fireEvent.click(screen.getByTestId("enter"));
    expect(screen.getByTestId("mode")).toHaveTextContent("true");
  });

  test("addRoleId adds id to comparedRoleIds", () => {
    render(
      <CompareProvider>
        <TestConsumer />
      </CompareProvider>,
    );
    fireEvent.click(screen.getByTestId("enter"));
    fireEvent.click(screen.getByTestId("add"));
    expect(screen.getByTestId("ids")).toHaveTextContent("role-1");
  });

  test("removeRoleId removes id", () => {
    render(
      <CompareProvider>
        <TestConsumer />
      </CompareProvider>,
    );
    fireEvent.click(screen.getByTestId("enter"));
    fireEvent.click(screen.getByTestId("add"));
    fireEvent.click(screen.getByTestId("remove"));
    expect(screen.getByTestId("ids")).toHaveTextContent("");
  });

  test("exitCompareMode sets isCompareMode false", () => {
    render(
      <CompareProvider>
        <TestConsumer />
      </CompareProvider>,
    );
    fireEvent.click(screen.getByTestId("enter"));
    fireEvent.click(screen.getByTestId("exit"));
    expect(screen.getByTestId("mode")).toHaveTextContent("false");
  });

  test("clear resets comparedRoleIds", () => {
    render(
      <CompareProvider>
        <TestConsumer />
      </CompareProvider>,
    );
    fireEvent.click(screen.getByTestId("enter"));
    fireEvent.click(screen.getByTestId("add"));
    fireEvent.click(screen.getByTestId("clear"));
    expect(screen.getByTestId("ids")).toHaveTextContent("");
  });
});
