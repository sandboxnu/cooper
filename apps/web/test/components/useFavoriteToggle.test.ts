import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

interface MutationOpts {
  onMutate: () => Promise<{ prev: unknown }>;
  onSuccess: () => void;
  onError: (err: unknown, vars: unknown, ctx?: { prev: unknown }) => void;
  onSettled: () => unknown;
}

const h = vi.hoisted(() => {
  // setData invokes its updater with a representative list so the updater
  // bodies (spreads/filters) actually execute and count toward coverage.
  const sampleList = [
    { roleId: "r1", companyId: "c1", profileId: "profile-1" },
  ];
  const makeUtils = () => ({
    invalidate: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn().mockResolvedValue(undefined),
    setData: vi.fn((_input: unknown, updater: unknown) =>
      typeof updater === "function"
        ? (updater as (l: unknown) => unknown)(sampleList)
        : updater,
    ),
    getData: vi.fn(() => []),
  });
  return {
    roleUtils: makeUtils(),
    companyUtils: makeUtils(),
    mutate: {
      favoriteRole: vi.fn(),
      unfavoriteRole: vi.fn(),
      favoriteCompany: vi.fn(),
      unfavoriteCompany: vi.fn(),
    },
    opts: {} as {
      favoriteRole: MutationOpts;
      unfavoriteRole: MutationOpts;
      favoriteCompany: MutationOpts;
      unfavoriteCompany: MutationOpts;
      [key: string]: MutationOpts;
    },
    toast: { success: vi.fn(), error: vi.fn() },
    state: {
      profileData: undefined as { id: string } | undefined,
      roleList: [] as { roleId: string; profileId: string }[],
      companyList: [] as { companyId: string; profileId: string }[],
    },
  };
});

vi.mock("@cooper/ui/hooks/use-custom-toast", () => ({
  useCustomToast: () => ({ toast: h.toast }),
}));

vi.mock("~/trpc/react", () => {
  const mutation = (key: string, mutate: () => void) => ({
    useMutation: (opts: MutationOpts) => {
      h.opts[key] = opts;
      return { mutate };
    },
  });
  return {
    api: {
      useUtils: () => ({
        profile: {
          listFavoriteRoles: h.roleUtils,
          listFavoriteCompanies: h.companyUtils,
        },
      }),
      profile: {
        getCurrentUser: { useQuery: () => ({ data: h.state.profileData }) },
        listFavoriteRoles: {
          useQuery: () => ({ data: h.state.roleList, isLoading: false }),
        },
        listFavoriteCompanies: {
          useQuery: () => ({ data: h.state.companyList, isLoading: false }),
        },
        favoriteRole: mutation("favoriteRole", h.mutate.favoriteRole),
        unfavoriteRole: mutation("unfavoriteRole", h.mutate.unfavoriteRole),
        favoriteCompany: mutation("favoriteCompany", h.mutate.favoriteCompany),
        unfavoriteCompany: mutation(
          "unfavoriteCompany",
          h.mutate.unfavoriteCompany,
        ),
      },
    },
  };
});

import { useFavoriteToggle } from "~/app/_components/shared/useFavoriteToggle";

