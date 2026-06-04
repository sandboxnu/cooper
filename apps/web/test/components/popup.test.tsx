import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import Popup from "~/app/_components/form/sections/popup";

function setup(showModal = true) {
  const onSave = vi.fn();
  const onCancel = vi.fn();
  const onDiscard = vi.fn();
  const result = render(
    <Popup
      showModal={showModal}
      onSave={onSave}
      onCancel={onCancel}
      onDiscard={onDiscard}
    />,
  );
  return { onSave, onCancel, onDiscard, ...result };
}

describe("Popup", () => {
  test("renders nothing when showModal is false", () => {
    const { container } = setup(false);
    expect(container).toBeEmptyDOMElement();
  });

  test("renders the draft prompt when showModal is true", () => {
    setup(true);
    // Rendered in both the desktop and mobile variants.
    expect(screen.getAllByText("Save as Draft?").length).toBeGreaterThan(0);
  });

  test("Confirm triggers onSave", () => {
    const { onSave } = setup();
    fireEvent.click(screen.getByText("Confirm"));
    expect(onSave).toHaveBeenCalledOnce();
  });

  test("Do not save triggers onDiscard", () => {
    const { onDiscard } = setup();
    fireEvent.click(screen.getByText("Do not save"));
    expect(onDiscard).toHaveBeenCalledOnce();
  });

  test("Cancel triggers onCancel", () => {
    const { onCancel } = setup();
    // The desktop "Cancel" and mobile "Cancel" both wire to onCancel.
    fireEvent.click(screen.getAllByText("Cancel")[0]!);
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
