import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";

export function SubmissionConfirmation() {
  return (
    <div className="flex flex-col border-2">
      <div className="z-10 -mb-4 h-4 w-full rounded-t-xl bg-gradient-to-r from-blue-400 via-lime-600 to-rose-300" />
      <div className="flex h-full w-full flex-col items-center justify-center space-y-6 rounded-xl bg-white px-8 py-32 text-cooper-blue-600">
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
        <div className="flex justify-between space-x-8">
          <Link href="/">
            <Button>Return to home </Button>
          </Link>
          <Button variant="outline">Submit another review</Button>
        </div>
      </div>
    </div>
  );
}
