import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import LoadingResults from "~/app/_components/loading-results";

describe("LoadingResults", () => {
  test("renders the loading message", () => {
    render(<LoadingResults />);
    expect(screen.getByText("Loading ...")).toBeInTheDocument();
  });

  test("renders the logo image", () => {
    render(<LoadingResults />);
    expect(screen.getByAltText("Logo Picture")).toBeInTheDocument();
  });
});
