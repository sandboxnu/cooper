import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useFavoriteToggle } from "~/app/_components/shared/useFavoriteToggle";

const mockToast = { success: vi.fn(), error: vi.fn() };
vi.mock("@cooper/ui/hooks/use-custom-toast", () => ({
  useCustomToast: () => ({ toast: mockToast }),
}));

const mockInvalidate = vi.fn();
const mockSetData = vi.fn();
let mockFavoriteRolesData: { roleId: string; profileId: string }[] = [];
let mockFavoriteCompaniesData: { companyId: string; profileId: string }[] = [];
const mockGetData = vi.fn(() => []);
const mockCancel = vi.fn();
const mockMutate = vi.fn();

vi.mock("~/trpc/react", () => ({
  api: {
    useUtils: () => ({
      profile: {
        listFavoriteRoles: {
          invalidate: mockInvalidate,
          setData: mockSetData,
          getData: mockGetData,
          cancel: mockCancel,
        },
        listFavoriteCompanies: {
          invalidate: mockInvalidate,
          setData: mockSetData,
          getData: mockGetData,
          cancel: mockCancel,
        },
      },
    }),
    profile: {
      getCurrentUser: {
        useQuery: () => ({ data: { id: "profile-1" } }),
      },
      listFavoriteRoles: {
        useQuery: () => ({
          data: mockFavoriteRolesData,
          isLoading: false,
        }),
      },
      listFavoriteCompanies: {
        useQuery: () => ({
          data: mockFavoriteCompaniesData,
          isLoading: false,
        }),
      },
      favoriteRole: {
        useMutation: (opts: {
          onSuccess?: () => void;
          onSettled?: () => void;
        }) => ({
          mutate: (vars: unknown) => {
            mockMutate(vars);
            opts.onSuccess?.();
            opts.onSettled?.();
          },
        }),
      },
      unfavoriteRole: {
        useMutation: (opts: {
          onSuccess?: () => void;
          onSettled?: () => void;
        }) => ({
          mutate: (vars: unknown) => {
            mockMutate(vars);
            opts.onSuccess?.();
            opts.onSettled?.();
          },
        }),
      },
      favoriteCompany: {
        useMutation: (opts: {
          onSuccess?: () => void;
          onSettled?: () => void;
        }) => ({
          mutate: (vars: unknown) => {
            mockMutate(vars);
            opts.onSuccess?.();
            opts.onSettled?.();
          },
        }),
      },
      unfavoriteCompany: {
        useMutation: (opts: {
          onSuccess?: () => void;
          onSettled?: () => void;
        }) => ({
          mutate: (vars: unknown) => {
            mockMutate(vars);
            opts.onSuccess?.();
            opts.onSettled?.();
          },
        }),
      },
    },
  },
}));

describe("useFavoriteToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFavoriteRolesData = [];
    mockFavoriteCompaniesData = [];
    mockGetData.mockReturnValue([]);
  });

  test("returns isFavorited false when list is empty", () => {
    const { result } = renderHook(() => useFavoriteToggle("role-1", "role"));
    expect(result.current.isFavorited).toBe(false);
    expect(result.current.profileId).toBe("profile-1");
    expect(result.current.isLoading).toBe(false);
  });

  test("returns isFavorited true when role is in list", () => {
    mockFavoriteRolesData = [{ roleId: "role-1", profileId: "profile-1" }];
    const { result } = renderHook(() => useFavoriteToggle("role-1", "role"));
    expect(result.current.isFavorited).toBe(true);
  });

  test("toggle calls favoriteRole.mutate when not favorited", () => {
    const { result } = renderHook(() => useFavoriteToggle("role-1", "role"));
    act(() => {
      result.current.toggle();
    });
    expect(mockMutate).toHaveBeenCalledWith({
      profileId: "profile-1",
      roleId: "role-1",
    });
    expect(mockToast.success).toHaveBeenCalledWith("This role has been saved.");
  });

  test("toggle calls unfavoriteRole.mutate when favorited", () => {
    mockFavoriteRolesData = [{ roleId: "role-1", profileId: "profile-1" }];
    const { result } = renderHook(() => useFavoriteToggle("role-1", "role"));
    act(() => {
      result.current.toggle();
    });
    expect(mockMutate).toHaveBeenCalledWith({
      profileId: "profile-1",
      roleId: "role-1",
    });
    expect(mockToast.success).toHaveBeenCalledWith(
      "This role has been unsaved.",
    );
  });

  test("company type uses company mutations", () => {
    const { result } = renderHook(() =>
      useFavoriteToggle("company-1", "company"),
    );
    act(() => {
      result.current.toggle();
    });
    expect(mockMutate).toHaveBeenCalledWith({
      profileId: "profile-1",
      companyId: "company-1",
    });
    expect(mockToast.success).toHaveBeenCalledWith(
      "This company has been saved.",
    );
  });
});
