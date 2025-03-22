import { notFound } from "next/navigation";

import { ReviewForm } from "~/app/_components/form/review-form";
import { api } from "~/trpc/server";

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    id?: string;
  };
}) {
  // Ensure role ID is provided
  if (!searchParams?.id) {
    notFound();
  }

  try {
    const role = await api.role.getById({
      id: searchParams.id,
    });

    if (role == null) {
      notFound();
    }

    const company = await api.company.getById({
      id: role.companyId,
    });

    if (company == null) {
      notFound();
    }

    const profile = await api.profile.getCurrentUser();

    if (profile == null) {
      // TODO: Redirect to profile creation page
      return (
        <div className="flex h-screen items-center justify-center">
          <p className="text-xl font-semibold text-red-700">
            You must create a profile first.
          </p>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center bg-cooper-blue-200">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <ReviewForm
            company={company}
            roleId={role.id}
            profileId={profile.id}
          />
        </div>
      </div>
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Handle individual errors here
    notFound();
  }
}
