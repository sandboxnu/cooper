import { beforeEach, describe, expect, test, vi } from "vitest";

const h = vi.hoisted(() => ({
  fetchRequestHandler: vi.fn(),
  toNextJsHandler: vi.fn(() => ({ GET: vi.fn(), POST: vi.fn() })),
  getSession: vi.fn(),
  auth: {},
}));

vi.mock("@trpc/server/adapters/fetch", () => ({
  fetchRequestHandler: h.fetchRequestHandler,
}));
vi.mock("better-auth/next-js", () => ({ toNextJsHandler: h.toNextJsHandler }));
vi.mock("@cooper/api", () => ({
  appRouter: {},
  createTRPCContext: vi.fn(),
}));
vi.mock("@cooper/auth", () => ({
  auth: { api: { getSession: h.getSession } },
}));

describe("api/auth/[...all] route", () => {
  test("exposes GET and POST handlers from better-auth", async () => {
    const route = await import("~/app/api/auth/[...all]/route");
    expect(route.GET).toBeTypeOf("function");
    expect(route.POST).toBeTypeOf("function");
    expect(h.toNextJsHandler).toHaveBeenCalled();
  });
});

describe("api/trpc/[trpc] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("OPTIONS responds 204 with permissive CORS headers", async () => {
    const route = await import("~/app/api/trpc/[trpc]/route");
    const res = route.OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe(
      "OPTIONS, GET, POST",
    );
  });

  test("GET delegates to fetchRequestHandler and sets CORS headers", async () => {
    h.fetchRequestHandler.mockResolvedValue(new Response("ok"));
    const route = await import("~/app/api/trpc/[trpc]/route");

    const res = await route.GET(new Request("http://localhost/api/trpc"));

    expect(h.fetchRequestHandler).toHaveBeenCalledOnce();
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});
