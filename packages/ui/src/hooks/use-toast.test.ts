import { renderHook, act } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { reducer, useToast, toast } from "./use-toast";

describe("use-toast reducer", () => {
  test("ADD_TOAST adds toast to state", () => {
    const state = { toasts: [] };
    const action = {
      type: "ADD_TOAST" as const,
      toast: {
        id: "1",
        description: "Test",
        open: true,
      },
    };
    const next = reducer(state, action);
    expect(next.toasts).toHaveLength(1);
    expect(next.toasts[0].id).toBe("1");
    expect(next.toasts[0].description).toBe("Test");
  });

  test("ADD_TOAST respects TOAST_LIMIT of 1", () => {
    const state = {
      toasts: [{ id: "1", open: true }],
    };
    const action = {
      type: "ADD_TOAST" as const,
      toast: { id: "2", open: true },
    };
    const next = reducer(state, action);
    expect(next.toasts).toHaveLength(1);
    expect(next.toasts[0].id).toBe("2");
  });

  test("UPDATE_TOAST updates existing toast", () => {
    const state = {
      toasts: [{ id: "1", description: "Old", open: true }],
    };
    const action = {
      type: "UPDATE_TOAST" as const,
      toast: { id: "1", description: "New" },
    };
    const next = reducer(state, action);
    expect(next.toasts[0].description).toBe("New");
  });

  test("DISMISS_TOAST sets open to false", () => {
    const state = {
      toasts: [{ id: "1", open: true }],
    };
    const action = {
      type: "DISMISS_TOAST" as const,
      toastId: "1",
    };
    const next = reducer(state, action);
    expect(next.toasts[0].open).toBe(false);
  });

  test("REMOVE_TOAST removes toast by id", () => {
    const state = {
      toasts: [
        { id: "1", open: true },
        { id: "2", open: true },
      ],
    };
    const action = {
      type: "REMOVE_TOAST" as const,
      toastId: "2",
    };
    const next = reducer(state, action);
    expect(next.toasts).toHaveLength(1);
    expect(next.toasts[0].id).toBe("1");
  });

  test("REMOVE_TOAST with undefined clears all", () => {
    const state = {
      toasts: [{ id: "1", open: true }],
    };
    const action = {
      type: "REMOVE_TOAST" as const,
      toastId: undefined,
    };
    const next = reducer(state, action);
    expect(next.toasts).toHaveLength(0);
  });
});

describe("useToast", () => {
  test("returns toast function and dismiss", () => {
    const { result } = renderHook(() => useToast());
    expect(typeof result.current.toast).toBe("function");
    expect(typeof result.current.dismiss).toBe("function");
    expect(Array.isArray(result.current.toasts)).toBe(true);
  });

  test("toast() adds a toast and returns id, dismiss, update", () => {
    const result = toast({ description: "Hello" });
    expect(result.id).toBeDefined();
    expect(typeof result.dismiss).toBe("function");
    expect(typeof result.update).toBe("function");
  });
});
