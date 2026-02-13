import { describe, expect, test } from "vitest";
import { useCustomToast } from "./use-custom-toast";

describe("useCustomToast (stub)", () => {
  test("returns an object with toast", () => {
    const result = useCustomToast();
    expect(result).toHaveProperty("toast");
    expect(result.toast).toBeDefined();
  });

  test("toast has success, error, and warning methods", () => {
    const { toast } = useCustomToast();
    expect(typeof toast.success).toBe("function");
    expect(typeof toast.error).toBe("function");
    expect(typeof toast.warning).toBe("function");
  });

  test("toast.success can be called without throwing", () => {
    const { toast } = useCustomToast();
    expect(() => toast.success()).not.toThrow();
  });

  test("toast.error can be called without throwing", () => {
    const { toast } = useCustomToast();
    expect(() => toast.error()).not.toThrow();
  });

  test("toast.warning can be called without throwing", () => {
    const { toast } = useCustomToast();
    expect(() => toast.warning()).not.toThrow();
  });

  test("toast methods accept arguments without throwing", () => {
    const { toast } = useCustomToast();
    expect(() => toast.success()).not.toThrow();
    expect(() => toast.error()).not.toThrow();
    expect(() => toast.warning()).not.toThrow();
  });
});
