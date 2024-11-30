import Image from "next/image";

import { Button } from "@cooper/ui/button";

interface WelcomeDialogProps {
  heading: string;
  subheading: string;
  buttonText: string;
  onClick: () => void;
}

export function WelcomeDialog({
  heading,
  subheading,
  buttonText,
  onClick,
}: WelcomeDialogProps) {
  return (
    <div className="flex flex-col items-center space-y-4 text-center">
      <Image src="/logo.svg" width={150} height={150} alt="Cooper Logo" />
      <h1 className="pb-2 text-4xl font-semibold text-cooper-blue-700">
        {heading}
      </h1>
      <p className="w-3/4 text-xl font-semibold text-cooper-blue-700">
        {subheading}
      </p>
      <Button onClick={onClick}>{buttonText}</Button>
    </div>
  );
}
