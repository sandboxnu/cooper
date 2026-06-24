import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";

import {
  CompareProvider,
  useCompare,
} from "~/app/_components/compare/compare-context";

const STORAGE_KEY = "cooper.compare-state";
const SESSION_KEY = "cooper.compare-open";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CompareProvider>{children}</CompareProvider>
);

function setup() {
  return renderHook(() => useCompare(), { wrapper });
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe("useCompare", () => {
  test("throws when used outside the provider", () => {
    expect(() => renderHook(() => useCompare())).toThrow(
      "useCompare must be used within CompareProvider",
    );
  });

  test("has sensible initial state", () => {
    const { result } = setup();
    expect(result.current.isCompareMode).toBe(false);
    expect(result.current.comparedRoleIds).toEqual([]);
    expect(result.current.reservedSlots).toBe(0);
    expect(result.current.anchorRoleId).toBeNull();
    expect(result.current.isDragging).toBe(false);
    expect(result.current.maxColumns).toBe(3);
  });

  test("enterCompareMode sets anchor, mode, and reserves a slot when empty", () => {
    const { result } = setup();
    act(() => result.current.enterCompareMode("anchor-1"));
    expect(result.current.isCompareMode).toBe(true);
    expect(result.current.anchorRoleId).toBe("anchor-1");
    // empty compared list -> capacity available -> reserves 1
    expect(result.current.reservedSlots).toBe(1);
  });

  test("enterCompareMode keeps existing reserved slots", () => {
    const { result } = setup();
    act(() => result.current.enterCompareMode("anchor-1"));
    act(() => result.current.addSlot()); // reservedSlots becomes 2
    expect(result.current.reservedSlots).toBe(2);
    act(() => result.current.enterCompareMode("anchor-2"));
    // slots > 0 so unchanged
    expect(result.current.reservedSlots).toBe(2);
    expect(result.current.anchorRoleId).toBe("anchor-2");
  });

  test("enterCompareMode reserves no slot when at capacity with no reserved slots", () => {
    const { result } = setup();
    // fill comparedRoleIds to MAX_COLUMNS - 1 (= 2) without reserving slots
    act(() => result.current.addRoleId("r1"));
    act(() => result.current.addRoleId("r2"));
    expect(result.current.comparedRoleIds).toEqual(["r1", "r2"]);
    expect(result.current.reservedSlots).toBe(0);
    act(() => result.current.enterCompareMode("anchor-1"));
    // no capacity -> reserves 0
    expect(result.current.reservedSlots).toBe(0);
  });

  test("addRoleId adds ids, ignores duplicates, and respects the max", () => {
    const { result } = setup();
    act(() => result.current.addRoleId("r1"));
    expect(result.current.comparedRoleIds).toEqual(["r1"]);
    // duplicate ignored
    act(() => result.current.addRoleId("r1"));
    expect(result.current.comparedRoleIds).toEqual(["r1"]);
    act(() => result.current.addRoleId("r2"));
    expect(result.current.comparedRoleIds).toEqual(["r1", "r2"]);
    // at MAX_COLUMNS - 1 (= 2), further additions ignored
    act(() => result.current.addRoleId("r3"));
    expect(result.current.comparedRoleIds).toEqual(["r1", "r2"]);
  });

  test("addRoleId decrements reserved slots without going negative", () => {
    const { result } = setup();
    act(() => result.current.enterCompareMode("anchor-1")); // reservedSlots = 1
    expect(result.current.reservedSlots).toBe(1);
    act(() => result.current.addRoleId("r1")); // -> 0
    expect(result.current.reservedSlots).toBe(0);
    act(() => result.current.addRoleId("r2")); // stays at 0 (max(0, -1))
    expect(result.current.reservedSlots).toBe(0);
  });

  test("addSlot increases reserved slots up to the max columns", () => {
    const { result } = setup();
    // total = 1 (anchor) + 0 compared + 0 slots = 1
    act(() => result.current.addSlot()); // -> 2 total
    expect(result.current.reservedSlots).toBe(1);
    act(() => result.current.addSlot()); // -> 3 total (max)
    expect(result.current.reservedSlots).toBe(2);
    act(() => result.current.addSlot()); // would be 4 total -> capped
    expect(result.current.reservedSlots).toBe(2);
  });

  test("addSlot is capped accounting for compared roles", () => {
    const { result } = setup();
    act(() => result.current.addRoleId("r1")); // 1 anchor + 1 compared = 2
    act(() => result.current.addSlot()); // -> 3 total
    expect(result.current.reservedSlots).toBe(1);
    act(() => result.current.addSlot()); // would exceed max -> unchanged
    expect(result.current.reservedSlots).toBe(1);
  });

  test("removeRoleId removes a non-anchor role", () => {
    const { result } = setup();
    act(() => result.current.enterCompareMode("anchor-1"));
    act(() => result.current.addRoleId("r1"));
    act(() => result.current.addRoleId("r2"));
    act(() => result.current.removeRoleId("r1"));
    expect(result.current.comparedRoleIds).toEqual(["r2"]);
    expect(result.current.isCompareMode).toBe(true);
  });

  test("removeRoleId reassigns the anchor when the anchor is removed", () => {
    const { result } = setup();
    act(() => result.current.addRoleId("r1"));
    act(() => result.current.addRoleId("r2"));
    act(() => result.current.enterCompareMode("r1")); // anchor = r1
    expect(result.current.anchorRoleId).toBe("r1");
    act(() => result.current.removeRoleId("r1"));
    // new anchor is first remaining compared id (r2), which is removed from compared list
    expect(result.current.anchorRoleId).toBe("r2");
    expect(result.current.comparedRoleIds).toEqual(["r1"]);
  });

  test("removeRoleId sets anchor to null when no other compared roles exist", () => {
    const { result } = setup();
    act(() => result.current.addRoleId("only"));
    act(() => result.current.enterCompareMode("only")); // anchor = only
    act(() => result.current.removeRoleId("only"));
    expect(result.current.anchorRoleId).toBeNull();
    // comparedRoleIds filtered by newAnchorRoleId (null) -> unchanged list
    expect(result.current.comparedRoleIds).toEqual(["only"]);
  });

  test("removeRoleId exits compare mode when compared list is already empty", () => {
    const { result } = setup();
    act(() => result.current.enterCompareMode("anchor-1"));
    expect(result.current.comparedRoleIds).toEqual([]);
    expect(result.current.isCompareMode).toBe(true);
    act(() => result.current.removeRoleId("anything"));
    expect(result.current.isCompareMode).toBe(false);
  });

  test("clear resets compared roles and reserved slots but keeps mode/anchor", () => {
    const { result } = setup();
    act(() => result.current.enterCompareMode("anchor-1"));
    act(() => result.current.addRoleId("r1"));
    act(() => result.current.addSlot());
    act(() => result.current.clear());
    expect(result.current.comparedRoleIds).toEqual([]);
    expect(result.current.reservedSlots).toBe(0);
    expect(result.current.isCompareMode).toBe(true);
    expect(result.current.anchorRoleId).toBe("anchor-1");
  });

  test("exitCompareMode resets mode, compared roles, anchor, and dragging", () => {
    const { result } = setup();
    act(() => result.current.enterCompareMode("anchor-1"));
    act(() => result.current.addRoleId("r1"));
    act(() => result.current.setIsDragging(true));
    act(() => result.current.exitCompareMode());
    expect(result.current.isCompareMode).toBe(false);
    expect(result.current.comparedRoleIds).toEqual([]);
    expect(result.current.anchorRoleId).toBeNull();
    expect(result.current.isDragging).toBe(false);
  });

  test("setIsDragging toggles the dragging flag", () => {
    const { result } = setup();
    act(() => result.current.setIsDragging(true));
    expect(result.current.isDragging).toBe(true);
    act(() => result.current.setIsDragging(false));
    expect(result.current.isDragging).toBe(false);
  });
});

describe("CompareProvider persistence", () => {
  test("persists state to localStorage and sessionStorage", () => {
    const { result } = setup();
    act(() => result.current.enterCompareMode("anchor-1"));
    act(() => result.current.addRoleId("r1"));

    const stored = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "{}",
    ) as {
      comparedRoleIds: string[];
      reservedSlots: number;
      anchorRoleId: string | null;
    };
    expect(stored.comparedRoleIds).toEqual(["r1"]);
    expect(stored.anchorRoleId).toBe("anchor-1");

    expect(window.sessionStorage.getItem(SESSION_KEY)).toBe("true");
  });

  test("hydrates state from storage on mount", () => {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(true));
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        comparedRoleIds: ["a", "b"],
        reservedSlots: 5, // should clamp to MAX_COLUMNS - 1 = 2
        anchorRoleId: "a",
      }),
    );
    const { result } = setup();
    expect(result.current.isCompareMode).toBe(true);
    expect(result.current.comparedRoleIds).toEqual(["a", "b"]);
    expect(result.current.reservedSlots).toBe(2);
    expect(result.current.anchorRoleId).toBe("a");
  });

  test("ignores malformed persisted state", () => {
    window.localStorage.setItem(STORAGE_KEY, "not-json{");
    window.sessionStorage.setItem(SESSION_KEY, "also-not-json{");
    const { result } = setup();
    // falls back to defaults without throwing
    expect(result.current.isCompareMode).toBe(false);
    expect(result.current.comparedRoleIds).toEqual([]);
  });
});
