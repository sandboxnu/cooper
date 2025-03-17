import Image from "next/image";
import Link from "next/link";

import { Button } from "@cooper/ui/button";

export function SubmissionConfirmation() {
  return (
    <div className="flex flex-col">
      <div className="z-10 -mb-4 h-4 w-full rounded-t-xl bg-gradient-to-r from-rose-400 via-yellow-400 to-blue-600" />
      <div className="flex h-fit w-full flex-col items-center justify-center space-y-6 rounded-lg bg-white px-8 pb-8 pt-12 text-center text-cooper-blue-600 md:py-32">
        <Image
          src="./svg/verified.svg"
          width={125}
          height={125}
          alt="Verified"
        />
        <div className="text-5xl font-bold">
          Your review has been submitted!
        </div>
        <div className="max-w-3xl text-center text-2xl">
          Thank you for taking the time to submit a co-op review! Your feedback
          is highly appreciated.
        </div>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:gap-8">
          <Link href="/">
            <Button className="min-w-60">Return to home </Button>
          </Link>
          <Button variant="outline" className="min-w-60">
            {/* Redirect to the correct page to submit another review (for a different company perhaps) */}
            <Link href="/">Submit another review</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
