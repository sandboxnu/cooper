import Image from "next/image";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="pd-3 flex w-full grid-cols-2 flex-col items-center justify-between gap-2 border-t border-t-[#919191] bg-white md:flex-row md:p-4">
      <Link
        href="https://github.com/sandboxnu/cooper"
        target="_blank"
        className="mt-1 flex items-center gap-2"
      >
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
          height={20}
          width={20}
          alt="Github Logo"
          className="mt-[-0.25rem]"
        />
        <h2 className="text-md font-semibold md:text-xl">
          Checkout cooper on GitHub
        </h2>
      </Link>
      <div className="flex flex-col items-center gap-2 md:flex-row md:gap-6">
        <Link
          href="https://docs.google.com/forms/d/e/1FAIpQLSf-ZvpyBawT5LlMho7X4oNZ0Z_1M-o6cXLJjB5uJiNAvvnkfw/viewform?usp=dialog"
          target="_blank"
          className="flex items-center gap-2"
        >
          <MessageSquare size={20} />
          <h2 className="text-sm font-semibold md:text-lg">
            Submit Feedback or Bug Reports!
          </h2>
        </Link>
        <a
          href="https://logo.dev"
          target="_blank"
          className="text-sm italic md:text-xl"
        >
          Logos provided by Logo.dev
        </a>
      </div>
    </footer>
  );
}