describe("useFavoriteToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.opts = {} as typeof h.opts;
    h.state.profileData = { id: "profile-1" };
    h.state.roleList = [];
    h.state.companyList = [];
  });

  describe("derived state", () => {
    test("exposes the current profile id", () => {
      const { result } = renderHook(() => useFavoriteToggle("r1", "role"));
      expect(result.current.profileId).toBe("profile-1");
    });

    test("profileId is empty when there is no profile", () => {
      h.state.profileData = undefined;
      const { result } = renderHook(() => useFavoriteToggle("r1", "role"));
      expect(result.current.profileId).toBe("");
    });

    test("exposes the list loading state", () => {
      const { result } = renderHook(() => useFavoriteToggle("r1", "role"));
      expect(result.current.isLoading).toBe(false);
    });

    test("reports a role as favorited when it is in the list", () => {
      h.state.roleList = [{ roleId: "r1", profileId: "profile-1" }];
      const { result } = renderHook(() => useFavoriteToggle("r1", "role"));
      expect(result.current.isFavorited).toBe(true);
    });

    test("reports a role as not favorited when absent", () => {
      h.state.roleList = [{ roleId: "other", profileId: "profile-1" }];
      const { result } = renderHook(() => useFavoriteToggle("r1", "role"));
      expect(result.current.isFavorited).toBe(false);
    });

    test("reports a company as favorited when it is in the list", () => {
      h.state.companyList = [{ companyId: "c1", profileId: "profile-1" }];
      const { result } = renderHook(() => useFavoriteToggle("c1", "company"));
      expect(result.current.isFavorited).toBe(true);
    });

    test("reports a company as not favorited when absent", () => {
      h.state.companyList = [{ companyId: "other", profileId: "profile-1" }];
      const { result } = renderHook(() => useFavoriteToggle("c1", "company"));
      expect(result.current.isFavorited).toBe(false);
    });
  });

  describe("toggle", () => {
    test("favorites a role that is not yet favorited", () => {
      const { result } = renderHook(() => useFavoriteToggle("r1", "role"));
      result.current.toggle();
      expect(h.mutate.favoriteRole).toHaveBeenCalledWith({
        profileId: "profile-1",
        roleId: "r1",
      });
      expect(h.mutate.unfavoriteRole).not.toHaveBeenCalled();
    });

    test("unfavorites a role that is already favorited", () => {
      h.state.roleList = [{ roleId: "r1", profileId: "profile-1" }];
      const { result } = renderHook(() => useFavoriteToggle("r1", "role"));
      result.current.toggle();
      expect(h.mutate.unfavoriteRole).toHaveBeenCalledWith({
        profileId: "profile-1",
        roleId: "r1",
      });
    });

    test("favorites a company that is not yet favorited", () => {
      const { result } = renderHook(() => useFavoriteToggle("c1", "company"));
      result.current.toggle();
      expect(h.mutate.favoriteCompany).toHaveBeenCalledWith({
        profileId: "profile-1",
        companyId: "c1",
      });
    });

    test("unfavorites a company that is already favorited", () => {
      h.state.companyList = [{ companyId: "c1", profileId: "profile-1" }];
      const { result } = renderHook(() => useFavoriteToggle("c1", "company"));
      result.current.toggle();
      expect(h.mutate.unfavoriteCompany).toHaveBeenCalledWith({
        profileId: "profile-1",
        companyId: "c1",
      });
    });

    test("is a no-op without a profile", () => {
      h.state.profileData = undefined;
      const { result } = renderHook(() => useFavoriteToggle("r1", "role"));
      result.current.toggle();
      expect(h.mutate.favoriteRole).not.toHaveBeenCalled();
      expect(h.mutate.unfavoriteRole).not.toHaveBeenCalled();
    });
  });

  describe("favoriteRole mutation callbacks", () => {
    beforeEach(() => {
      renderHook(() => useFavoriteToggle("r1", "role"));
    });

    test("onMutate cancels the query, snapshots, and optimistically adds", async () => {
      const ctx = await h.opts.favoriteRole.onMutate();
      expect(h.roleUtils.cancel).toHaveBeenCalledWith({
        profileId: "profile-1",
      });
      expect(h.roleUtils.getData).toHaveBeenCalled();
      expect(h.roleUtils.setData).toHaveBeenCalled();
      expect(ctx).toHaveProperty("prev");
    });

    test("onSuccess shows a success toast", () => {
      h.opts.favoriteRole.onSuccess();
      expect(h.toast.success).toHaveBeenCalledWith("This role has been saved.");
    });

    test("onError rolls back from an array snapshot and toasts", () => {
      h.opts.favoriteRole.onError(
        {},
        {},
        {
          prev: [{ roleId: "r1", profileId: "profile-1" }],
        },
      );
      expect(h.roleUtils.setData).toHaveBeenCalled();
      expect(h.toast.error).toHaveBeenCalledWith("Oops. Please try again.");
    });

    test("onError handles a non-array snapshot", () => {
      h.opts.favoriteRole.onError({}, {}, { prev: "not-an-array" });
      expect(h.toast.error).toHaveBeenCalled();
    });

    test("onError without a prev context still toasts", () => {
      h.opts.favoriteRole.onError({}, {}, undefined);
      expect(h.toast.error).toHaveBeenCalled();
    });

    test("onSettled invalidates the role list", async () => {
      await h.opts.favoriteRole.onSettled();
      expect(h.roleUtils.invalidate).toHaveBeenCalledWith({
        profileId: "profile-1",
      });
    });
  });

  describe("unfavoriteRole mutation callbacks", () => {
    beforeEach(() => {
      renderHook(() => useFavoriteToggle("r1", "role"));
    });

    test("onMutate cancels, snapshots, and optimistically removes", async () => {
      const ctx = await h.opts.unfavoriteRole.onMutate();
      expect(h.roleUtils.cancel).toHaveBeenCalled();
      expect(h.roleUtils.setData).toHaveBeenCalled();
      expect(ctx).toHaveProperty("prev");
    });

    test("onSuccess shows an unsaved toast", () => {
      h.opts.unfavoriteRole.onSuccess();
      expect(h.toast.success).toHaveBeenCalledWith(
        "This role has been unsaved.",
      );
    });

    test("onError rolls back and toasts", () => {
      h.opts.unfavoriteRole.onError(
        {},
        {},
        {
          prev: [{ roleId: "r1", profileId: "profile-1" }],
        },
      );
      expect(h.toast.error).toHaveBeenCalled();
    });

    test("onSettled invalidates the role list", async () => {
      await h.opts.unfavoriteRole.onSettled();
      expect(h.roleUtils.invalidate).toHaveBeenCalled();
    });
  });

  describe("favoriteCompany mutation callbacks", () => {
    beforeEach(() => {
      renderHook(() => useFavoriteToggle("c1", "company"));
    });

    test("onMutate cancels, snapshots, and optimistically adds", async () => {
      const ctx = await h.opts.favoriteCompany.onMutate();
      expect(h.companyUtils.cancel).toHaveBeenCalled();
      expect(h.companyUtils.getData).toHaveBeenCalled();
      expect(h.companyUtils.setData).toHaveBeenCalled();
      expect(ctx).toHaveProperty("prev");
    });

    test("onSuccess shows a success toast", () => {
      h.opts.favoriteCompany.onSuccess();
      expect(h.toast.success).toHaveBeenCalledWith(
        "This company has been saved.",
      );
    });

    test("onError rolls back from an array snapshot and toasts", () => {
      h.opts.favoriteCompany.onError(
        {},
        {},
        {
          prev: [{ companyId: "c1", profileId: "profile-1" }],
        },
      );
      expect(h.companyUtils.setData).toHaveBeenCalled();
      expect(h.toast.error).toHaveBeenCalled();
    });

    test("onError handles a non-array snapshot", () => {
      h.opts.favoriteCompany.onError({}, {}, { prev: 42 });
      expect(h.toast.error).toHaveBeenCalled();
    });

    test("onSettled invalidates the company list", async () => {
      await h.opts.favoriteCompany.onSettled();
      expect(h.companyUtils.invalidate).toHaveBeenCalledWith({
        profileId: "profile-1",
      });
    });
  });

  describe("unfavoriteCompany mutation callbacks", () => {
    beforeEach(() => {
      renderHook(() => useFavoriteToggle("c1", "company"));
    });

    test("onMutate cancels, snapshots, and optimistically removes", async () => {
      const ctx = await h.opts.unfavoriteCompany.onMutate();
      expect(h.companyUtils.cancel).toHaveBeenCalled();
      expect(h.companyUtils.setData).toHaveBeenCalled();
      expect(ctx).toHaveProperty("prev");
    });

    test("onSuccess shows an unsaved toast", () => {
      h.opts.unfavoriteCompany.onSuccess();
      expect(h.toast.success).toHaveBeenCalledWith(
        "This company has been unsaved.",
      );
    });

    test("onError rolls back and toasts", () => {
      h.opts.unfavoriteCompany.onError(
        {},
        {},
        {
          prev: [{ companyId: "c1", profileId: "profile-1" }],
        },
      );
      expect(h.toast.error).toHaveBeenCalled();
    });

    test("onError without a prev context still toasts", () => {
      h.opts.unfavoriteCompany.onError({}, {}, undefined);
      expect(h.toast.error).toHaveBeenCalled();
    });

    test("onSettled invalidates the company list", async () => {
      await h.opts.unfavoriteCompany.onSettled();
      expect(h.companyUtils.invalidate).toHaveBeenCalled();
    });
  });
});
