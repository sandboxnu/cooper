"use client";

import React, { useEffect, useState } from "react";

export function ScreenSizeIndicator() {
  const [screenSize, setScreenSize] = useState<string>("");

  useEffect(() => {
    const updateScreenSize = () => {
      if (window.matchMedia("(min-width: 1536px)").matches) {
        setScreenSize("2xl");
      } else if (window.matchMedia("(min-width: 1280px)").matches) {
        setScreenSize("xl");
      } else if (window.matchMedia("(min-width: 1024px)").matches) {
        setScreenSize("lg");
      } else if (window.matchMedia("(min-width: 768px)").matches) {
        setScreenSize("md");
      } else if (window.matchMedia("(min-width: 640px)").matches) {
        setScreenSize("sm");
      } else {
        setScreenSize("xs");
      }
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);

    return () => {
      window.removeEventListener("resize", updateScreenSize);
    };
  }, []);

  return (
    <div className="fixed left-0 top-0 z-50 m-2 rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-lg">
      Screen: {screenSize}
    </div>
  );
}
