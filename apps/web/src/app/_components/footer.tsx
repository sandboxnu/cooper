import Image from "next/image";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="flex h-20 w-full grid-cols-2 flex-col items-center justify-between border-t border-t-[#919191] bg-white px-4 md:flex-row">
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
      <div className="flex flex-col items-center md:flex-row md:gap-6">
        <Link href="____" target="_blank" className="flex items-center gap-2">
          <MessageSquare size={20} />
          <h2 className="text-lg font-semibold">
            Submit Feedback or Bug Reports!
          </h2>
        </Link>
        <a href="https://clearbit.com" target="_blank" className="italic">
          Logos provided by Clearbit
        </a>
      </div>
    </footer>
  );
}
