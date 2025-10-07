import Image from "next/image";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "node_modules/@cooper/ui/src/card";

import HeaderLayout from "~/app/_components/header/header-layout";
import FavoriteCompanySearch from "~/app/_components/profile/favorite-company-search";
import FavoriteRoleSearch from "~/app/_components/profile/favorite-role-search";
import ProfileTabs from "~/app/_components/profile/profile-tabs";
import { NewReviewDialog } from "~/app/_components/reviews/new-review/new-review-dialogue";
import { ReviewCard } from "~/app/_components/reviews/review-card";
import { api } from "~/trpc/server";

interface Props {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Profile({ searchParams }: Props) {
  const session = await api.auth.getSession();
  const profile = await api.profile.getCurrentUser();
  const params = await searchParams;
  const tab = params?.tab ?? "saved-roles";

  if (!session || !profile) {
    redirect("/");
  }

  const reviews = await api.review.getByProfile({ id: profile.id });
  const favoriteRoleIds = await api.profile.listFavoriteRoles({
    profileId: profile.id,
  });
  const favoriteCompanyIds = await api.profile.listFavoriteCompanies({
    profileId: profile.id,
  });

  const favoriteRoles = await Promise.all(
    favoriteRoleIds.map((r) => api.role.getById({ id: r.roleId })),
  );

  const favoriteCompanies = await Promise.all(
    favoriteCompanyIds.map((c) => api.company.getById({ id: c.companyId })),
  );

  return (
    <HeaderLayout>
      <div className="bg-[#F7F6F2] w-full min-h-screen flex justify-center">
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
            <div className="flex flex-row">
            {reviews.length === 0 && <div className="flex w-full items-center justify-start gap-2 italic text-cooper-gray-400">
                  No Reviews Yet
                </div>}
              <div className="flex items-center justify-end">
                <NewReviewDialog trigger={"+"} />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {reviews.length > 0 && (
                reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    reviewObj={review}
                    className="w-[100%]"
                  />
                ))
              ) }
            </div>
          </section>
        )}
      </div>
      </div>
    </HeaderLayout>
  );
}
