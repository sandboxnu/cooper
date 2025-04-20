import Image from "next/image";

import { signIn } from "@cooper/auth";

export default function LoginButton() {
  return (
    <form>
      <button
        formAction={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
        className="-pb-2 pt-2"
      >
        <Image
          src="/svg/defaultProfile.svg"
          width="36"
          height="36"
          alt="Logout"
          className="rounded-full"
        />
      </button>
    </form>
  );
}
