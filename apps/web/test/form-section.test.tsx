import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { FormSection } from "~/app/_components/form/form-section";

describe("FormSection", () => {
  test("renders children", () => {
    render(
      <FormSection>
        <span>Section content</span>
      </FormSection>,
    );
    expect(screen.getByText("Section content")).toBeInTheDocument();
  });

  test("applies layout classes", () => {
    const { container } = render(
      <FormSection>
        <div>Content</div>
      </FormSection>,
    );
    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass("flex", "flex-col", "rounded-lg", "w-full");
  });
});
