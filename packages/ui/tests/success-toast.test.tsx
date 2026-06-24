import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

import { ToastProvider, ToastViewport } from "../src/toast";
import { SuccessToast } from "../src/success-toast";

function renderSuccessToast(props = {}) {
  return render(
    <ToastProvider>
      <SuccessToast open {...props} />
      <ToastViewport />
    </ToastProvider>,
  );
}

describe("SuccessToast", () => {
  test("renders the check icon", () => {
    renderSuccessToast();
    const icon = screen.getByAltText("Check icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("src", "/svg/toastCheck.svg");
  });

  test("renders the description when provided", () => {
    renderSuccessToast({ description: "Saved successfully." });
    expect(screen.getByText("Saved successfully.")).toBeInTheDocument();
  });

  test("omits the description node when none is provided", () => {
    renderSuccessToast();
    // Only the icon's alt text is present; no description text renders.
    expect(screen.queryByText("Saved successfully.")).not.toBeInTheDocument();
  });

  test("renders an action when provided", () => {
    const action: ReactNode = <button>Undo</button>;
    renderSuccessToast({ action });
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
  });

  test("merges a custom className onto the toast root", () => {
    renderSuccessToast({
      className: "my-custom-class",
      description: "Styled",
    });
    expect(screen.getByText("Styled").closest("li")).toHaveClass(
      "my-custom-class",
    );
  });

  test("applies the success styling on the toast root", () => {
    renderSuccessToast({ description: "Done" });
    expect(screen.getByText("Done").closest("li")).toHaveClass("bg-green-50");
  });
});
