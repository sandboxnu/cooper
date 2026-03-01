import { signIn } from "@cooper/auth";
import { Button } from "@cooper/ui/button";
import Image from "next/image";

export default function LoginButton() {
  return (
    <form>
      <Button
        className="rounded-lg border-[#E6E3DE] border-[1px] bg-[#fffefc] py-2 text-lg font-semibold text-[#201E19] gap-16 w-[72%] h-10 justify-start"
        formAction={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
      >
        <Image
              src="/google.png"
              width={20}
              height={20}
              alt="Google logo"
              className="p-0 ml-0"
            />
        <div>Log in with Husky email</div>
      </Button>
    </form>
  );
}
