import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { ErrorToast } from "./error-toast";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img src="/toastX.svg" alt={alt} />,
}));

function wrapWithProvider(ui: React.ReactElement) {
  return (
    <ToastPrimitives.Provider>
      <ToastPrimitives.Viewport />
      {ui}
    </ToastPrimitives.Provider>
  );
}

describe("ErrorToast", () => {
  test("renders with description", () => {
    render(wrapWithProvider(<ErrorToast open description="Error message" />));
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  test("renders X icon", () => {
    render(wrapWithProvider(<ErrorToast open description="Error" />));
    expect(screen.getByAltText("X icon")).toBeInTheDocument();
  });

  test("renders action when provided", () => {
    render(
      wrapWithProvider(
        <ErrorToast
          open
          description="Failed"
          action={<button type="button">Retry</button>}
        />,
      ),
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  test("renders without description when description is undefined", () => {
    render(wrapWithProvider(<ErrorToast open />));
    expect(screen.getByAltText("X icon")).toBeInTheDocument();
    expect(screen.queryByText("Error message")).not.toBeInTheDocument();
  });

  test("applies custom className", () => {
    const { container } = render(
      wrapWithProvider(
        <ErrorToast open description="Error" className="custom-error-toast" />,
      ),
    );
    const root = container.querySelector("[data-state=open]");
    expect(root).toHaveClass("custom-error-toast");
  });
});
