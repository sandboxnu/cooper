import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { useCustomToast } from "../src/hooks/use-custom-toast";

describe("useCustomToast", () => {
  test("success adds a default-variant toast tagged toast-success", () => {
    const { result } = renderHook(() => useCustomToast());
    act(() => {
      result.current.toast.success("Saved!");
    });
    const t = result.current.toasts[0];
    expect(t?.description).toBe("Saved!");
    expect(t?.className).toBe("toast-success");
    expect(t?.variant).toBe("default");
  });

  test("error adds a destructive toast tagged toast-error", () => {
    const { result } = renderHook(() => useCustomToast());
    act(() => {
      result.current.toast.error("Oops");
    });
    const t = result.current.toasts[0];
    expect(t?.description).toBe("Oops");
    expect(t?.className).toBe("toast-error");
    expect(t?.variant).toBe("destructive");
  });

  test("warning and info use their own class names", () => {
    const { result } = renderHook(() => useCustomToast());
    act(() => {
      result.current.toast.warning("Careful");
    });
    expect(result.current.toasts[0]?.className).toBe("toast-warning");

    act(() => {
      result.current.toast.info("FYI");
    });
    expect(result.current.toasts[0]?.className).toBe("toast-info");
  });

  test("custom forwards directly to the base toast", () => {
    const { result } = renderHook(() => useCustomToast());
    act(() => {
      result.current.toast.custom({ description: "Raw", className: "x" });
    });
    expect(result.current.toasts[0]?.description).toBe("Raw");
    expect(result.current.toasts[0]?.className).toBe("x");
  });
});
