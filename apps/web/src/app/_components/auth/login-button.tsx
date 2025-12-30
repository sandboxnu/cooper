import Image from "next/image";
import { signIn } from "@cooper/auth";
import { Button } from "@cooper/ui/button";

export default function LoginButton() {
  return (
    <>
      {/* Image for small screens */}
      <form className="flex md:hidden">
        <button
          type="submit"
          formAction={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
          className="rounded-full"
        >
          <Image
            src="/svg/defaultProfile.svg"
            width={36}
            height={36}
            alt="Login"
            className="rounded-full"
          />
        </button>
      </form>

      {/* Button for larger screens */}
      <form className="hidden md:flex">
        <Button
          className="h-9 rounded-lg border-none border-cooper-yellow-500 bg-cooper-yellow-500 px-3 py-2 text-sm font-semibold text-white hover:border-cooper-yellow-700 hover:bg-cooper-yellow-700"
          formAction={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <span>Log in</span>
        </Button>
      </form>
    </>
  );
}
