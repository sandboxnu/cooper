import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount React trees between tests so queries don't leak across cases.
afterEach(() => {
  cleanup();
});
