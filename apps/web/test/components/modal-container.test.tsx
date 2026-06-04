import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import ModalContainer from "~/app/_components/reviews/modal";

describe("ModalContainer", () => {
  test("renders its children", () => {
    render(
      <ModalContainer>
        <p>Inner content</p>
      </ModalContainer>,
    );
    expect(screen.getByText("Inner content")).toBeInTheDocument();
  });

  test("renders the title when provided", () => {
    render(
      <ModalContainer title="Pay details">
        <span>body</span>
      </ModalContainer>,
    );
    expect(screen.getByText("Pay details")).toBeInTheDocument();
  });

  test("omits the title node when not provided", () => {
    render(
      <ModalContainer>
        <span>body</span>
      </ModalContainer>,
    );
    expect(screen.queryByText("Pay details")).not.toBeInTheDocument();
  });
});
