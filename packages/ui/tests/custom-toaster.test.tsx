import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const h = vi.hoisted(() => ({ toasts: [] as Record<string, unknown>[] }));

vi.mock("../src/hooks/use-toast", () => ({
  useToast: () => ({ toasts: h.toasts }),
}));
vi.mock("../src/success-toast", () => ({
  SuccessToast: ({ description }: { description?: string }) => (
    <div data-testid="success-toast">{description}</div>
  ),
}));
vi.mock("../src/error-toast", () => ({
  ErrorToast: ({ description }: { description?: string }) => (
    <div data-testid="error-toast">{description}</div>
  ),
}));

import { CustomToaster } from "../src/custom-toaster";

describe("CustomToaster", () => {
  beforeEach(() => {
    h.toasts = [];
  });

  test("renders nothing notable when there are no toasts", () => {
    render(<CustomToaster />);
    expect(screen.queryByTestId("success-toast")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-toast")).not.toBeInTheDocument();
  });

  test("renders a SuccessToast for the toast-success class", () => {
    h.toasts = [{ id: "1", description: "Saved", className: "toast-success" }];
    render(<CustomToaster />);
    expect(screen.getByTestId("success-toast")).toHaveTextContent("Saved");
  });

  test("renders an ErrorToast for the toast-error class", () => {
    h.toasts = [{ id: "1", description: "Bad", className: "toast-error" }];
    render(<CustomToaster />);
    expect(screen.getByTestId("error-toast")).toHaveTextContent("Bad");
  });

  test("renders an ErrorToast for the destructive variant", () => {
    h.toasts = [{ id: "1", description: "Boom", variant: "destructive" }];
    render(<CustomToaster />);
    expect(screen.getByTestId("error-toast")).toHaveTextContent("Boom");
  });

  test("falls back to a SuccessToast for an unknown variant", () => {
    h.toasts = [{ id: "1", description: "Plain", variant: "default" }];
    render(<CustomToaster />);
    expect(screen.getByTestId("success-toast")).toHaveTextContent("Plain");
  });
});
