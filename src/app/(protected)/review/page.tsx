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
    const company = await api.company.getById.query({
      id: searchParams.id,
    });

    return (
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg">
          <ReviewForm />
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof TRPCClientError) {
      notFound();
    }
  }
}
