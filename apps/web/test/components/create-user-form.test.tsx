import { fireEvent, render, screen } from "@testing-library/react";
import type { ChangeEvent } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mutate = vi.fn();
let mutationHandlers: {
  onSuccess?: () => void;
  onError?: (e: { message: string }) => void;
} = {};

vi.mock("~/trpc/react", () => ({
  api: {
    user: {
      create: {
        useMutation: (handlers: typeof mutationHandlers) => {
          mutationHandlers = handlers;
          return { mutate };
        },
      },
    },
  },
}));

const success = vi.fn();
const error = vi.fn();
vi.mock("@cooper/ui", () => ({
  cn: (...inputs: unknown[]) => inputs.flat().filter(Boolean).join(" "),
  useCustomToast: () => ({ toast: { success, error } }),
}));

// Isolate the form from the themed Select implementation.
vi.mock("~/app/_components/themed/onboarding/select", () => ({
  Select: ({
    options,
    value,
    onChange,
    placeholder,
  }: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    placeholder: string;
  }) => (
    <select aria-label="role" value={value} onChange={onChange}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

import { CreateUserForm } from "~/app/_components/admin/create-user-form";

beforeEach(() => {
  vi.clearAllMocks();
  mutationHandlers = {};
});

describe("CreateUserForm", () => {
  test("does not submit when email or role is missing", () => {
    render(<CreateUserForm />);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(mutate).not.toHaveBeenCalled();
  });

  test("submits the email and role", () => {
    render(<CreateUserForm />);
    fireEvent.change(screen.getByPlaceholderText("Add new user email here"), {
      target: { value: "new@husky.neu.edu" },
    });
    fireEvent.change(screen.getByLabelText("role"), {
      target: { value: "ADMIN" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(mutate).toHaveBeenCalledWith({
      email: "new@husky.neu.edu",
      role: "ADMIN",
    });
  });

  test("shows a success toast and clears the form on success", () => {
    render(<CreateUserForm />);
    mutationHandlers.onSuccess?.();
    expect(success).toHaveBeenCalledWith("User added successfully.");
  });

  test("shows an error toast on failure", () => {
    render(<CreateUserForm />);
    mutationHandlers.onError?.({ message: "boom" });
    expect(error).toHaveBeenCalledWith("boom");
  });
});
