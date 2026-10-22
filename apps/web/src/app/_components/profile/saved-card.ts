// Saved role/company cards on the profile page mirror the roles page results:
// the sidebar is 360px with px-6, so its cards are 312px wide
export const SAVED_CARD_WIDTH_CLASS = "w-full md:w-[312px]";

export function isInsideButton(event: React.MouseEvent) {
  return (
    event.target instanceof Element && !!event.target.closest("button")
  );
}
