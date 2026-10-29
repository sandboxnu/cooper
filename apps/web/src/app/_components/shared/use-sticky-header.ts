import { useEffect, useState } from "react";

import type { CompareStickyHeader } from "../compare/compare-context";

function findScrollParent(el: HTMLElement): HTMLElement | null {
  let parent = el.parentElement;
  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll") return parent;
    parent = parent.parentElement;
  }
  return null;
}

// Sticky header state for the nearest scrolling ancestor of rootRef (or the
// window): hidden while headerRef is still in view, compact while scrolling
// down, full while scrolling up. Matches the compare columns' behavior.
export function useStickyHeader(
  rootRef: React.RefObject<HTMLElement | null>,
  headerRef: React.RefObject<HTMLElement | null>,
) {
  const [stickyHeader, setStickyHeader] = useState<CompareStickyHeader | null>(
    null,
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scroller = findScrollParent(root);
    const target: HTMLElement | Window = scroller ?? window;
    let lastScrollTop = scroller ? scroller.scrollTop : window.scrollY;

    const handleScroll = () => {
      const scrollTop = scroller ? scroller.scrollTop : window.scrollY;
      const delta = scrollTop - lastScrollTop;
      // Ignore tiny jitters (trackpad momentum, sub-pixel scrolling)
      if (Math.abs(delta) < 4) return;
      lastScrollTop = scrollTop;

      const headerHeight = headerRef.current?.offsetHeight ?? 0;
      if (scrollTop <= headerHeight) {
        setStickyHeader(null);
      } else {
        setStickyHeader(delta > 0 ? "compact" : "full");
      }
    };

    target.addEventListener("scroll", handleScroll, { passive: true });
    return () => target.removeEventListener("scroll", handleScroll);
  }, [rootRef, headerRef]);

  return stickyHeader;
}
