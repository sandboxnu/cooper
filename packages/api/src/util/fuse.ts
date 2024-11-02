import Fuse from "fuse.js";

export const createFuse = (
  data: object[],
  keywords: string[],
  search: string,
) => {
  const fuseOptions = {
    keys: keywords,
  };

  const fuse = new Fuse(data, fuseOptions);

  return fuse.search(search).map((data) => data.item);
};
