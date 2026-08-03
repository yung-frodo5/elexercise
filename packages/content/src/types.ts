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
// `footnote` marks this run as the point where a numbered citation applies —
// it renders as a small superscript marker and refers to the `Reference`
// with the matching `id` in the article's `references` list (see below).
// `break` inserts a soft line break immediately after this run — the
// shift+enter of this model, for lines that belong in the same paragraph
// (no paragraph-spacing gap between them) but still need to start a new
// line, as opposed to actually splitting into separate Paragraph blocks.
export interface RichTextNode {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  href?: string;
  footnote?: number;
  break?: boolean;
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
export type GraphicKey =
  | "landing-hero"
  | "power-generation-pixii-machine"
  | "power-generation-bike-comp-no-carbon-price"
  | "power-generation-bike-comp-ca"
  | "power-generation-bike-comp-hi"
  | "power-generation-treadmill-comp";

export interface Graphic {
  type: "graphic";
  key: GraphicKey;
  alt: string;
  // Optional attribution/credit line rendered under the image, e.g. crediting
  // the source of a photo or diagram. Rich text so it can include a link.
  caption?: RichTextNode[];
}

// A bulleted list of items, each an ordered sequence of rich-text runs (same
// shape as a Paragraph's content) so a list item can include a link or bold
// text like any other body copy.
export interface List {
  type: "list";
  items: RichTextNode[][];
}

// A visually set-off bulleted highlight box (e.g. an executive summary),
// rendered on a rounded, tinted background rather than inline with the rest
// of the body — a distinct block type rather than a styling flag on `List`,
// since it changes the surrounding layout (its own padding/background), not
// just the text inside it.
export interface Callout {
  type: "callout";
  heading?: string;
  items: RichTextNode[][];
}

// An article body is an ordered, hierarchical mix of paragraphs, subtitles, graphics, lists, and callouts.
export type ArticleBodyBlock = Paragraph | Subtitle | Graphic | List | Callout;

export interface Author {
  name: string;
  title?: string;
}

// A numbered citation, rendered once in an "References" list at the end of
// the article. `id` matches the `footnote` number on the RichTextNode run(s)
// that cite it.
export interface Reference {
  id: number;
  url: string;
}

export interface Article {
  slug: string;
  title: string;
  authors: Author[];
  // Plain authored display text (e.g. "August 3rd, 2026"), not a parsed
  // date -- consistent with the rest of this package being hand-authored
  // prose rather than structured/computed data. Update it by hand whenever
  // the article's content changes; there's no automatic derivation (e.g.
  // from git history) since that would require a build step this
  // deliberately build-step-free package doesn't otherwise need.
  lastUpdated?: string;
  body: ArticleBodyBlock[];
  references?: Reference[];
}
