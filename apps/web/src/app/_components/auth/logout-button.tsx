import { signOut } from "@cooper/auth";
import { Button } from "@cooper/ui/button";

export default function LogoutButton() {
  return (
    <form>
      <Button
        className="rounded-xl border-cooper-blue-400 bg-cooper-blue-400 px-5 py-2.5 text-sm font-semibold text-white hover:border-cooper-blue-200 hover:bg-cooper-blue-200 hover:text-cooper-blue-600 focus:outline-none focus:ring-4 focus:ring-white"
        formAction={async () => {
          "use server";
          await signOut();
        }}
      >
        Sign Out
      </Button>
    </form>
  );
}
