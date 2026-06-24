import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("~/app/_components/reviews/delete-review-dialogue", () => ({
  DeleteReviewDialog: ({ trigger }: { trigger: React.ReactNode }) => (
    <div data-testid="delete-dialog">{trigger}</div>
  ),
}));
vi.mock("~/app/_components/reviews/review-view-edit-modal", () => ({
  ReviewViewEditModal: ({ open }: { open: boolean }) => (
    <div data-testid="view-edit-modal">{open ? "open" : "closed"}</div>
  ),
}));

import { ReviewActionsDialog } from "~/app/_components/reviews/review-actions-dialogue";

const publishedReview = { id: "rev-1", status: "PUBLISHED" } as never;
const draftReview = { id: "rev-2", status: "DRAFT" } as never;

function open(review: never) {
  render(
    <ReviewActionsDialog
      review={review}
      trigger={<button type="button">Open menu</button>}
    />,
  );
  fireEvent.click(screen.getByText("Open menu"));
}

describe("ReviewActionsDialog", () => {
  test("renders the trigger", () => {
    render(
      <ReviewActionsDialog
        review={publishedReview}
        trigger={<button type="button">Open menu</button>}
      />,
    );
    expect(screen.getByText("Open menu")).toBeInTheDocument();
  });

  test("shows View/Edit/Delete actions for a published review", () => {
    open(publishedReview);
    expect(screen.getByText("View Review")).toBeInTheDocument();
    expect(screen.getByText("Edit Review")).toBeInTheDocument();
    expect(screen.getByText("Delete Review")).toBeInTheDocument();
  });

  test("uses draft labels and hides View for a draft", () => {
    open(draftReview);
    expect(screen.queryByText("View Review")).not.toBeInTheDocument();
    expect(screen.getByText("Edit Draft")).toBeInTheDocument();
    expect(screen.getByText("Delete Draft")).toBeInTheDocument();
  });

  test("opens the view/edit modal when Edit is clicked", () => {
    open(publishedReview);
    expect(screen.getByTestId("view-edit-modal")).toHaveTextContent("closed");
    fireEvent.click(screen.getByText("Edit Review"));
    expect(screen.getByTestId("view-edit-modal")).toHaveTextContent("open");
  });
});
