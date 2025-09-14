import Image from "next/image";

import HeaderLayout from "~/app/_components/header/header-layout";
import BackButton from "./_components/back-button";

export default function NotFound() {
  return (
    <HeaderLayout>
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-[14rem] font-bold leading-none text-cooper-blue-600 sm:hidden">
          404
        </h1>
        <div className="flex max-sm:hidden">
          <h1 className="text-[14rem] font-bold leading-none text-cooper-blue-600">
            4
          </h1>
          <Image
            src="/svg/deadLogo.svg"
            width={224}
            height={224}
            alt="404 Picture"
          />
          <h1 className="text-[14rem] font-bold leading-none text-cooper-blue-600">
            4
          </h1>
        </div>
        <h2 className="mb-3 mt-6 text-4xl font-bold text-cooper-blue-600">
          Page Not Found
        </h2>
        <h2 className="mb-6 text-cooper-blue-600 max-sm:hidden">
          We can’t seem to find the page you are looking for
        </h2>
        <BackButton />
      </div>
    </HeaderLayout>
  );
}
