import type { Config } from "tailwindcss";

import base from "@cooper/tailwind-config/base";

export default {
  content: base.content,
  presets: [base],
  theme: {},
} satisfies Config;
