import Fuse from "fuse.js";

export function performFuseSearch<T>(
  elem: T[],
  options: string[],
  searchQuery: string | undefined,
): T[] {
  if (!searchQuery) {
    return elem;
  }

  const fuseOptions = {
    keys: options,
    threshold: 0.2, // Stricter matching so only close matches are returned
  };

  const fuse = new Fuse(elem, fuseOptions);
  return fuse.search(searchQuery).map((result) => result.item);
}
