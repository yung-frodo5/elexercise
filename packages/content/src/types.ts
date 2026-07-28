// Article content model shared by apps/web and apps/mobile. Plain data/types,
// no rendering logic — same split as design-tokens (theme data lives here,
// each app renders it with its own platform-native components).
//
// Rich text is a flat run with style flags, rather than a discriminated
// union of text/bold/link variants — a discriminant can't express a run
// that's simultaneously bold AND italic (or bold AND a link) without a
// combinatorial explosion of variants. `href` present means the run is a
// link (implicitly underlined); `bold`/`italic`/`underline` compose freely
// with it and with each other.
export interface RichTextNode {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  href?: string;
}

// A paragraph is an ordered sequence of mixed inline rich-text runs.
export interface Paragraph {
  type: "paragraph";
  content: RichTextNode[];
}

// A subtitle is a paragraph rendered larger, e.g. a tagline/definition
// directly under the title — a distinct block type rather than styling
// "the first paragraph" by array position, so it stays meaningful if body
// order ever changes.
export interface Subtitle {
  type: "subtitle";
  content: RichTextNode[];
}

// Graphics are referenced by a known key, never a binary or a URL — each app
// keeps its own actual image file and maps this key to it locally (see
// lib/content/graphicAssets.ts in apps/web and apps/mobile). Adding a key
// here without a matching entry on both platforms fails typecheck there.
export type GraphicKey = "landing-hero";

export interface Graphic {
  type: "graphic";
  key: GraphicKey;
  alt: string;
}

// An article body is an ordered, hierarchical mix of paragraphs, subtitles, and graphics.
export type ArticleBodyBlock = Paragraph | Subtitle | Graphic;

export interface Author {
  name: string;
  title?: string;
}

export interface Article {
  slug: string;
  title: string;
  authors: Author[];
  body: ArticleBodyBlock[];
}
