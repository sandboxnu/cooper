import { ReviewForm } from "~/components/review-form";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import { redirect, notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { TRPCClientError } from "@trpc/client";

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    id?: string;
  };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  if (!searchParams?.id) {
    notFound();
  }

  try {
    const role = await api.role.getById.query({
      id: searchParams.id,
    });

    const company = await api.company.getById.query({
      id: role.companyId,
    });

    const profile = await api.profile.getCurrentUser.query();

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
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg">
          <ReviewForm
            company={company}
            roleId={role.id}
            profileId={profile.id}
          />
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof TRPCClientError) {
      // Handle individual errors here
      notFound();
    }
  }
}
