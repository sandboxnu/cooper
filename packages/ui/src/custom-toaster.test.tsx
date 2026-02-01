import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { CustomToaster } from "./custom-toaster";

const mockToasts: Array<{
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}> = [];

vi.mock("./hooks/use-toast", () => ({
  useToast: () => ({ toasts: mockToasts }),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img src="/toastX.svg" alt={alt} />,
}));

describe("CustomToaster", () => {
  beforeEach(() => {
    mockToasts.length = 0;
  });

  test("renders nothing when toasts array is empty", () => {
    const { container } = render(<CustomToaster />);
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  test("renders SuccessToast when className includes toast-success", () => {
    mockToasts.push({
      id: "1",
      title: "Done",
      description: "Saved",
      className: "toast-success",
    });
    render(<CustomToaster />);
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  test("renders ErrorToast when className includes toast-error", () => {
    mockToasts.push({
      id: "2",
      description: "Something went wrong",
      className: "toast-error",
    });
    render(<CustomToaster />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  test("renders ErrorToast when variant is destructive", () => {
    mockToasts.push({
      id: "3",
      description: "Error message",
      variant: "destructive",
    });
    render(<CustomToaster />);
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  test("renders SuccessToast for default variant", () => {
    mockToasts.push({
      id: "4",
      description: "Default toast",
      variant: "default",
    });
    render(<CustomToaster />);
    expect(screen.getByText("Default toast")).toBeInTheDocument();
  });

  test("renders action when provided", () => {
    mockToasts.push({
      id: "5",
      description: "With action",
      className: "toast-error",
      action: <button type="button">Undo</button>,
    });
    render(<CustomToaster />);
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
  });

  test("getVariantFromClassName returns warning for toast-warning", () => {
    mockToasts.push({
      id: "6",
      description: "Warning",
      className: "toast-warning",
    });
    render(<CustomToaster />);
    expect(screen.getByText("Warning")).toBeInTheDocument();
  });

  test("getVariantFromClassName returns info for toast-info", () => {
    mockToasts.push({
      id: "7",
      description: "Info",
      className: "toast-info",
    });
    render(<CustomToaster />);
    expect(screen.getByText("Info")).toBeInTheDocument();
  });
});
