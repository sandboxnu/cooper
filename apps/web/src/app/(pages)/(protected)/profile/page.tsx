"use client";

import Image from "next/image";
import { redirect } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "node_modules/@cooper/ui/src/card";
import { Button } from "node_modules/@cooper/ui/src/button";
import ProfileCardHeader from "~/app/_components/profile/profile-card-header";

import HeaderLayoutClient from "~/app/_components/header/header-layout-client";
import FavoriteCompanySearch from "~/app/_components/profile/favorite-company-search";
import FavoriteRoleSearch from "~/app/_components/profile/favorite-role-search";
import ProfileTabs from "~/app/_components/profile/profile-tabs";
import { NewReviewDialog } from "~/app/_components/reviews/new-review/new-review-dialogue";
import { ReviewCard } from "~/app/_components/reviews/review-card";
import { api } from "~/trpc/react";

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
      <div className="flex items-center justify-center min-h-screen">
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
    <HeaderLayoutClient>
      <div className="bg-cooper-cream-100 w-full min-h-screen flex justify-center">
        <div className="mx-4 mt-4 flex h-full flex-col gap-6 overflow-y-auto md:max-w-[66%] w-[66%] pt-4">
          <div className="flex items-start justify-start gap-4">
            <Image
              src={session.user.image ?? "/svg/defaultProfile.svg"}
              width="72"
              height="72"
              alt="Logout"
              className="rounded-full"
            />
            <div className="text-start">
              <h1 className="font-bold text-[26px] font-hanken">
                {profile.firstName} {profile.lastName}
              </h1>
              <h2 className="text-cooper-gray-400">
                Class of {profile.graduationYear}
              </h2>
            </div>
          </div>
          <Card>
            <div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <CardTitle className="text-xl">
                        Account Information
                      </CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="m-4 items-center grid grid-cols-3 grid-rows-2 gap-4">
                  <div className="flex flex-col text-sm">
                    <h4 className="font-semibold">Name</h4>
                    <p>
                      {profile.firstName} {profile.lastName}
                    </p>
                  </div>
                  <div className="flex flex-col text-sm">
                    <h4 className="font-semibold">Email</h4>
                    <p> {session.user.email} </p>
                  </div>
                  <div className="flex flex-col text-sm">
                    <h4 className="font-semibold">Major</h4>
                    <p> {profile.major} </p>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
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
                  <NewReviewDialog trigger="+" />
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
    </HeaderLayoutClient>
  );
}
