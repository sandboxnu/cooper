import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { reducer, toast, useToast } from "../src/hooks/use-toast";

type ToastShape = Parameters<typeof reducer>[0]["toasts"][number];

const makeToast = (overrides: Partial<ToastShape> = {}): ToastShape => ({
  id: "1",
  open: true,
  ...overrides,
});

describe("use-toast reducer", () => {
  test("ADD_TOAST prepends and enforces the toast limit of 1", () => {
    const first = makeToast({ id: "1" });
    const second = makeToast({ id: "2" });
    let state = reducer(
      { toasts: [first] },
      { type: "ADD_TOAST", toast: second },
    );
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0]?.id).toBe("2");
    state = reducer({ toasts: [] }, { type: "ADD_TOAST", toast: first });
    expect(state.toasts[0]?.id).toBe("1");
  });

  test("UPDATE_TOAST merges fields for the matching id", () => {
    const state = reducer(
      { toasts: [makeToast({ id: "1", title: "old" })] },
      { type: "UPDATE_TOAST", toast: { id: "1", title: "new" } },
    );
    expect(state.toasts[0]?.title).toBe("new");
  });

  test("DISMISS_TOAST closes the matching toast", () => {
    const state = reducer(
      { toasts: [makeToast({ id: "1", open: true })] },
      { type: "DISMISS_TOAST", toastId: "1" },
    );
    expect(state.toasts[0]?.open).toBe(false);
  });

  test("DISMISS_TOAST with no id closes all toasts", () => {
    const state = reducer(
      { toasts: [makeToast({ id: "1", open: true })] },
      { type: "DISMISS_TOAST" },
    );
    expect(state.toasts.every((t) => t.open === false)).toBe(true);
  });

  test("REMOVE_TOAST removes a specific toast", () => {
    const state = reducer(
      { toasts: [makeToast({ id: "1" }), makeToast({ id: "2" })] },
      { type: "REMOVE_TOAST", toastId: "1" },
    );
    expect(state.toasts.map((t) => t.id)).toEqual(["2"]);
  });

  test("REMOVE_TOAST with no id clears all toasts", () => {
    const state = reducer(
      { toasts: [makeToast({ id: "1" }), makeToast({ id: "2" })] },
      { type: "REMOVE_TOAST", toastId: undefined },
    );
    expect(state.toasts).toEqual([]);
  });
});

describe("toast() + useToast()", () => {
  test("adding a toast surfaces it through useToast", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      toast({ description: "Hello there" });
    });
    expect(result.current.toasts[0]?.description).toBe("Hello there");
    expect(result.current.toasts[0]?.open).toBe(true);
  });

  test("dismiss closes the active toast", () => {
    const { result } = renderHook(() => useToast());
    let handle: ReturnType<typeof toast>;
    act(() => {
      handle = toast({ description: "Closing soon" });
    });
    act(() => {
      handle.dismiss();
    });
    expect(result.current.toasts[0]?.open).toBe(false);
  });

  test("toast() returns an id and update handle", () => {
    let handle: ReturnType<typeof toast> | undefined;
    act(() => {
      handle = toast({ description: "x" });
    });
    expect(handle?.id).toBeTypeOf("string");
    expect(handle?.update).toBeTypeOf("function");
    expect(handle?.dismiss).toBeTypeOf("function");
  });
});
