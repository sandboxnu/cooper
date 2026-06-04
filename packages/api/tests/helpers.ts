import { vi } from "vitest";

import type { Session } from "@cooper/auth";

/**
 * A Drizzle query-builder is chainable (`db.select().from().where()...`) and
 * thenable (it resolves when awaited). This builds a stand-in: every builder
 * method returns the same object, and awaiting it resolves to `result`.
 */
export function chain<T>(result: T) {
  const builder: Record<string, unknown> = {};
  const methods = [
    "select",
    "from",
    "leftJoin",
    "innerJoin",
    "where",
    "groupBy",
    "having",
    "orderBy",
    "limit",
    "offset",
    "values",
    "set",
    "returning",
    "onConflictDoNothing",
    "onConflictDoUpdate",
  ];
  for (const method of methods) {
    builder[method] = vi.fn(() => builder);
  }
  (builder as { then: unknown }).then = (resolve: (value: T) => unknown) =>
    resolve(result);
  return builder as Record<string, ReturnType<typeof vi.fn>> & PromiseLike<T>;
}

const baseUser = {
  emailVerified: true,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isDisabled: false,
};

const baseSession = {
  id: "session-1",
  token: "test-token",
  expiresAt: new Date(Date.now() + 3600 * 1000),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const studentSession = {
  session: { ...baseSession, userId: "user-1" },
  user: {
    ...baseUser,
    id: "user-1",
    email: "student@husky.neu.edu",
    name: "Student User",
    role: "STUDENT",
  },
} as Session;

export const adminSession = {
  session: { ...baseSession, userId: "admin-1" },
  user: {
    ...baseUser,
    id: "admin-1",
    email: "admin@husky.neu.edu",
    name: "Admin User",
    role: "ADMIN",
  },
} as Session;
