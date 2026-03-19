import { signIn } from "@cooper/auth";
import Image from "next/image";
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
      <div className="lg:w-[43%] flex flex-col pl-16 pr-28 justify-center pt-2 lg:pt-0">
        <div className="flex w-fit flex-row items-center gap-2">
          <div className="text-cooper-blue-800 text-[40px] leading-[48px] font-semibold">
            <div>Real reviews of </div>
            <span className="font-black italic">real co-op experiences</span>
          </div>
        </div>
        <div className="w-fit pt-8">
          <LoginButton />
          <div className="text-cooper-gray-600 text-md pt-4 w-fit">
            Log in with husky.neu.edu email to access reviews
          </div>
          <form>
            <button
              type="submit"
              formAction={async () => {
                "use server";
                await signIn("googleAdmin", { redirectTo: "/roles" });
              }}
              className="text-cooper-gray-600 font-bold text-md pb-6 pt-2 w-fit cursor-pointer hover:underline"
            >
              Or continue as admin / coordinator
            </button>
          </form>
          <hr />
        </div>

        <div className="pt-6 text-cooper-gray-550 font-lg flex flex-col gap-3">
          {textOptions.map((option) => {
            return (
              <div className="flex flex-row gap-2">
                <Image
                  src="/svg/blueCheck.svg"
                  width={11}
                  height={9}
                  alt="Blue check"
                />
                <div>{option}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="justify-end">
        <Image
          src="/landing-page-image.png"
          width={880}
          height={784}
          alt="Landing picture"
          className="pt-20"
        />
      </div>
    </div>
  );
}
