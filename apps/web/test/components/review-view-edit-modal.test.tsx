import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

interface Query<T> {
  data: T;
  isLoading: boolean;
}

const h = vi.hoisted(() => {
  const make = <T,>(data: T, isLoading = false): Query<T> => ({
    data,
    isLoading,
  });

  const fullReview = () => ({
    id: "rev-1",
    roleId: "role-1",
    companyId: "company-1",
    locationId: "loc-1",
    status: "PUBLISHED",
    workTerm: "FALL",
    workYear: 2024,
    overallRating: 4.5,
    cultureRating: 3,
    supervisorRating: 5,
    jobType: "CO_OP",
    workEnvironment: "REMOTE",
    drugTest: false,
    pto: true,
    overtimeNormal: false,
    federalHolidays: true,
    freeLunch: true,
    travelBenefits: false,
    freeMerch: false,
    snackBar: false,
    otherBenefits: null,
    hourlyPay: "25",
    jobLength: 6,
    workHours: 40,
    accessibleByTransportation: true,
    teamOutings: false,
    coffeeChats: false,
    constructiveFeedback: false,
    onboarding: false,
    workStructure: false,
    careerGrowth: false,
    reviewHeadline: "Great experience",
    textReview: "This was a wonderful co-op opportunity overall.",
    interviewRounds: [
      {
        id: "ir-1",
        interviewType: "TECHNICAL",
        interviewDifficulty: "MEDIUM",
      },
    ],
    reviewsToTools: [{ tool: { name: "React" } }],
  });

  return {
    make,
    fullReview,
    invalidate: vi.fn(),
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
    updateMutateAsync: vi.fn().mockResolvedValue({ id: "rev-1" }),
    isPending: false,
    reviewQuery: make<Record<string, unknown> | undefined>(undefined),
    roleQuery: make<{ title: string } | undefined>({
      title: "Software Engineer",
    }),
    companyQuery: make<{ name: string } | undefined>({ name: "Acme Corp" }),
    locationQuery: make<Record<string, unknown> | undefined>({
      city: "Boston",
      state: "MA",
      country: "USA",
    }),
    profileQuery: make<{ id: string } | undefined>({ id: "p1" }),
  };
});

vi.mock("@cooper/ui", () => ({
  useCustomToast: () => ({
    toast: { success: h.toastSuccess, error: h.toastError },
  }),
}));

