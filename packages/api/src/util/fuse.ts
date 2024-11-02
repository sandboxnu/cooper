import Fuse from "fuse.js";

import type { ReviewType } from "@cooper/db/schema";

export const createFuse = (
  data: ReviewType[],
  keywords: string[],
  search: string,
) => {
  const fuseOptions = {
    keys: keywords,
  };

  const fuse = new Fuse(data, fuseOptions);

  return fuse.search(search).map((data) => data.item);
};
