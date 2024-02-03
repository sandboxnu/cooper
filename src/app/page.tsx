import { getServerAuthSession } from "~/server/auth";

export default async function Home() {
  const session = await getServerAuthSession();

  if (!session) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-2">
        <p className="text-3xl font-semibold text-red-500">
          You are not signed in!
        </p>
        <p>Click Here</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-2">
      <p className="text-3xl font-semibold text-emerald-500">
        Welcome, {session.user.name}!
      </p>
    </div>
  );
}
