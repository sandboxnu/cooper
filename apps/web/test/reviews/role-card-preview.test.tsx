import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { RoleCardPreview } from "~/app/_components/reviews/role-card-preview";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock("~/trpc/react", () => ({
  api: {
    company: {
      getById: {
        useQuery: () => ({ data: { name: "Acme Corp" } }),
      },
    },
    role: {
      getById: {
        useQuery: () => ({ data: { title: "Software Co-op" } }),
      },
      getAverageById: {
        useQuery: () => ({ data: { averageOverallRating: 4.2 } }),
      },
    },
    review: {
      getByRole: {
        useQuery: () => ({
          data: [{ locationId: "loc-1" }],
          isSuccess: true,
        }),
      },
    },
    location: {
      getById: {
        useQuery: () => ({
          data: { city: "Boston", state: "MA", country: "USA" },
          isSuccess: true,
        }),
      },
    },
  },
}));

vi.mock("~/app/_components/shared/favorite-button", () => ({
  FavoriteButton: () => <button type="button">Favorite</button>,
}));

describe("RoleCardPreview", () => {
  const roleObj = {
    id: "role-1",
    companyId: "company-1",
    title: "Software Co-op",
  } as never;

  test("renders role title", () => {
    render(<RoleCardPreview roleObj={roleObj} />);
    expect(screen.getByText("Software Co-op")).toBeInTheDocument();
  });

  test("renders company name", () => {
    render(<RoleCardPreview roleObj={roleObj} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  test("renders Co-op label", () => {
    render(<RoleCardPreview roleObj={roleObj} />);
    expect(screen.getByText("Co-op")).toBeInTheDocument();
  });

  test("renders rating and review count when reviews exist", () => {
    render(<RoleCardPreview roleObj={roleObj} />);
    expect(screen.getByText("4.2")).toBeInTheDocument();
    expect(screen.getByText(/1\+ review/)).toBeInTheDocument();
  });

  test("hides favorite button when showFavorite is false", () => {
    render(<RoleCardPreview roleObj={roleObj} showFavorite={false} />);
    expect(screen.queryByRole("button", { name: /favorite/i })).not.toBeInTheDocument();
  });

  test("shows drag handle when showDragHandle is true", () => {
    const { container } = render(
      <RoleCardPreview roleObj={roleObj} showDragHandle />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
