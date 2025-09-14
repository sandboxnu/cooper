import { api } from "~/trpc/react";

type ObjType = "role" | "company" | "review";

export function useFavoriteToggle(objId: string, objType: ObjType) {
  const utils = api.useUtils();

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
    review: api.profile.listFavoriteReviews.useQuery(
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
      : objType === "company"
        ? list.some(
            (c): c is { companyId: string; profileId: string } =>
              "companyId" in c && c.companyId === objId,
          )
        : list.some(
            (r): r is { reviewId: string; profileId: string } =>
              "reviewId" in r && r.reviewId === objId,
          );

  const invalidate = () => {
    const invalidateFn = {
      role: () => utils.profile.listFavoriteRoles.invalidate({ profileId }),
      company: () =>
        utils.profile.listFavoriteCompanies.invalidate({ profileId }),
      review: () => utils.profile.listFavoriteReviews.invalidate({ profileId }),
    };
    return invalidateFn[objType]();
  };

  const setData = (updateFn: (list: any[]) => any[]) => {
    const setter = {
      role: () =>
        utils.profile.listFavoriteRoles.setData({ profileId }, updateFn),
      company: () =>
        utils.profile.listFavoriteCompanies.setData({ profileId }, updateFn),
      review: () =>
        utils.profile.listFavoriteReviews.setData({ profileId }, updateFn),
    };
    return setter[objType]();
  };

  const getData = () => {
    const getter = {
      role: () => utils.profile.listFavoriteRoles.getData({ profileId }),
      company: () => utils.profile.listFavoriteCompanies.getData({ profileId }),
      review: () => utils.profile.listFavoriteReviews.getData({ profileId }),
    };
    return getter[objType]() ?? [];
  };

  const favoriteMutations = {
    role: api.profile.favoriteRole.useMutation({
      onMutate: async () => {
        await utils.profile.listFavoriteRoles.cancel({ profileId });
        const prev = getData();
        setData((old) => [...old, { profileId, roleId: objId }]);
        return { prev };
      },
      onError: (_err, _vars, ctx) => {
        ctx?.prev && setData(() => ctx.prev);
      },
      onSettled: invalidate,
    }),
    company: api.profile.favoriteCompany.useMutation({
      onMutate: async () => {
        await utils.profile.listFavoriteCompanies.cancel({ profileId });
        const prev = getData();
        setData((old) => [...old, { profileId, companyId: objId }]);
        return { prev };
      },
      onError: (_err, _vars, ctx) => {
        ctx?.prev && setData(() => ctx.prev);
      },
      onSettled: invalidate,
    }),
    review: api.profile.favoriteReview.useMutation({
      onMutate: async () => {
        await utils.profile.listFavoriteReviews.cancel({ profileId });
        const prev = getData();
        setData((old) => [...old, { profileId, reviewId: objId }]);
        return { prev };
      },
      onError: (_err, _vars, ctx) => {
        ctx?.prev && setData(() => ctx.prev);
      },
      onSettled: invalidate,
    }),
  };

  const unfavoriteMutations = {
    role: api.profile.unfavoriteRole.useMutation({
      onMutate: async () => {
        await utils.profile.listFavoriteRoles.cancel({ profileId });
        const prev = getData();
        setData((old) => old.filter((r) => r.roleId !== objId));
        return { prev };
      },
      onError: (_err, _vars, ctx) => {
        ctx?.prev && setData(() => ctx.prev);
      },
      onSettled: invalidate,
    }),
    company: api.profile.unfavoriteCompany.useMutation({
      onMutate: async () => {
        await utils.profile.listFavoriteCompanies.cancel({ profileId });
        const prev = getData();
        setData((old) => old.filter((c) => c.companyId !== objId));
        return { prev };
      },
      onError: (_err, _vars, ctx) => {
        ctx?.prev && setData(() => ctx.prev);
      },
      onSettled: invalidate,
    }),
    review: api.profile.unfavoriteReview.useMutation({
      onMutate: async () => {
        await utils.profile.listFavoriteReviews.cancel({ profileId });
        const prev = getData();
        setData((old) => old.filter((r) => r.reviewId !== objId));
        return { prev };
      },
      onError: (_err, _vars, ctx) => {
        ctx?.prev && setData(() => ctx.prev);
      },
      onSettled: invalidate,
    }),
  };

  const toggle = () => {
    if (!profileId) return;
    if (isFavorited) {
      unfavoriteMutations[objType].mutate({
        profileId,
        [`${objType}Id`]: objId,
      });
    } else {
      favoriteMutations[objType].mutate({ profileId, [`${objType}Id`]: objId });
    }
  };

  return {
    isFavorited,
    toggle,
    isLoading: favoriteLists[objType].isLoading,
  };
}
