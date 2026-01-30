"use client";

import Image from "next/image";

import { handleGoogleSignIn } from "./actions";

export default function LoginButtonClient() {
  return (
    <form>
      <button formAction={handleGoogleSignIn} className="-pb-2 pt-2">
        <Image
          src="/svg/defaultProfile.svg"
          width="36"
          height="36"
          alt="Login"
          className="rounded-full"
        />
      </button>
    </form>
  );
}
