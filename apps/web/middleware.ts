import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getArticleBySlug } from "@exercise-tracker/content";

const RESERVED_TOP_LEVEL_SEGMENTS = new Set(["resources", "history", "leaderboard", "profile", "track"]);

export function middleware(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);

  if (segments.length !== 1) {
    return NextResponse.next();
  }

  const [slug] = segments;
  if (RESERVED_TOP_LEVEL_SEGMENTS.has(slug) || slug.includes(".")) {
    return NextResponse.next();
  }

  const article = getArticleBySlug(slug);
  if (!article) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(`/resources/articles/${slug}`, request.url), 308);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
