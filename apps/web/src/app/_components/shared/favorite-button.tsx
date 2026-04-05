"use client";

import { useState } from "react";
import Image from "next/image";

import { useFavoriteToggle } from "./useFavoriteToggle";

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

  const src =
    hover && !isFavorited
      ? "/svg/hoverBookmark.svg"
      : isFavorited
        ? "/svg/filledBookmark.svg"
        : "/svg/bookmark.svg";

  return (
    <button
      className="hover:bg-[rgb(231,231,231)] rounded-full transition px-3 py-2"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={toggle}
    >
      <Image
        src={src}
        alt="Bookmark icon"
        width={13}
        height={19}
        style={{ minWidth: "13px", minHeight: "19px" }}
        className={`cursor-pointer ${isLoading ? "opacity-50" : ""} `}
      />
    </button>
  );
}