vi.mock("@cooper/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogClose: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@cooper/ui/form", () => ({
  Form: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("~/app/_components/form/sections", () => ({
  BasicInfoSection: () => <div data-testid="basic-info-section" />,
  CompanyDetailsSection: () => <div data-testid="company-details-section" />,
  InterviewSection: () => <div data-testid="interview-section" />,
  PaySection: () => <div data-testid="pay-section" />,
  ReviewSection: () => <div data-testid="review-section" />,
}));

vi.mock("~/app/_components/reviews/delete-review-dialogue", () => ({
  DeleteReviewDialog: ({ trigger }: { trigger: React.ReactNode }) => (
    <div data-testid="delete-review-dialog">{trigger}</div>
  ),
}));

vi.mock("~/trpc/react", () => ({
  api: {
    useUtils: () => ({
      review: { getByProfile: { invalidate: h.invalidate } },
    }),
    review: {
      getById: { useQuery: () => h.reviewQuery },
      update: {
        useMutation: () => ({
          mutateAsync: h.updateMutateAsync,
          isPending: h.isPending,
        }),
      },
    },
    role: { getById: { useQuery: () => h.roleQuery } },
    company: { getById: { useQuery: () => h.companyQuery } },
    location: { getById: { useQuery: () => h.locationQuery } },
    profile: { getCurrentUser: { useQuery: () => h.profileQuery } },
  },
}));

import { ReviewViewEditModal } from "~/app/_components/reviews/review-view-edit-modal";

const noop = () => undefined;

function renderModal(
  props: Partial<React.ComponentProps<typeof ReviewViewEditModal>> = {},
) {
  return render(
    <ReviewViewEditModal
      reviewId="rev-1"
      mode="view"
      open
      onOpenChange={noop}
      onModeChange={noop}
      {...props}
    />,
  );
}

describe("ReviewViewEditModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.isPending = false;
    h.reviewQuery = h.make(h.fullReview());
    h.roleQuery = h.make({ title: "Software Engineer" });
    h.companyQuery = h.make({ name: "Acme Corp" });
    h.locationQuery = h.make({ city: "Boston", state: "MA", country: "USA" });
    h.profileQuery = h.make({ id: "p1" });
  });

  test("renders nothing when closed", () => {
    renderModal({ open: false });
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  test("shows a loading state while the review is loading", () => {
    h.reviewQuery = h.make(undefined, true);
    renderModal();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  describe("view mode", () => {
    test("renders the role title and company in the header", () => {
      renderModal();
      // Role title appears in the header and in the "Role title" field.
      expect(screen.getAllByText("Software Engineer").length).toBeGreaterThan(
        0,
      );
      expect(screen.getAllByText(/Acme Corp/).length).toBeGreaterThan(0);
    });

    test("renders all of the section headings", () => {
      renderModal();
      expect(screen.getByText("Basic information")).toBeInTheDocument();
      expect(screen.getByText("On the job")).toBeInTheDocument();
      expect(screen.getByText("Pay")).toBeInTheDocument();
      expect(screen.getByText("Interview")).toBeInTheDocument();
      expect(screen.getByText("Review and rate")).toBeInTheDocument();
    });

    test("maps work term and work environment codes to friendly labels", () => {
      renderModal();
      expect(screen.getByText("Fall")).toBeInTheDocument();
      expect(screen.getByText("Remote")).toBeInTheDocument();
    });

    test("renders the formatted hourly pay and overall rating", () => {
      renderModal();
      expect(screen.getByText("$25.00 / hour")).toBeInTheDocument();
      expect(screen.getByText("4.5")).toBeInTheDocument();
    });

    test("renders the review text", () => {
      renderModal();
      expect(
        screen.getByText("This was a wonderful co-op opportunity overall."),
      ).toBeInTheDocument();
    });

    test("renders only the active benefits", () => {
      renderModal();
      expect(screen.getByText("Federal holidays off")).toBeInTheDocument();
      expect(screen.getByText("Free lunch")).toBeInTheDocument();
      expect(screen.queryByText("Snack bar")).not.toBeInTheDocument();
    });

    test("renders interview rounds with type and difficulty", () => {
      renderModal();
      expect(screen.getByText("Round 1")).toBeInTheDocument();
      expect(screen.getByText("TECHNICAL")).toBeInTheDocument();
      expect(screen.getByText("MEDIUM")).toBeInTheDocument();
    });

    test("shows the empty interview message when there are no rounds", () => {
      h.reviewQuery = h.make({ ...h.fullReview(), interviewRounds: [] });
      renderModal();
      expect(
        screen.getByText("No interview rounds recorded."),
      ).toBeInTheDocument();
    });

    test("renders the Delete and Edit buttons", () => {
      renderModal();
      expect(screen.getByTestId("delete-review-dialog")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Edit Review" }),
      ).toBeInTheDocument();
    });

    test("clicking Edit Review switches to edit mode", () => {
      const onModeChange = vi.fn();
      renderModal({ onModeChange });
      fireEvent.click(screen.getByRole("button", { name: "Edit Review" }));
      expect(onModeChange).toHaveBeenCalledWith("edit");
    });
  });

  describe("edit mode", () => {
    test("renders the Edit Review heading and all form sections", () => {
      renderModal({ mode: "edit" });
      expect(screen.getByText("Edit Review")).toBeInTheDocument();
      expect(screen.getByTestId("basic-info-section")).toBeInTheDocument();
      expect(screen.getByTestId("company-details-section")).toBeInTheDocument();
      expect(screen.getByTestId("pay-section")).toBeInTheDocument();
      expect(screen.getByTestId("interview-section")).toBeInTheDocument();
      expect(screen.getByTestId("review-section")).toBeInTheDocument();
    });

    test("renders Discard and Save buttons but no Submit for a published review", () => {
      renderModal({ mode: "edit" });
      expect(
        screen.getByRole("button", { name: "Discard edits" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Save edits" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Submit review" }),
      ).not.toBeInTheDocument();
    });

    test("shows the Submit button for a draft review", () => {
      h.reviewQuery = h.make({ ...h.fullReview(), status: "DRAFT" });
      renderModal({ mode: "edit" });
      expect(
        screen.getByRole("button", { name: "Submit review" }),
      ).toBeInTheDocument();
    });

    test("shows pending labels and disables actions while saving", () => {
      h.isPending = true;
      h.reviewQuery = h.make({ ...h.fullReview(), status: "DRAFT" });
      renderModal({ mode: "edit" });
      expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Submitting..." }),
      ).toBeDisabled();
    });

    test("Save edits calls the update mutation and toasts success", async () => {
      renderModal({ mode: "edit" });
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Save edits" }));
      });
      expect(h.updateMutateAsync).toHaveBeenCalledTimes(1);
      expect(h.updateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ id: "rev-1", status: "PUBLISHED" }),
      );
      expect(h.toastSuccess).toHaveBeenCalledWith("Review saved.");
    });

    test("clicking Discard edits does not call the update mutation", () => {
      renderModal({ mode: "edit" });
      fireEvent.click(screen.getByRole("button", { name: "Discard edits" }));
      expect(h.updateMutateAsync).not.toHaveBeenCalled();
    });

    test("Submit review blocks and toasts when the form is invalid", async () => {
      h.reviewQuery = h.make({
        ...h.fullReview(),
        status: "DRAFT",
        textReview: "",
        workTerm: null,
      });
      renderModal({ mode: "edit" });
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Submit review" }));
      });
      expect(h.toastError).toHaveBeenCalledWith(
        "Please fill in all required fields.",
      );
      expect(h.updateMutateAsync).not.toHaveBeenCalled();
    });
  });
});
