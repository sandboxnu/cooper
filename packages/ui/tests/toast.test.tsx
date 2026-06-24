import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "../src/toast";

function renderToast(children: ReactNode, toastProps = {}) {
  return render(
    <ToastProvider>
      <Toast open {...toastProps}>
        {children}
      </Toast>
      <ToastViewport />
    </ToastProvider>,
  );
}

describe("Toast", () => {
  test("renders the title and description", () => {
    renderToast(
      <>
        <ToastTitle>Saved</ToastTitle>
        <ToastDescription>Your changes were saved.</ToastDescription>
      </>,
    );
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Your changes were saved.")).toBeInTheDocument();
  });

  test("applies the default variant classes", () => {
    renderToast(<ToastTitle>Default</ToastTitle>);
    expect(screen.getByText("Default").closest("li")).toHaveClass(
      "bg-background",
    );
  });

  test("applies the destructive variant classes", () => {
    renderToast(<ToastTitle>Oops</ToastTitle>, { variant: "destructive" });
    expect(screen.getByText("Oops").closest("li")).toHaveClass("destructive");
  });

  test("merges a custom className onto the toast", () => {
    renderToast(<ToastTitle>Styled</ToastTitle>, {
      className: "my-custom-class",
    });
    expect(screen.getByText("Styled").closest("li")).toHaveClass(
      "my-custom-class",
    );
  });

  test("fires the action's click handler", () => {
    const onClick = vi.fn();
    renderToast(
      <>
        <ToastTitle>With action</ToastTitle>
        <ToastAction altText="Undo" onClick={onClick}>
          Undo
        </ToastAction>
      </>,
    );
    fireEvent.click(screen.getByText("Undo"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  test("closes the toast when the close button is clicked", () => {
    const onOpenChange = vi.fn();
    renderToast(
      <>
        <ToastTitle>Closable</ToastTitle>
        <ToastClose aria-label="Close" />
      </>,
      { onOpenChange },
    );
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
