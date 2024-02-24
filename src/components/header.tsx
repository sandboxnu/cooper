import LoginButton from "./login-button";
import LogoutButton from "./logout-button";

export default async function Header() {
  return (
    <header className="flex h-16 w-full items-center justify-between bg-accent p-4">
      <h1 className="text-2xl font-extrabold text-white">COOPER</h1>
      <LoginButton />
      <LogoutButton />
    </header>
  );
}
