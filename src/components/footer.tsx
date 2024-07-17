import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="flex h-20 w-full grid-cols-2 items-center justify-between border-t border-t-[#919191] bg-white px-4">
      <Link
        href="https://github.com/sandboxnu/cooper"
        target="_blank"
        className="flex items-center gap-2"
      >
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
          height={20}
          width={20}
          alt="Github Logo"
          className="mt-[-0.25rem]"
        />
        <h2 className="text-xl font-semibold">Checkout cooper on GitHub</h2>
      </Link>
    </footer>
  );
}
