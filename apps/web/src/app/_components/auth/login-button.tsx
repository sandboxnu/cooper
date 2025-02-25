import { signIn } from "@cooper/auth";
import { Button } from "@cooper/ui/button";

export default function LoginButton() {
  return (
    <form>
      <Button
        className="rounded-lg border-none bg-cooper-yellow-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cooper-yellow-300 hover:text-white focus:outline-none focus:ring-4 focus:ring-white"
        formAction={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
      >
        Sign In
      </Button>
    </form>
  );
}
