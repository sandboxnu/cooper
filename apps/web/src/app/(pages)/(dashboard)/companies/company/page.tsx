"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { cn } from "@cooper/ui";

import LoadingResults from "~/app/_components/loading-results";
import NoResults from "~/app/_components/no-results";
import { RoleCardPreview } from "~/app/_components/reviews/role-card-preview";
import { api } from "~/trpc/react";

export default function Company() {
  const searchParams = useSearchParams();
  const companyID = searchParams.get("id"); // Get 'id' from the URL

  const company = api.company.getById.useQuery({ id: companyID ?? "" });
  const roles = api.role.getByCompany.useQuery({ companyId: companyID ?? "" });

  useEffect(() => {
    console.log("Company ID:", companyID); // Debugging: Check if id is retrieved correctly
  }, [companyID]);

  return (
    <>
      <div className="mx-auto h-[86dvh] w-full max-w-4xl gap-4 font-sans">
        {/* Company Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-md">
              <Image
                src={`https://logo.clearbit.com/${company.data?.name.replace(/\s/g, "")}.com`}
                width={75}
                height={75}
                alt={`Logo of ${company.data?.name}`}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">{company.data?.name}</h1>
              <p className="text-sm text-gray-600">
                Co-op · {company.data?.industry}
              </p>
            </div>
          </div>
          <button className="text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        </div>

        {/* Info Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* About Section */}
          <div className="rounded-lg border border-gray-200 p-4">
            {/* Card Header with Gray Background */}
            <div className="-mx-4 -mt-4 mb-3 rounded-t-lg bg-gray-100 p-4">
              <h2 className="text-sm font-semibold">
                About {company.data?.name}
              </h2>
            </div>

            {/* Card Content */}
            <p className="text-xs text-gray-600">{company.data?.description}</p>
          </div>

          {/* Reviews Section */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="-mx-4 -mt-4 mb-3 rounded-t-lg bg-gray-100 p-4">
              <h2 className="text-sm font-semibold">Reviews</h2>
            </div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Overall rating</p>
              <div className="flex items-center">
                <p className="mr-2 text-2xl font-bold">5.0</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="h-4 w-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="mb-3 text-xs text-gray-500">
              Based on {company.data?.totalReviews ?? 0} reviews
            </p>

            {/* Rating Bars */}
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center">
                  <span className="mr-2 w-4 text-right text-xs">{rating}</span>
                  <div className="h-2 flex-grow overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-yellow-400"
                      style={{
                        width:
                          rating === 5
                            ? "80%"
                            : rating === 4
                              ? "15%"
                              : rating === 3
                                ? "5%"
                                : "2%",
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p>Job Postings</p>
        {roles.isSuccess && roles.data.length > 0 ? (
          <div className="mb-8 grid h-[40dvh] w-full grid-cols-1 gap-3 overflow-auto p-1 md:grid-cols-2 xl:grid-cols-3">
            {roles.data.map((role) => {
              return (
                <div key={role.id} className="p-2">
                  <RoleCardPreview
                    reviewObj={role}
                    className={cn("mb-4 hover:bg-cooper-gray-100")}
                  />
                </div>
              );
            })}
          </div>
        ) : roles.isSuccess && roles.data.length === 0 ? (
          <NoResults />
        ) : roles.isPending ? (
          <LoadingResults />
        ) : null}
      </div>
    </>
  );
}
