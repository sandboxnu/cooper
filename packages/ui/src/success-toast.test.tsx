import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ToastProvider, ToastViewport } from "./toast";
import { SuccessToast } from "./success-toast";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => (
    <img src="/toastCheck.svg" alt={alt} />
  ),
}));

function wrapWithProvider(ui: React.ReactElement) {
  return (
    <ToastProvider>
      <ToastViewport />
      {ui}
    </ToastProvider>
  );
}

describe("SuccessToast", () => {
  test("renders with description", () => {
    render(wrapWithProvider(<SuccessToast description="Success message" />));
    expect(screen.getByText("Success message")).toBeInTheDocument();
  });

  test("renders check icon", () => {
    render(wrapWithProvider(<SuccessToast description="Done" />));
    expect(screen.getByAltText("Check icon")).toBeInTheDocument();
  });

  test("renders action when provided", () => {
    render(
      wrapWithProvider(
        <SuccessToast
          description="Saved"
          action={<button type="button">Undo</button>}
        />,
      ),
    );
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
  });

  test("applies custom className", () => {
    const { container } = render(
      wrapWithProvider(
        <SuccessToast description="Done" className="custom-toast" />,
      ),
    );
    const root = container.querySelector("[data-state=open]");
    expect(root).not.toBeNull();
    if (root) {
      expect(root).toHaveClass("custom-toast");
    }
  });
});
