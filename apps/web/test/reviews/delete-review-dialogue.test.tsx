import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { DeleteReviewDialog } from "~/app/_components/reviews/delete-review-dialogue";

vi.mock("~/trpc/react", () => ({
  api: {
    review: {
      delete: {
        useMutation: (opts: {
          onSuccess?: () => void;
          onError?: () => void;
        }) => ({
          mutate: vi.fn(() => {
            opts.onSuccess?.();
          }),
          isPending: false,
        }),
      },
    },
  },
}));

vi.mock("@cooper/ui/hooks/use-custom-toast", () => ({
  useCustomToast: () => ({
    toast: { success: vi.fn(), error: vi.fn() },
  }),
}));

const reload = vi.fn();
Object.defineProperty(window, "location", {
  value: { reload },
  writable: true,
});

describe("DeleteReviewDialog", () => {
  test("renders trigger button", () => {
    render(<DeleteReviewDialog reviewId="rev-1" />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  test("opens dialog with title and description when trigger clicked", () => {
    render(<DeleteReviewDialog reviewId="rev-1" />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getAllByText("Delete Review").length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Are you sure you want to delete this review/),
    ).toBeInTheDocument();
  });

  test("shows Delete Review submit button in dialog", () => {
    render(<DeleteReviewDialog reviewId="rev-1" />);
    fireEvent.click(screen.getByRole("button"));
    expect(
      screen.getAllByRole("button", { name: "Delete Review" }).length,
    ).toBeGreaterThan(0);
  });
});
