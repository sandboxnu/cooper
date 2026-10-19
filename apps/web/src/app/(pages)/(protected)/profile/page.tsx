"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import FavoriteCompanySearch from "~/app/_components/profile/favorite-company-search";
import FavoriteRoleSearch from "~/app/_components/profile/favorite-role-search";
import ProfileCardHeader from "~/app/_components/profile/profile-card-header";
import ProfileTabs from "~/app/_components/profile/profile-tabs";
import { DraftReviewCard } from "~/app/_components/reviews/draft-review-card";
import { ProfileReviewCard } from "~/app/_components/reviews/profile-review-card";
import { ReviewViewEditModal } from "~/app/_components/reviews/review-view-edit-modal";
import { api } from "~/trpc/react";

export default function Profile() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "saved-roles";
  // ?review=<id> (from a review card's menu) opens that review in view mode
  const linkedReviewId = searchParams.get("review");
  const [linkedReviewMode, setLinkedReviewMode] = useState<"view" | "edit">(
    "view",
  );
  const router = useRouter();
  const pathname = usePathname();
  const closeLinkedReview = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("review");
    router.replace(`${pathname}?${params.toString()}`);
    setLinkedReviewMode("view");
  };

  const sessionQuery = api.auth.getSession.useQuery();
  const session = sessionQuery.data;
  const sessionLoading = sessionQuery.isLoading;
  const sessionError = sessionQuery.error;

  const profileQuery = api.profile.getCurrentUser.useQuery();
  const profile = profileQuery.data;
  const profileLoading = profileQuery.isLoading;
  const profileError = profileQuery.error;

  useEffect(() => {
    if (!sessionLoading && !profileLoading) {
      if (!session || !profile) {
        redirect("/");
      }
    }
  }, [session, profile, sessionLoading, profileLoading]);

  if (sessionError || profileError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-600">
          Error loading profile. Please try refreshing the page.
        </div>
      </div>
    );
  }

  const { data: reviews = [] } = api.review.getByProfile.useQuery(
    { id: profile?.id ?? "" },
    { enabled: !!profile?.id },
  );

  const { data: favoriteRoleIds = [] } = api.profile.listFavoriteRoles.useQuery(
    { profileId: profile?.id ?? "" },
    { enabled: !!profile?.id },
  );

  const { data: favoriteCompanyIds = [] } =
    api.profile.listFavoriteCompanies.useQuery(
      { profileId: profile?.id ?? "" },
      { enabled: !!profile?.id },
    );

  const favoriteRoleQueries = api.useQueries((t) =>
    favoriteRoleIds.map((r) =>
      t.role.getById({ id: r.roleId }, { enabled: !!r.roleId }),
    ),
  );

  const favoriteCompanyQueries = api.useQueries((t) =>
    favoriteCompanyIds.map((c) =>
      t.company.getById({ id: c.companyId }, { enabled: !!c.companyId }),
    ),
  );

  const favoriteRoles = favoriteRoleQueries
    .filter((query) => query.data)
    .map((query) => query.data)
    .filter((data): data is NonNullable<typeof data> => !!data);

  const favoriteCompanies = favoriteCompanyQueries
    .filter((query) => query.data)
    .map((query) => query.data)
    .filter((data): data is NonNullable<typeof data> => !!data);

  if (!session || !profile) {
    return null;
  }

  return (
    <div className="bg-cooper-cream-100 flex h-screen w-full justify-center overflow-auto">
      <div className="mx-4 mt-4 flex w-[80%] max-w-3xl flex-col gap-6 pt-4 md:w-[66%]">
        <div className="flex items-start justify-start gap-4">
          <Image
            src={session.user.image ?? "/svg/defaultProfile.svg"}
            width="72"
            height="72"
            alt="Logout"
            className="rounded-full"
          />
          <div className="text-start">
            <h1 className="font-hanken text-[26px] font-bold">
              {profile.firstName} {profile.lastName}
            </h1>
            {profile.graduationYear && (
              <h2 className="text-cooper-gray-400">
                Class of {profile.graduationYear}
              </h2>
            )}
          </div>
        </div>
        <ProfileCardHeader profile={profile} email={session.user.email} />
        <ProfileTabs numReviews={reviews.length} />
        {tab === "saved-roles" ? (
          <section>
            <FavoriteRoleSearch favoriteRoles={favoriteRoles} />
          </section>
        ) : tab === "saved-companies" ? (
          <section>
            <FavoriteCompanySearch favoriteCompanies={favoriteCompanies} />
          </section>
        ) : (
          <section>
            {reviews.length === 0 && (
              <div className="italic text-cooper-gray-400">No Reviews Yet</div>
            )}

            <div className="flex flex-col gap-2 pb-4">
              {reviews.length > 0 &&
                reviews
                  .sort((a, b) => {
                    const aIsDraft = a.status === "DRAFT" ? 0 : 1;
                    const bIsDraft = b.status === "DRAFT" ? 0 : 1;
                    if (aIsDraft !== bIsDraft) return aIsDraft - bIsDraft;
                    return (
                      (b.updatedAt?.getTime() ?? 0) -
                      (a.updatedAt?.getTime() ?? 0)
                    );
                  })
                  .map((review) =>
                    review.status === "DRAFT" ? (
                      <DraftReviewCard
                        key={review.id}
                        reviewObj={review}
                        className="w-[100%]"
                      />
                    ) : (
                      <ProfileReviewCard
                        key={review.id}
                        reviewObj={review}
                        className="w-[100%]"
                      />
                    ),
                  )}
            </div>
          </section>
        )}
      </div>
      {linkedReviewId && (
        <ReviewViewEditModal
          reviewId={linkedReviewId}
          mode={linkedReviewMode}
          open
          onOpenChange={(open) => !open && closeLinkedReview()}
          onModeChange={setLinkedReviewMode}
        />
      )}
    </div>
  );
}
