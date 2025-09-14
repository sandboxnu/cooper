import Image from "next/image";
import { redirect } from "next/navigation";

import HeaderLayout from "~/app/_components/header/header-layout";
import { NewReviewDialog } from "~/app/_components/reviews/new-review/new-review-dialogue";
import { ReviewCard } from "~/app/_components/reviews/review-card";
import { api } from "~/trpc/server";

export default async function Profile() {
  const session = await api.auth.getSession();
  const profile = await api.profile.getCurrentUser();

  if (!session || !profile) {
    redirect("/");
  }

  const reviews = await api.review.getByProfile({ id: profile.id });

  return (
    <HeaderLayout>
      <div className="mx-4 mt-4 flex h-full flex-col gap-8 overflow-y-auto md:max-w-[66%] w-[45%]">
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
              Northeastern Class of {profile.graduationYear}
            </h2>
          </div>
        </div>

        <section>
          <h2 className="mb-2 text-2xl">Account Information</h2>
          <div className="flex flex-col gap-2">
            <p className="grid grid-cols-5 border-b border-t border-cooper-gray-400 p-4">
              <span className="col-span-2">Email</span>
              <span className="col-span-3 font-bold">{session.user.email}</span>
            </p>
            <p className="grid grid-cols-5 border-b border-cooper-gray-400 p-4">
              <span className="col-span-2">Major</span>
              <span className="col-span-3 font-bold">{profile.major}</span>
            </p>
            {profile.minor && (
              <p className="grid grid-cols-5 border-b border-cooper-gray-400 p-4">
                <span className="col-span-2">Minor</span>
                <span className="col-span-3 font-bold">{profile.minor}</span>
              </p>
            )}
          </div>
        </section>

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
      </div>
    </HeaderLayout>
  );
}
