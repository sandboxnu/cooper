"use client";

import { useState } from "react";
import Image from "next/image";

import { useFavoriteToggle } from "./useFavoriteToggle";

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

  const src =
    hover && !isFavorited
      ? "/svg/hoverBookmark.svg"
      : isFavorited
        ? "/svg/filledBookmark.svg"
        : "/svg/bookmark.svg";

  return (
    <button
      className="group relative inline-flex h-6 w-6 items-center justify-center rounded-full transition"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={toggle}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-cooper-gray-150 opacity-0 shadow-[0_0_0_10px_rgb(231,231,231)] transition-opacity group-hover:opacity-100" />
      <Image
        src={src}
        alt="Bookmark icon"
        width={13}
        height={19}
        style={{ minWidth: "13px", minHeight: "19px" }}
        className={`relative z-10 cursor-pointer ${isLoading ? "opacity-50" : ""} `}
      />
    </button>
  );
}
