import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

interface Query<T> {
  data: T;
  isLoading: boolean;
  error: unknown;
}

const h = vi.hoisted(() => {
  const make = <T,>(data: T): Query<T> => ({
    data,
    isLoading: false,
    error: null,
  });
  return {
    make,
    push: vi.fn(),
    replace: vi.fn(),
    invalidate: vi.fn(),
    toastError: vi.fn(),
    toastSuccess: vi.fn(),
    createMutateAsync: vi.fn().mockResolvedValue({ id: "rev-1" }),
    saveDraftMutateAsync: vi.fn().mockResolvedValue({ id: "draft-1" }),
    updateMutateAsync: vi.fn().mockResolvedValue({ id: "draft-1" }),
    sessionQuery: make<unknown>({
      user: { email: "a@b.com", role: "STUDENT" },
    }),
    profileQuery: make<unknown>({ id: "p1" }),
    reviewsQuery: { data: [] as unknown[] },
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.push, replace: h.replace }),
}));

vi.mock("@cooper/ui", () => ({
  useCustomToast: () => ({
    toast: { error: h.toastError, success: h.toastSuccess },
  }),
}));

vi.mock("@cooper/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit";
  }) => (
    <button type={type ?? "button"} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("@cooper/ui/form", () => ({
  Form: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("~/app/_components/form/sections", () => ({
  BasicInfoSection: () => <div data-testid="basic-info-section" />,
  CompanyDetailsSection: () => <div data-testid="company-details-section" />,
  InterviewSection: () => <div data-testid="interview-section" />,
  ReviewSection: () => <div data-testid="review-section" />,
}));
vi.mock("~/app/_components/form/sections/pay-section", () => ({
  PaySection: () => <div data-testid="pay-section" />,
}));
vi.mock("~/app/_components/form/sections/popup", () => ({
  default: ({
    onSave,
    onDiscard,
  }: {
    onSave: () => void;
    onDiscard: () => void;
  }) => (
    <div data-testid="popup">
      <button type="button" onClick={onSave}>
        popup-save
      </button>
      <button type="button" onClick={onDiscard}>
        popup-discard
      </button>
    </div>
  ),
}));

vi.mock("~/trpc/react", () => ({
  api: {
    useUtils: () => ({
      review: { getByProfile: { invalidate: h.invalidate } },
    }),
    auth: { getSession: { useQuery: () => h.sessionQuery } },
    profile: { getCurrentUser: { useQuery: () => h.profileQuery } },
    review: {
      getByProfile: { useQuery: () => h.reviewsQuery },
      create: {
        useMutation: () => ({
          mutateAsync: h.createMutateAsync,
          isPending: false,
        }),
      },
      saveDraft: {
        useMutation: () => ({
          mutateAsync: h.saveDraftMutateAsync,
          isPending: false,
        }),
      },
      update: {
        useMutation: () => ({
          mutateAsync: h.updateMutateAsync,
          isPending: false,
        }),
      },
    },
  },
}));

import ReviewForm from "~/app/(pages)/(protected)/review-form/page";

describe("ReviewForm page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.sessionQuery = h.make({ user: { email: "a@b.com", role: "STUDENT" } });
    h.profileQuery = h.make({ id: "p1" });
    h.reviewsQuery = { data: [] };
  });

  test("renders nothing while session and profile are still loading", () => {
    h.sessionQuery = { ...h.make(undefined), isLoading: true };
    h.profileQuery = { ...h.make(undefined), isLoading: true };
    const { container } = render(<ReviewForm />);
    expect(container).toBeEmptyDOMElement();
  });

  test("redirects to /roles when settled without a session", () => {
    h.sessionQuery = h.make(undefined);
    h.profileQuery = h.make(undefined);
    render(<ReviewForm />);
    expect(h.push).toHaveBeenCalledWith("/roles");
  });

  test("renders all form sections for a student", () => {
    render(<ReviewForm />);
    expect(screen.getByTestId("basic-info-section")).toBeInTheDocument();
    expect(screen.getByTestId("company-details-section")).toBeInTheDocument();
    expect(screen.getByTestId("pay-section")).toBeInTheDocument();
    expect(screen.getByTestId("interview-section")).toBeInTheDocument();
    expect(screen.getByTestId("review-section")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Submit review" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save draft" }),
    ).toBeInTheDocument();
  });

  test("redirects employers to /404", () => {
    h.sessionQuery = h.make({ user: { email: "a@b.com", role: "EMPLOYER" } });
    render(<ReviewForm />);
    expect(h.replace).toHaveBeenCalledWith("/404");
  });

  test("blocks submit and toasts when required fields are empty", async () => {
    render(<ReviewForm />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Submit review" }));
    });
    expect(h.toastError).toHaveBeenCalledWith(
      "Please fill in all required fields.",
    );
    expect(h.createMutateAsync).not.toHaveBeenCalled();
  });

  test("saving a new draft calls the saveDraft mutation and toasts success", async () => {
    render(<ReviewForm />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    });
    expect(h.saveDraftMutateAsync).toHaveBeenCalledTimes(1);
    expect(h.toastSuccess).toHaveBeenCalledWith("This draft has been saved.");
  });

  test("a leave attempt with a pristine form navigates to /roles", () => {
    render(<ReviewForm />);
    act(() => {
      window.dispatchEvent(new Event("review-form:leave-attempt"));
    });
    expect(h.push).toHaveBeenCalledWith("/roles");
  });
});
