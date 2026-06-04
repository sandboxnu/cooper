import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const h = vi.hoisted(() => ({
  error: vi.fn(),
  replace: vi.fn(),
  params: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => h.params,
  useRouter: () => ({ replace: h.replace }),
}));

vi.mock("@cooper/ui", () => ({
  useCustomToast: () => ({ toast: { error: h.error } }),
}));

import { AdminAccessToast } from "~/app/_components/landing/admin-access-toast";

const CLEAR_URL_AFTER_MS = 5000;

describe("AdminAccessToast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    h.params = new URLSearchParams();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test("does nothing when there is no error param", () => {
    render(<AdminAccessToast />);
    expect(h.error).not.toHaveBeenCalled();
  });

  test("does nothing for an unrecognized error param", () => {
    h.params = new URLSearchParams({ error: "something-else" });
    render(<AdminAccessToast />);
    expect(h.error).not.toHaveBeenCalled();
  });

  test("shows the mapped toast for an unauthorized-admin error", () => {
    h.params = new URLSearchParams({ error: "unauthorized-admin" });
    render(<AdminAccessToast />);
    expect(h.error).toHaveBeenCalledWith(
      "You don't have access as an admin or coordinator.",
    );
  });

  test("shows the mapped toast for a disabled-account error", () => {
    h.params = new URLSearchParams({ error: "disabled-account" });
    render(<AdminAccessToast />);
    expect(h.error).toHaveBeenCalledWith("Your access has been disabled.");
  });

  test("clears the url after the timeout elapses", () => {
    h.params = new URLSearchParams({ error: "disabled-account" });
    render(<AdminAccessToast />);
    expect(h.replace).not.toHaveBeenCalled();

    vi.advanceTimersByTime(CLEAR_URL_AFTER_MS);
    expect(h.replace).toHaveBeenCalledWith("/", { scroll: false });
  });

  test("shows the toast only once across re-renders", () => {
    h.params = new URLSearchParams({ error: "disabled-account" });
    const { rerender } = render(<AdminAccessToast />);
    rerender(<AdminAccessToast />);
    expect(h.error).toHaveBeenCalledTimes(1);
  });
});
