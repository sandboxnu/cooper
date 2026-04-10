import { signIn } from "@cooper/auth";
import { Button } from "@cooper/ui/button";
import Image from "next/image";

export default function LoginButton() {
  return (
    <form>
      <Button
        className="relative flex h-10 w-full justify-start gap-3 rounded-lg border border-[#E6E3DE] bg-[#fffefc] py-2.5 pl-3 text-lg font-semibold text-[#201E19] hover:bg-cooper-cream-400"
        formAction={async () => {
          "use server";
          await signIn("google", { redirectTo: "/roles" });
        }}
      >
        <Image
          src="/google.png"
          width={20}
          height={20}
          alt="Google logo"
          className="p-0 ml-0 shrink-0"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          Log in with Husky email
        </div>
      </Button>
    </form>
  );
}
