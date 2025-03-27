import HeaderLayout from "~/app/_components/header-layout";

export default function NotFound() {
  return (
    <HeaderLayout>
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-4xl font-semibold">404 - Page Not Found</h1>
        <Image
          src="/svg/hidingLogo.svg"
          alt="Co-op Review Logo"
          width={400}
          height={100}
          className="max-w-full xl:hidden"
        />
        <h1 className="text-4xl font-semibold">404 - Page Not Found</h1>
      </div>
    </HeaderLayout>
  );
}
//router.back for back button
//client component
//make button a server component
