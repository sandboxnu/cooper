import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const h = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  mutate: vi.fn(),
  isPending: false,
  opts: undefined as
    | { onSuccess: () => void; onError: (err: { message: string }) => void }
    | undefined,
}));

vi.mock("@cooper/ui/hooks/use-custom-toast", () => ({
  useCustomToast: () => ({ toast: { success: h.success, error: h.error } }),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

// A plain button stand-in. Unlike the real one it never sets the DOM
// `disabled` attribute, so we can still click "Cancel" while a submit is
// pending and exercise the closeReportModal guard.
vi.mock("@cooper/ui/button", () => ({
  Button: ({
    children,
    onClick,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit";
  }) => (
    <button type={type} onClick={onClick}>
      {children}
    </button>
  ),
}));

// Lightweight Select: renders the items (so the option map runs) and exposes a
// button that fires onValueChange with a real ReportReason value.
vi.mock("@cooper/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (v: string) => void;
    children: React.ReactNode;
  }) => (
    <div data-testid="reason-select" data-value={value}>
      <button
        type="button"
        data-testid="pick-reason"
        onClick={() => onValueChange("SPAM")}
      />
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) => <div data-reason={value}>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => (
    <span>{placeholder}</span>
  ),
}));

vi.mock("~/trpc/react", () => ({
  api: {
    report: {
      create: {
        useMutation: (opts: typeof h.opts) => {
          h.opts = opts;
          return { mutate: h.mutate, isPending: h.isPending };
        },
      },
    },
  },
}));

import { ReportButton } from "~/app/_components/shared/report-button";

function open() {
  fireEvent.click(screen.getByText("Report"));
}

describe("ReportButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.isPending = false;
    h.opts = undefined;
  });

  test("shows the Report label by default", () => {
    render(<ReportButton entityType="review" entityId="rev-1" />);
    expect(screen.getByText("Report")).toBeInTheDocument();
  });

  test("hides the label in icon-only mode", () => {
    render(<ReportButton entityType="review" entityId="rev-1" iconOnly />);
    expect(screen.queryByText("Report")).not.toBeInTheDocument();
    expect(screen.getByAltText("Report")).toBeInTheDocument();
  });

  test("opens the report dialog when the trigger is clicked", () => {
    render(<ReportButton entityType="review" entityId="rev-1" />);
    open();
    expect(screen.getByText("Report content")).toBeInTheDocument();
  });

  test("blocks submission and warns when no reason is selected", () => {
    render(<ReportButton entityType="review" entityId="rev-1" />);
    open();
    fireEvent.click(screen.getByText("Submit report"));

    expect(h.error).toHaveBeenCalledWith("Please select a report reason.");
    expect(h.mutate).not.toHaveBeenCalled();
  });

  test("warns when a reason is set but the description is empty", () => {
    render(<ReportButton entityType="review" entityId="rev-1" />);
    open();
    fireEvent.click(screen.getByTestId("pick-reason"));
    fireEvent.click(screen.getByText("Submit report"));

    expect(h.error).toHaveBeenCalledWith("Please enter a report description.");
    expect(h.mutate).not.toHaveBeenCalled();
  });

  test("submits the report with the reason and a trimmed description", () => {
    render(<ReportButton entityType="company" entityId="co-9" />);
    open();
    fireEvent.click(screen.getByTestId("pick-reason"));
    fireEvent.change(
      screen.getByPlaceholderText(
        "Add details to help moderators understand the issue",
      ),
      { target: { value: "  spammy listing  " } },
    );
    fireEvent.click(screen.getByText("Submit report"));

    expect(h.mutate).toHaveBeenCalledWith({
      entityType: "company",
      entityId: "co-9",
      reason: "SPAM",
      reportText: "spammy listing",
    });
  });

  test("notifies and closes the dialog on a successful submission", () => {
    render(<ReportButton entityType="review" entityId="rev-1" />);
    open();
    expect(screen.getByText("Report content")).toBeInTheDocument();

    act(() => h.opts?.onSuccess());

    expect(h.success).toHaveBeenCalledWith(
      "Thanks for your report. Our team will review it.",
    );
    expect(screen.queryByText("Report content")).not.toBeInTheDocument();
  });

  test("surfaces the server error message on failure", () => {
    render(<ReportButton entityType="review" entityId="rev-1" />);
    act(() => h.opts?.onError({ message: "Boom" }));
    expect(h.error).toHaveBeenCalledWith("Boom");
  });

  test("falls back to a generic error message", () => {
    render(<ReportButton entityType="review" entityId="rev-1" />);
    act(() => h.opts?.onError({ message: "" }));
    expect(h.error).toHaveBeenCalledWith(
      "Unable to submit report. Please try again.",
    );
  });

  test("Cancel closes the dialog when no submit is in flight", () => {
    render(<ReportButton entityType="review" entityId="rev-1" />);
    open();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Report content")).not.toBeInTheDocument();
  });

  test("Cancel is a no-op while a submit is pending", () => {
    h.isPending = true;
    render(<ReportButton entityType="review" entityId="rev-1" />);
    open();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.getByText("Report content")).toBeInTheDocument();
  });
});
