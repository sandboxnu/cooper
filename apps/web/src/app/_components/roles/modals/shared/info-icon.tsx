"use client";

import { useState } from "react";

interface InfoIconProps {
  tooltip: React.ReactNode;
}

export function InfoIcon({ tooltip }: InfoIconProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="flex h-[15px] w-[15px] items-center justify-center rounded-full border-[1.5px] border-[#989898] text-[11px] font-semibold text-[#989898]"
        aria-label="More info"
        type="button"
      >
        i
      </button>
      {open && (
        <span className="absolute left-1/2 top-full z-10 mt-1 w-max max-w-60 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-[11px] text-white">
          {tooltip}
        </span>
      )}
    </span>
  );
}
