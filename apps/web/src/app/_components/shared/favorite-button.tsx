"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { api } from "~/trpc/react";

interface FavoriteButtonProps {
  objId: string;
  objType: "role" | "company" | "review";
}

// export function FavoriteButton({ objId, objType }: FavoriteButtonProps) {
//   const { data: profile } = api.profile.getCurrentUser.useQuery();
//   const profileId = profile?.id ?? "";

//   const { data: favoriteRoles } = api.profile.listFavoriteRoles.useQuery(
//     { profileId },
//     { enabled: !!profileId },
//   );
//   const { data: favoriteCompanies } =
//     api.profile.listFavoriteCompanies.useQuery(
//       { profileId },
//       { enabled: !!profileId },
//     );
//   const { data: favoriteReviews } = api.profile.listFavoriteReviews.useQuery(
//     { profileId },
//     { enabled: !!profileId },
//   );

//   const roleFavorite = api.profile.favoriteRole.useMutation();
//   const reviewFavorite = api.profile.favoriteReview.useMutation();
//   const companyFavorite = api.profile.favoriteCompany.useMutation();

//   const roleUnfavorite = api.profile.unfavoriteRole.useMutation();
//   const reviewUnfavorite = api.profile.unfavoriteReview.useMutation();
//   const companyUnfavorite = api.profile.unfavoriteCompany.useMutation();

//   const [isFavorited, setIsFavorited] = useState(false);

//   useEffect(() => {
//     if (!profileId) return;

//     if (objType === "role") {
//       setIsFavorited(favoriteRoles?.some((r) => r.roleId === objId) ?? false);
//     } else if (objType === "company") {
//       setIsFavorited(
//         favoriteCompanies?.some((c) => c.companyId === objId) ?? false,
//       );
//     } else {
//       setIsFavorited(
//         favoriteReviews?.some((r) => r.reviewId === objId) ?? false,
//       );
//     }
//   }, [
//     favoriteRoles,
//     favoriteCompanies,
//     favoriteReviews,
//     objId,
//     objType,
//     profileId,
//   ]);

//   const handleToggleFavorite = () => {
//     if (!profileId) return;

//     setIsFavorited((prev) => !prev);

//     if (isFavorited) {
//       if (objType === "role") {
//         roleUnfavorite.mutate({ profileId, roleId: objId });
//       } else if (objType === "company") {
//         companyUnfavorite.mutate({ profileId, companyId: objId });
//       } else {
//         reviewUnfavorite.mutate({ profileId, reviewId: objId });
//       }
//     } else {
//       if (objType === "role") {
//         roleFavorite.mutate({ profileId, roleId: objId });
//       } else if (objType === "company") {
//         companyFavorite.mutate({ profileId, companyId: objId });
//       } else {
//         reviewFavorite.mutate({ profileId, reviewId: objId });
//       }
//     }
//   };

//   return (
//     <Image
//       src={isFavorited ? "/svg/filledBookmark.svg" : "/svg/bookmark.svg"}
//       alt="Bookmark icon"
//       width={13}
//       height={19}
//       className="cursor-pointer"
//       onClick={handleToggleFavorite}
//     />
//   );
// }

export function FavoriteButton({ objId, objType }: FavoriteButtonProps) {
  const utils = api.useUtils();

  const { data: profile } = api.profile.getCurrentUser.useQuery();
  const profileId = profile?.id ?? "";

  const { data: favoriteRoles } = api.profile.listFavoriteRoles.useQuery(
    { profileId },
    { enabled: !!profileId },
  );
  const { data: favoriteCompanies } =
    api.profile.listFavoriteCompanies.useQuery(
      { profileId },
      { enabled: !!profileId },
    );
  const { data: favoriteReviews } = api.profile.listFavoriteReviews.useQuery(
    { profileId },
    { enabled: !!profileId },
  );

  const roleFavorite = api.profile.favoriteRole.useMutation({
    onSuccess: () => utils.profile.listFavoriteRoles.invalidate({ profileId }),
  });
  const reviewFavorite = api.profile.favoriteReview.useMutation({
    onSuccess: () =>
      utils.profile.listFavoriteReviews.invalidate({ profileId }),
  });
  const companyFavorite = api.profile.favoriteCompany.useMutation({
    onSuccess: () =>
      utils.profile.listFavoriteCompanies.invalidate({ profileId }),
  });

  const roleUnfavorite = api.profile.unfavoriteRole.useMutation({
    onSuccess: () => utils.profile.listFavoriteRoles.invalidate({ profileId }),
  });
  const reviewUnfavorite = api.profile.unfavoriteReview.useMutation({
    onSuccess: () =>
      utils.profile.listFavoriteReviews.invalidate({ profileId }),
  });
  const companyUnfavorite = api.profile.unfavoriteCompany.useMutation({
    onSuccess: () =>
      utils.profile.listFavoriteCompanies.invalidate({ profileId }),
  });

  const alreadyFavorited = useMemo(() => {
    if (!profileId) return false;

    const lookup = {
      role: favoriteRoles?.some((r) => r.roleId === objId),
      company: favoriteCompanies?.some((c) => c.companyId === objId),
      review: favoriteReviews?.some((r) => r.reviewId === objId),
    };

    return lookup[objType] ?? false;
  }, [
    objType,
    objId,
    favoriteRoles,
    favoriteCompanies,
    favoriteReviews,
    profileId,
  ]);

  const handleToggleFavorite = () => {
    if (!profileId) return;

    if (alreadyFavorited) {
      if (objType === "role") {
        roleUnfavorite.mutate({ profileId, roleId: objId });
      } else if (objType === "company") {
        companyUnfavorite.mutate({ profileId, companyId: objId });
      } else {
        reviewUnfavorite.mutate({ profileId, reviewId: objId });
      }
    } else {
      if (objType === "role") {
        roleFavorite.mutate({ profileId, roleId: objId });
      } else if (objType === "company") {
        companyFavorite.mutate({ profileId, companyId: objId });
      } else {
        reviewFavorite.mutate({ profileId, reviewId: objId });
      }
    }
  };

  return (
    <div>
      <Image
        src={alreadyFavorited ? "/svg/filledBookmark.svg" : "/svg/bookmark.svg"}
        alt="Bookmark icon"
        width={13}
        height={19}
        className="cursor-pointer"
        onClick={handleToggleFavorite}
      />
    </div>
  );
}
