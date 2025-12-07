import Link from "next/link";

import { Button } from "@cooper/ui/button";

interface SubmissionFailureProps {
  message?: string; // Allow passing an optional error message
}

export function SubmissionFailure({ message }: SubmissionFailureProps) {
  return (
    <div className="flex flex-col">
      <div className="z-10 -mb-4 h-4 w-full rounded-t-xl bg-gradient-to-r from-rose-400 via-yellow-400 to-blue-600" />
      <div className="flex h-fit w-full flex-col items-center justify-center space-y-6 rounded-lg bg-white px-8 pb-8 pt-16 text-center text-cooper-blue-600 md:py-32">
        <div className="text-5xl font-bold">
          Whoops, your review is invalid...
        </div>
        <div className="max-w-3xl text-center text-2xl">
          {message ? message : "Something went wrong. Please try again."}
        </div>
        <div className="flex justify-between space-x-8">
          <Link href="/">
            <Button>Return to home </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
