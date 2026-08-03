import { describe, expect, it } from "vitest";
import { articles, getArticleBySlug } from "./articles";

describe("getArticleBySlug", () => {
  it("finds a registered article by its slug", () => {
    const [first] = articles;
    expect(getArticleBySlug(first.slug)).toBe(first);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getArticleBySlug("not-a-real-article")).toBeUndefined();
  });
});
