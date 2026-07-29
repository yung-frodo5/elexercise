import type { AnchorHTMLAttributes } from "react";

// Opens in a new tab by default so external links (attribution, sources,
// article content, etc.) don't navigate visitors away from the site.
export function ExternalLink({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}
