import type { TRPCRouterRecord } from "@trpc/server";

import { eq, sql } from "@cooper/db";
import { Review, ReviewsToTools, Tool } from "@cooper/db/schema";
import { Status } from "@cooper/db/schema";

import { publicProcedure } from "../trpc";

export const toolRouter = {
  getCommon: publicProcedure.query(({ ctx }) => {
    return ctx.db
      .select({
        id: Tool.id,
        name: Tool.name,
        count: sql<number>`count(${ReviewsToTools.reviewId})`,
      })
      .from(Tool)
      .innerJoin(ReviewsToTools, eq(Tool.id, ReviewsToTools.toolId))
      .innerJoin(Review, eq(ReviewsToTools.reviewId, Review.id))
      .where(eq(Review.status, Status.PUBLISHED))
      .groupBy(Tool.id, Tool.name)
      .having(sql`count(${ReviewsToTools.reviewId}) >= 2`);
  }),
} satisfies TRPCRouterRecord;
