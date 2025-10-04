import { cn } from "@cooper/ui";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "node_modules/@cooper/ui/src/card";
import { CompanyCardPreview } from "~/app/_components/companies/company-card-preview";

import HeaderLayout from "~/app/_components/header/header-layout";
import ProfileTabs from "~/app/_components/profile/profile-tabs";
import { NewReviewDialog } from "~/app/_components/reviews/new-review/new-review-dialogue";
import { ReviewCard } from "~/app/_components/reviews/review-card";
import { RoleCardPreview } from "~/app/_components/reviews/role-card-preview";
import { api } from "~/trpc/server";

type Props = {
  searchParams:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | undefined;
};

export default async function Profile({ searchParams }: Props) {
  const session = await api.auth.getSession();
  const profile = await api.profile.getCurrentUser();
  const params = await searchParams;
  const tab = params?.tab || "saved-roles";

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
      <div className="mx-4 mt-4 flex h-full flex-col gap-8 overflow-y-auto md:max-w-[66%] w-[66%]">
        <div className="flex items-end justify-start gap-4">
          <Image
            src={session.user.image ?? "/svg/defaultProfile.svg"}
            width="72"
            height="72"
            alt="Logout"
            className="rounded-full"
          />
          <div className="text-start">
            <h1 className="text-2xl font-bold">
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
            <CardContent className="">
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
                  <h4 className="font-semibold">Phone number</h4>
                  <p> phone number goes here </p>
                </div>
                <div className="flex flex-col text-sm">
                  <h4 className="font-semibold">College</h4>
                  <p> college goes here </p>
                </div>
                <div className="flex flex-col text-sm">
                  <h4 className="font-semibold">Major</h4>
                  <p> {profile.major} </p>
                </div>
                <div className="flex flex-col text-sm">
                  <h4 className="font-semibold">Joined</h4>
                  <p> joined date </p>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
        <ProfileTabs numReviews={reviews.length} />
        {tab === "saved-roles" ? (
          <section>
            <h2 className="mb-2 text-2xl">Saved Roles</h2>
            <div className="mx-1 flex-col gap-4 grid  grid-cols-3">
              {favoriteRoles.length > 0 ? (
                favoriteRoles
                  .filter(
                    (role): role is NonNullable<typeof role> =>
                      role !== undefined,
                  )
                  .map((role) => (
                    <RoleCardPreview key={role.id} roleObj={role} />
                  ))
              ) : (
                <p className="italic text-cooper-gray-400">
                  No saved roles yet.
                </p>
              )}
            </div>
          </section>
        ) : tab === "saved-companies" ? (
          <section>
            <h2 className="mb-2 text-2xl">Saved Companies</h2>
            <div className="mx-1 flex-col gap-4 grid grid-cols-3">
              {favoriteCompanies.length > 0 ? (
                favoriteCompanies
                  .filter(
                    (company): company is NonNullable<typeof company> =>
                      company !== undefined,
                  )
                  .map((company) => <CompanyCardPreview companyObj={company} />)
              ) : (
                <p className="italic text-cooper-gray-400">
                  No saved companies yet.
                </p>
              )}
            </div>
          </section>
        ) : (
          <section>
            <div className="flex items-center justify-between">
              <h2 className="mb-2 flex text-2xl">My Reviews</h2>
              <NewReviewDialog trigger={"+"} />
            </div>

            <div className="flex flex-col gap-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    reviewObj={review}
                    className="w-[100%]"
                  />
                ))
              ) : (
                <div className="flex w-full items-center justify-start gap-2 italic text-cooper-gray-400">
                  No Reviews Yet
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </HeaderLayout>
  );
}
