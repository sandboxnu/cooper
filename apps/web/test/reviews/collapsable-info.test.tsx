import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import CollapsableInfoCard from "~/app/_components/reviews/collapsable-info";

describe("CollapsableInfoCard", () => {
  test("renders title", () => {
    render(
      <CollapsableInfoCard title="Test Title">
        <p>Content</p>
      </CollapsableInfoCard>,
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  test("renders children when expanded", () => {
    render(
      <CollapsableInfoCard title="Section">
        <p>Child content</p>
      </CollapsableInfoCard>,
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  test("toggles content visibility when button is clicked", () => {
    render(
      <CollapsableInfoCard title="Section">
        <p>Child content</p>
      </CollapsableInfoCard>,
    );
    const button = screen.getByRole("button", { name: /section/i });
    expect(screen.getByText("Child content")).toBeInTheDocument();
    fireEvent.click(button);
    // Content wrapper gets max-h-0 opacity-0 when collapsed
    const content = screen.getByText("Child content");
    const contentWrapper = content.parentElement?.parentElement;
    expect(contentWrapper).toHaveClass("max-h-0");
    fireEvent.click(button);
    expect(contentWrapper).toHaveClass("h-fit");
  });

  test("button has chevron that rotates when expanded", () => {
    render(
      <CollapsableInfoCard title="Section">
        <p>Content</p>
      </CollapsableInfoCard>,
    );
    const button = screen.getByRole("button");
    const svg = button.querySelector("svg");
    expect(svg).toHaveClass("rotate-180");
  });
});
