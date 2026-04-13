import { Button } from "@cooper/ui/button";
import BodyLogoWhite from "../../body-logo-white";
import Link from "next/link";

interface WelcomeDialogProps {
  heading: string;
  onClick: () => void;
  isStudent: boolean;
}

export function WelcomeDialog({
  heading,
  onClick,
  isStudent,
}: WelcomeDialogProps) {
  return (
    <div className="flex items-center justify-center space-y-4">
      <div className="rounded-lg bg-white overflow-hidden flex flex-col">
        <div className="bg-cooper-blue-600 p-6 pb-0 flex flex-col items-center text-left">
          <h1 className="line-clamp-2 max-w-md text-4xl font-semibold text-white">
            {heading}
          </h1>
          <div className="w-full flex justify-end overflow-hidden">
            <BodyLogoWhite width={120} />
          </div>
        </div>
        <div className="p-6 flex justify-between items-center">
          <Button
            className="py-2 px-0 bg-transparent border-transparent hover:bg-transparent hover:border-transparent text-base font-medium text-cooper-gray-550 hover:underline"
            onClick={onClick}
          >
            Start browsing
          </Button>
          {isStudent && (
            <Link href="/review-form">
              <Button
                className=" bg-cooper-gray-550 border-cooper-gray-550 hover:bg-cooper-gray-300 hover:border-cooper-gray-300 px-3.5 py-2 text-base font-bold justify-right"
                onClick={onClick}
              >
                Leave a review
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
