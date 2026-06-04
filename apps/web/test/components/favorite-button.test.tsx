import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

let hookReturn: {
  isFavorited: boolean;
  toggle: () => void;
  isLoading: boolean;
  profileId: string;
};

vi.mock("~/app/_components/shared/useFavoriteToggle", () => ({
  useFavoriteToggle: () => hookReturn,
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

import { FavoriteButton } from "~/app/_components/shared/favorite-button";

describe("FavoriteButton", () => {
  beforeEach(() => {
    hookReturn = {
      isFavorited: false,
      toggle: vi.fn(),
      isLoading: false,
      profileId: "profile-1",
    };
  });

  test("renders nothing without a profile", () => {
    hookReturn = { ...hookReturn, profileId: "" };
    const { container } = render(<FavoriteButton objId="r1" objType="role" />);
    expect(container).toBeEmptyDOMElement();
  });

  test("shows the empty bookmark when not favorited", () => {
    render(<FavoriteButton objId="r1" objType="role" />);
    expect(screen.getByAltText("Bookmark icon")).toHaveAttribute(
      "src",
      "/svg/bookmark.svg",
    );
  });

  test("shows the filled bookmark when favorited", () => {
    hookReturn = { ...hookReturn, isFavorited: true };
    render(<FavoriteButton objId="r1" objType="role" />);
    expect(screen.getByAltText("Bookmark icon")).toHaveAttribute(
      "src",
      "/svg/filledBookmark.svg",
    );
  });

  test("shows the hover bookmark on mouse enter when not favorited", () => {
    render(<FavoriteButton objId="r1" objType="role" />);
    fireEvent.mouseEnter(screen.getByRole("button"));
    expect(screen.getByAltText("Bookmark icon")).toHaveAttribute(
      "src",
      "/svg/hoverBookmark.svg",
    );
  });

  test("calls toggle on click", () => {
    render(<FavoriteButton objId="r1" objType="role" />);
    fireEvent.click(screen.getByRole("button"));
    expect(hookReturn.toggle).toHaveBeenCalledOnce();
  });
});
