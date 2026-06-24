import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const h = vi.hoisted(() => ({
  mutate: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@cooper/ui/hooks/use-custom-toast", () => ({
  useCustomToast: () => ({ toast: { success: h.success, error: h.error } }),
}));
vi.mock("~/trpc/react", () => ({
  api: {
    review: { delete: { useMutation: () => ({ mutate: h.mutate }) } },
  },
}));

import { DeleteReviewDialog } from "~/app/_components/reviews/delete-review-dialogue";

describe("DeleteReviewDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the default trash trigger", () => {
    render(<DeleteReviewDialog reviewId="rev-1" />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("opens the confirmation dialog for a review", () => {
    render(<DeleteReviewDialog reviewId="rev-1" />);
    fireEvent.click(screen.getByRole("button"));
    expect(
      screen.getByRole("heading", { name: "Delete Review" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete this review/),
    ).toBeInTheDocument();
  });

  test("uses draft wording when isDraft is set", () => {
    render(<DeleteReviewDialog reviewId="rev-1" isDraft />);
    fireEvent.click(screen.getByRole("button"));
    expect(
      screen.getByRole("heading", { name: "Delete Draft" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete this draft/),
    ).toBeInTheDocument();
  });

  test("calls the delete mutation with the review id on confirm", () => {
    render(<DeleteReviewDialog reviewId="rev-1" />);
    fireEvent.click(screen.getByRole("button"));
    // The confirm button shares the "Delete Review" label inside the dialog.
    const confirm = screen
      .getAllByText("Delete Review")
      .find((el) => el.tagName === "BUTTON");
    fireEvent.click(confirm!);
    expect(h.mutate).toHaveBeenCalledWith("rev-1");
  });
});
