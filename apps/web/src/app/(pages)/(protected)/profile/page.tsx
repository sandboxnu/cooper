"use client";

import { useEffect } from "react";
import Image from "next/image";
import { redirect, useSearchParams } from "next/navigation";
import ProfileCardHeader from "~/app/_components/profile/profile-card-header";

import FavoriteCompanySearch from "~/app/_components/profile/favorite-company-search";
import FavoriteRoleSearch from "~/app/_components/profile/favorite-role-search";
import ProfileTabs from "~/app/_components/profile/profile-tabs";
import { ReviewCard } from "~/app/_components/reviews/review-card";
import { api } from "~/trpc/react";
import { Button } from "@cooper/ui/button";
import Link from "next/link";

export default function Profile() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "saved-roles";

  const {
    data: session,
    isLoading: sessionLoading,
    error: sessionError,
  } = api.auth.getSession.useQuery();
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = api.profile.getCurrentUser.useQuery();

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
      t.role.getById({ id: String(r.roleId) }, { enabled: !!r.roleId }),
    ),
  );

  console.log("companies ", favoriteCompanyIds);
  console.log("roles ", favoriteRoleIds);

  const favoriteCompanyQueries = api.useQueries((t) =>
    favoriteCompanyIds.map((c) =>
      t.company.getById(
        { id: String(c.companyId) },
        { enabled: !!c.companyId },
      ),
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
    <div className="bg-cooper-cream-100 w-full h-screen flex justify-center">
      <div className="mx-4 mt-4 flex flex-col gap-6 md:max-w-[66%] w-[66%] pt-4">
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
            <h2 className="text-cooper-gray-400">
              Class of {profile.graduationYear}
            </h2>
          </div>
        </div>
        <ProfileCardHeader profile={profile} email={session.user.email ?? ""} />
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
            <div className="flex flex-row items-center justify-between">
              {reviews.length === 0 ? (
                <div className="italic text-cooper-gray-400">
                  No Reviews Yet
                </div>
              ) : (
                <div />
              )}

              <div>
                <Link href="/review-form">
                  <Button className="bg-cooper-cream-100 hover:bg-cooper-cream-100 m-0 -mt-2 border-none p-0 text-3xl font-thin text-black outline-none">
                    +
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {reviews.length > 0 &&
                reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    reviewObj={review}
                    className="w-[100%]"
                  />
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
