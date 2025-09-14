"use client";

import { useRouter } from "next/navigation";

import { Button } from "@cooper/ui/button";

export default function BackButton() {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={() => router.back()}
      className="my-1 border-black text-cooper-blue-600"
    >
      Go Back
    </Button>
  );
}
