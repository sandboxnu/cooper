import { Button } from "../ui/button";
import Image from "next/image";

export function WelcomePage() {
  return (
    <div className="flex flex-col border-2">
      <div className="z-10 -mb-4 h-4 w-full rounded-t-xl bg-cooper-blue-700" />
      <div className="flex h-[80vh] w-full items-center justify-center rounded-xl bg-white pl-24 pr-4 text-cooper-blue-600">
        <div className="flex w-1/2 flex-col space-y-6">
          <h1 className="text-4xl font-semibold text-cooper-blue-700">
            Submit a Co-op Review!
          </h1>
          <p className="text-2xl text-cooper-blue-700">
            Thank you for taking the time to leave a review of your co-op
            experience! Join others in the Northeastern community and help
            people like yourself make the right career decision.
          </p>
          <Button className="w-1/2">Start a review</Button>
        </div>
        <Image
          src="/svg/logo.svg"
          alt="Co-op Review Logo"
          width={650}
          height={650}
        />
      </div>
    </div>
  );
}
