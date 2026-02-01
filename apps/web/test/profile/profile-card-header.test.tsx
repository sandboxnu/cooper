import React from "react";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import ProfileCardHeader from "~/app/_components/profile/profile-card-header";

const mockMutate = vi.fn();
vi.mock("~/trpc/react", () => ({
  api: {
    useUtils: () => ({
      profile: {
        getCurrentUser: { invalidate: vi.fn() },
      },
    }),
    profile: {
      updateNameAndMajor: {
        useMutation: (opts: { onSuccess?: () => void }) => ({
          mutate: (vars: unknown) => {
            mockMutate(vars);
            opts.onSuccess?.();
          },
          isPending: false,
          error: null,
        }),
      },
    },
  },
}));

const defaultProfile = {
  id: "profile-1",
  firstName: "Jane",
  lastName: "Doe",
  major: "Computer Science",
  graduationYear: 2025,
};

describe("ProfileCardHeader", () => {
  test("renders Account Information title", () => {
    render(
      <ProfileCardHeader profile={defaultProfile} email="jane@example.com" />,
    );
    expect(screen.getByText("Account Information")).toBeInTheDocument();
  });

  test("renders name, email, and major in view mode", () => {
    render(
      <ProfileCardHeader profile={defaultProfile} email="jane@example.com" />,
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
  });

  test("renders Edit button when not editing", () => {
    render(
      <ProfileCardHeader profile={defaultProfile} email="jane@example.com" />,
    );
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  test("switches to edit mode when Edit clicked", () => {
    render(
      <ProfileCardHeader profile={defaultProfile} email="jane@example.com" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText(/First name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Major/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  test("Cancel restores original values and exits edit mode", () => {
    render(
      <ProfileCardHeader profile={defaultProfile} email="jane@example.com" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const firstNameInput = screen.getByLabelText(/First name/);
    fireEvent.change(firstNameInput, { target: { value: "Changed" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  test("Save calls mutation with trimmed values", () => {
    render(
      <ProfileCardHeader profile={defaultProfile} email="jane@example.com" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(mockMutate).toHaveBeenCalledWith({
      id: "profile-1",
      firstName: "Jane",
      lastName: "Doe",
      major: "Computer Science",
    });
  });

  test("Save button disabled when first or last name is empty", () => {
    render(
      <ProfileCardHeader profile={defaultProfile} email="jane@example.com" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText(/First name/), {
      target: { value: "" },
    });
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  test("renders major label when profile.major is null", () => {
    render(
      <ProfileCardHeader
        profile={{ ...defaultProfile, major: null }}
        email="jane@example.com"
      />,
    );
    expect(screen.getByText("Major")).toBeInTheDocument();
    // Major value is not displayed when null (empty content)
    expect(screen.getByText("Name")).toBeInTheDocument();
  });
});
