import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

function requestFor(pathname: string) {
  return new NextRequest(new URL(pathname, "https://elexercise.org"));
}

describe("middleware", () => {
  it("redirects a known article slug to its canonical article path", () => {
    const response = middleware(requestFor("/how-much-power"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://elexercise.org/resources/articles/how-much-power");
  });

  it("passes through an unknown slug", () => {
    const response = middleware(requestFor("/not-a-real-article"));
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("passes through reserved top-level routes even though they aren't articles", () => {
    for (const path of ["/resources", "/history", "/leaderboard", "/profile", "/track"]) {
      const response = middleware(requestFor(path));
      expect(response.headers.get("location")).toBeNull();
    }
  });

  it("passes through multi-segment paths", () => {
    const response = middleware(requestFor("/resources/articles/how-much-power"));
    expect(response.headers.get("location")).toBeNull();
  });

  it("passes through the root path", () => {
    const response = middleware(requestFor("/"));
    expect(response.headers.get("location")).toBeNull();
  });
});
