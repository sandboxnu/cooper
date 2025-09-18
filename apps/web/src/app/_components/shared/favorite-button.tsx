"use client";

import Image from "next/image";

import { useFavoriteToggle } from "./useFavoriteToggle";

interface FavoriteButtonProps {
  objId: string;
  objType: "role" | "company" | "review";
}

interface FavoriteButtonProps {
  objId: string;
  objType: "role" | "company" | "review";
}

export function FavoriteButton({ objId, objType }: FavoriteButtonProps) {
  const { isFavorited, toggle, isLoading } = useFavoriteToggle(objId, objType);

  return (
    <Image
      src={isFavorited ? "/svg/filledBookmark.svg" : "/svg/bookmark.svg"}
      alt="Bookmark icon"
      width={13}
      height={19}
      className={`cursor-pointer ${isLoading ? "opacity-50" : ""}`}
      onClick={toggle}
    />
  );
}
