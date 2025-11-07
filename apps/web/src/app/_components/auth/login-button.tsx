import { signIn } from "@cooper/auth";
import { Button } from "@cooper/ui/button";

export default function LoginButton() {
  return (
    <form className="flex">
      <Button
        className="h-9 rounded-lg border-none border-cooper-yellow-500 bg-cooper-yellow-500 px-3 py-2 text-sm font-semibold text-white hover:border-cooper-yellow-300 hover:bg-cooper-yellow-300"
        formAction={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
      >
        <span className="hidden md:inline">Log in</span>
      </Button>
    </form>
  );
}
