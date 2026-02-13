import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useCustomToast } from "./use-custom-toast";

const mockToast = vi.fn();
vi.mock("./use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
    dismiss: vi.fn(),
    toasts: [],
  }),
}));

describe("useCustomToast", () => {
  test("returns toast object with success, error, warning, info, custom", () => {
    const { result } = renderHook(() => useCustomToast());
    expect(result.current.toast).toBeDefined();
    expect(typeof result.current.toast.success).toBe("function");
    expect(typeof result.current.toast.error).toBe("function");
    expect(typeof result.current.toast.warning).toBe("function");
    expect(typeof result.current.toast.info).toBe("function");
    expect(typeof result.current.toast.custom).toBe("function");
  });

  test("success calls base toast with description and toast-success class", () => {
    mockToast.mockClear();
    const { result } = renderHook(() => useCustomToast());
    result.current.toast.success("Done!");
    expect(mockToast).toHaveBeenCalledWith({
      description: "Done!",
      className: "toast-success",
      variant: "default",
    });
  });

  test("error calls base toast with description and toast-error class", () => {
    mockToast.mockClear();
    const { result } = renderHook(() => useCustomToast());
    result.current.toast.error("Something went wrong");
    expect(mockToast).toHaveBeenCalledWith({
      description: "Something went wrong",
      className: "toast-error",
      variant: "destructive",
    });
  });

  test("warning calls base toast with toast-warning class", () => {
    mockToast.mockClear();
    const { result } = renderHook(() => useCustomToast());
    result.current.toast.warning("Warning");
    expect(mockToast).toHaveBeenCalledWith({
      description: "Warning",
      className: "toast-warning",
      variant: "default",
    });
  });

  test("info calls base toast with toast-info class", () => {
    mockToast.mockClear();
    const { result } = renderHook(() => useCustomToast());
    result.current.toast.info("Info");
    expect(mockToast).toHaveBeenCalledWith({
      description: "Info",
      className: "toast-info",
      variant: "default",
    });
  });
});
