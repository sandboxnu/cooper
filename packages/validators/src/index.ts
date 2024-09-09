import { z } from "zod";

export const unused = z.string().describe(
  `This lib is currently not used as we use drizzle-zod for simple schemas
   But as the application grows and we need other validators to share
   with back and frontend, we can put them in here
  `,
);
