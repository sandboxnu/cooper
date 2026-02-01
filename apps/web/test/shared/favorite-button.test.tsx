import React from "react";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { FavoriteButton } from "~/app/_components/shared/favorite-button";

const mockToggle = vi.fn();
let mockProfileId = "profile-1";
let mockIsFavorited = false;
vi.mock("~/app/_components/shared/useFavoriteToggle", () => ({
  useFavoriteToggle: () => ({
    isFavorited: mockIsFavorited,
    toggle: mockToggle,
    isLoading: false,
    profileId: mockProfileId,
  }),
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    onClick,
    onMouseEnter,
    onMouseLeave,
    className,
  }: {
    src: string;
    alt: string;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    className?: string;
  }) => (
    <img
      data-testid="favorite-img"
      src={src}
      alt={alt}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
    />
  ),
}));

describe("FavoriteButton", () => {
  beforeEach(() => {
    mockToggle.mockClear();
  });

  test("renders bookmark image when profileId is set", () => {
    render(<FavoriteButton objId="role-1" objType="role" />);
    const img = screen.getByTestId("favorite-img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Bookmark icon");
  });

  test("uses default bookmark src when not favorited", () => {
    render(<FavoriteButton objId="role-1" objType="role" />);
    expect(screen.getByTestId("favorite-img")).toHaveAttribute(
      "src",
      "/svg/bookmark.svg",
    );
  });

  test("calls toggle when clicked", () => {
    render(<FavoriteButton objId="role-1" objType="role" />);
    fireEvent.click(screen.getByTestId("favorite-img"));
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  test("shows filled bookmark src when favorited", () => {
    mockIsFavorited = true;
    render(<FavoriteButton objId="role-1" objType="role" />);
    expect(screen.getByTestId("favorite-img")).toHaveAttribute(
      "src",
      "/svg/filledBookmark.svg",
    );
    mockIsFavorited = false;
  });

  test("shows hover src on mouse enter when not favorited", () => {
    render(<FavoriteButton objId="role-1" objType="role" />);
    const img = screen.getByTestId("favorite-img");
    fireEvent.mouseEnter(img);
    expect(img).toHaveAttribute("src", "/svg/hoverBookmark.svg");
  });
});

describe("FavoriteButton when profileId is null", () => {
  test("returns null when profileId is falsy", () => {
    mockProfileId = "";
    const { container } = render(
      <FavoriteButton objId="role-1" objType="role" />,
    );
    expect(container.firstChild).toBeNull();
    mockProfileId = "profile-1";
  });
});
