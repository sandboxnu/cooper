import { useCustomToast } from "@cooper/ui/hooks/use-custom-toast";
import { api } from "~/trpc/react";

type ObjType = "role" | "company";

export function useFavoriteToggle(objId: string, objType: ObjType) {
  const utils = api.useUtils();
  const { toast } = useCustomToast();

  const { data: profile } = api.profile.getCurrentUser.useQuery();
  const profileId = profile?.id ?? "";

  const favoriteLists = {
    role: api.profile.listFavoriteRoles.useQuery(
      { profileId },
      { enabled: !!profileId },
    ),
    company: api.profile.listFavoriteCompanies.useQuery(
      { profileId },
      { enabled: !!profileId },
    ),
  };

  const list = favoriteLists[objType].data ?? [];

  const isFavorited =
    objType === "role"
      ? list.some(
          (r): r is { roleId: string; profileId: string } =>
            "roleId" in r && r.roleId === objId,
        )
      : list.some(
          (c): c is { companyId: string; profileId: string } =>
            "companyId" in c && c.companyId === objId,
        );
  const invalidate = () => {
    const invalidateFn = {
      role: () => utils.profile.listFavoriteRoles.invalidate({ profileId }),
      company: () =>
        utils.profile.listFavoriteCompanies.invalidate({ profileId }),
    };
    return invalidateFn[objType]();
  };

  // Type-safe setData for each object type
  const setData = {
    role: (
      updateFn: (
        list: { roleId: string; profileId: string }[] | undefined,
      ) => { roleId: string; profileId: string }[] | undefined,
    ) => utils.profile.listFavoriteRoles.setData({ profileId }, updateFn),
    company: (
      updateFn: (
        list: { profileId: string; companyId: string }[] | undefined,
      ) => { profileId: string; companyId: string }[] | undefined,
    ) => utils.profile.listFavoriteCompanies.setData({ profileId }, updateFn),
  };

  const getData = () => {
    const getter = {
      role: () => utils.profile.listFavoriteRoles.getData({ profileId }) ?? [],
      company: () =>
        utils.profile.listFavoriteCompanies.getData({ profileId }) ?? [],
    };
    return getter[objType]();
  };

  const favoriteMutations = {
    role: api.profile.favoriteRole.useMutation({
      onMutate: async () => {
        await utils.profile.listFavoriteRoles.cancel({ profileId });
        const prev = getData();
        setData.role((old) => [...(old ?? []), { profileId, roleId: objId }]);
        return { prev };
      },
      onSuccess: () => {
        toast.success("This role has been saved.");
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.prev) {
          setData.role(() =>
            Array.isArray(ctx.prev)
              ? ctx.prev.filter(
                  (r): r is { roleId: string; profileId: string } =>
                    "roleId" in r,
                )
              : [],
          );
        }
        toast.error("Oops. Please try again.");
      },
      onSettled: invalidate,
    }),
    company: api.profile.favoriteCompany.useMutation({
      onMutate: async () => {
        await utils.profile.listFavoriteCompanies.cancel({ profileId });
        const prev = getData();
        setData.company((old) => [
          ...(old ?? []),
          { profileId, companyId: objId },
        ]);
        return { prev };
      },
      onSuccess: () => {
        toast.success("This company has been saved.");
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.prev) {
          setData.company(() =>
            Array.isArray(ctx.prev)
              ? ctx.prev.filter(
                  (c): c is { companyId: string; profileId: string } =>
                    "companyId" in c,
                )
              : [],
          );
        }
        toast.error("Oops. Please try again.");
      },
      onSettled: invalidate,
    }),
  };

  const unfavoriteMutations = {
    role: api.profile.unfavoriteRole.useMutation({
      onMutate: async () => {
        await utils.profile.listFavoriteRoles.cancel({ profileId });
        const prev = getData();
        setData.role((old) => (old ?? []).filter((r) => r.roleId !== objId));
        return { prev };
      },
      onSuccess: () => {
        toast.success("This role has been unsaved.");
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.prev) {
          setData.role(() =>
            Array.isArray(ctx.prev)
              ? ctx.prev.filter(
                  (r): r is { roleId: string; profileId: string } =>
                    "roleId" in r,
                )
              : [],
          );
        }
        toast.error("Oops. Please try again.");
      },
      onSettled: invalidate,
    }),
    company: api.profile.unfavoriteCompany.useMutation({
      onMutate: async () => {
        await utils.profile.listFavoriteCompanies.cancel({ profileId });
        const prev = getData();
        setData.company((old) =>
          (old ?? []).filter((c) => c.companyId !== objId),
        );
        return { prev };
      },
      onSuccess: () => {
        toast.success("This company has been unsaved.");
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.prev) {
          setData.company(() =>
            Array.isArray(ctx.prev)
              ? ctx.prev.filter(
                  (c): c is { companyId: string; profileId: string } =>
                    "companyId" in c,
                )
              : [],
          );
        }
        toast.error("Oops. Please try again.");
      },
      onSettled: invalidate,
    }),
  };

  const toggle = () => {
    if (!profileId) return;
    if (isFavorited) {
      if (objType === "role") {
        unfavoriteMutations.role.mutate({ profileId, roleId: objId });
      } else {
        unfavoriteMutations.company.mutate({ profileId, companyId: objId });
      }
    } else {
      if (objType === "role") {
        favoriteMutations.role.mutate({ profileId, roleId: objId });
      } else {
        favoriteMutations.company.mutate({ profileId, companyId: objId });
      }
    }
  };

  return {
    isFavorited,
    toggle,
    isLoading: favoriteLists[objType].isLoading,
    profileId,
  };
}
