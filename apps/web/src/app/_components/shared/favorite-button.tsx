"use client";

import Image from "next/image";

import { useFavoriteToggle } from "./useFavoriteToggle";
import { useState } from "react";

interface FavoriteButtonProps {
  objId: string;
  objType: "role" | "company";
}

interface FavoriteButtonProps {
  objId: string;
  objType: "role" | "company";
}

export function FavoriteButton({ objId, objType }: FavoriteButtonProps) {
  const { isFavorited, toggle, isLoading, profileId } = useFavoriteToggle(
    objId,
    objType,
  );

    const [hover, setHover] = useState(false);

  if (!profileId) return null;

  const src = hover && !isFavorited
    ? "/svg/hoverBookmark.svg"
    : isFavorited
    ? "/svg/filledBookmark.svg"
    : "/svg/bookmark.svg";

  return (
    <Image
      src={src}
      alt="Bookmark icon"
      width={13}
      height={19}
      className={`cursor-pointer ${isLoading ? "opacity-50" : ""}`}
      onClick={toggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    />
  );
}
