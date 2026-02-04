import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from "./toast";

describe("Toast", () => {
  test("ToastViewport renders", () => {
    const { container } = render(
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>,
    );
    const viewport = container.querySelector("ol");
    expect(viewport).toBeInTheDocument();
  });

  test("Toast renders with title and description", () => {
    render(
      <ToastProvider>
        <ToastViewport />
        <Toast open>
          <ToastTitle>Title</ToastTitle>
          <ToastDescription>Description text</ToastDescription>
        </Toast>
      </ToastProvider>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description text")).toBeInTheDocument();
  });

  test("Toast applies variant class", () => {
    render(
      <ToastProvider>
        <ToastViewport />
        <Toast open variant="destructive">
          <ToastTitle>Error</ToastTitle>
        </Toast>
      </ToastProvider>,
    );
    const toastEl = screen.getByText("Error").closest("[data-state=open]");
    expect(toastEl).toHaveClass("destructive");
  });

  test("ToastClose renders close icon", () => {
    const { container } = render(
      <ToastProvider>
        <ToastViewport />
        <Toast open>
          <ToastTitle>Title</ToastTitle>
          <ToastClose />
        </Toast>
      </ToastProvider>,
    );
    const closeButton = container.querySelector("button[toast-close]");
    expect(closeButton).toBeInTheDocument();
  });

  test("ToastAction renders action button", () => {
    render(
      <ToastProvider>
        <ToastViewport />
        <Toast open>
          <ToastTitle>Title</ToastTitle>
          <ToastAction altText="Undo">Undo</ToastAction>
        </Toast>
      </ToastProvider>,
    );
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
  });
});
