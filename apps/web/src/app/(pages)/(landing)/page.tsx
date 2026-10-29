import Image from "next/image";
import AdminSignInButton from "~/app/_components/auth/admin-signin-button";
import LoginButton from "~/app/_components/auth/login-button";
import { AdminAccessToast } from "~/app/_components/landing/admin-access-toast";

const textOptions = [
  "Insights on interviews, pay, and job experience",
  "Side-by-side comparison view of up to three jobs",
  "Anonymous reviews to protect identities",
];

export default function Landing() {
  return (
    <div className="flex w-full flex-col bg-cooper-cream-100 lg:flex-row overflow-auto lg:overflow-hidden h-full flex-1">
      <AdminAccessToast />
      {/* left side */}{" "}
      {/* old classes: w-full lg:w-[40%] flex flex-col pl-20 lg:pl-16 pr-6 lg:pr-28 justify-center pt-8 md:pt-2 lg:pt-0 */}
      <div className="w-full px-[2rem] pt-20 lg:w-[40%] flex flex-col lg:pl-16 lg:pr-28 justify-center md:pt-2 lg:pt-0">
        {/* main text */}
        <div className="flex w-fit flex-row items-center gap-2">
          <div className="text-cooper-blue-800 text-[40px] leading-[48px] font-semibold">
            Real reviews of <br />
            <span className="font-black">real co-op experiences</span>
          </div>
        </div>
        <div className="w-fit pt-8">
          <LoginButton />
          <div className="text-cooper-gray-600 text-md pt-4 w-fit">
            Log in with husky.neu.edu email to access reviews
          </div>
          <AdminSignInButton />
          <hr />
        </div>
        {/* blue checkmark text */}
        <div className="pt-6 text-cooper-gray-550 font-lg flex flex-col gap-3">
          {textOptions.map((option) => {
            return (
              <div key={option} className="flex flex-row gap-2 items-start">
                <Image
                  src="/svg/blueCheck.svg"
                  width={11}
                  height={9}
                  alt="Blue check"
                  className="mt-2"
                />
                <div>{option}</div>
              </div>
            );
          })}
        </div>
      </div>
      {/* image */}
      <div className="justify-end pt-20 pr-10 hidden md:block">
        <Image
          src="/landing-page-image-new.png"
          width={880}
          height={784}
          alt="Landing picture"
          className="cooper-gray-400 shadow-[0_0_24px_rgba(0,0,0,0.08)] rounded-lg"
        />
      </div>
    </div>
  );
}
